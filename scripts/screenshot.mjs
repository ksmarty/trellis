/**
 * Full-page screenshot helper: scrolls the whole page first so every
 * IntersectionObserver reveal has fired, then captures beyond the viewport.
 *   node scripts/screenshot.mjs <out.png> [url] [width] [scale]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const out = process.argv[2] ?? "shot.png";
const url = process.argv[3] ?? "http://127.0.0.1:4100/preview/7313b9060c7b/";
const width = Number(process.argv[4] ?? 1440);
const scale = Number(process.argv[5] ?? 1);
// Optional region capture: <y> <height> — omit for the whole page.
const clipY = process.argv[6] === undefined ? null : Number(process.argv[6]);
const clipH = process.argv[7] === undefined ? null : Number(process.argv[7]);

const port = 9334 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},1000`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {
    /* not up */
  }
  if (!wsUrl) await sleep(200);
}
if (!wsUrl) throw new Error("devtools endpoint never came up");

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("ws failed"));
});

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
const evaluate = async (expression) => {
  const { result } = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return result.value;
};

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height: 1000,
  deviceScaleFactor: scale,
  mobile: width < 700,
});
await send("Page.navigate", { url });
await sleep(2200);

// Walk down the page so every reveal fires, then come back up.
const height = await evaluate("document.documentElement.scrollHeight");
for (let y = 0; y < height; y += 700) {
  await evaluate(`window.scrollTo(0, ${y})`);
  await sleep(110);
}
await evaluate("window.scrollTo(0, document.body.scrollHeight)");
await sleep(600);
await evaluate("window.scrollTo(0, 0)");
await sleep(500);

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  optimizeForSpeed: false,
  ...(clipY !== null && clipH !== null
    ? { clip: { x: 0, y: clipY, width, height: clipH, scale: 1 } }
    : {}),
});
writeFileSync(out, Buffer.from(data, "base64"));
console.log(
  `${out} written (${width}px wide, page height ${height}px${clipY !== null ? `, clipped y${clipY}+${clipH}` : ""})`,
);

ws.close();
chrome.kill();
await sleep(400);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* harmless */
}
