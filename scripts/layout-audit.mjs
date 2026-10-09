/**
 * Geometric layout audit: measures the real boxes in the rendered page and
 * flags inconsistent gutters, misaligned columns, and broken vertical rhythm.
 *   node scripts/layout-audit.mjs [url]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://127.0.0.1:4100/preview/7313b9060c7b/";
const width = Number(process.argv[3] ?? 1440);
const port = 9700 + Math.floor(Math.random() * 90);
const profile = mkdtempSync(join(tmpdir(), "layout-"));

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
    /* retry */
  }
  if (!wsUrl) await sleep(200);
}
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
const ev = async (expression) => {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? "eval failed");
  return result.value;
};

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 700 });
await send("Page.navigate", { url });
await sleep(2300);
for (let y = 0; y < 9000; y += 800) {
  await ev(`window.scrollTo(0, ${y})`);
  await sleep(80);
}
await ev("window.scrollTo(0, 0)");
await sleep(400);

const raw = await ev(`(() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      left: Math.round(r.left),
      right: Math.round(r.right),
      top: Math.round(r.top + window.scrollY),
      bottom: Math.round(r.bottom + window.scrollY),
      width: Math.round(r.width),
      height: Math.round(r.height),
      padTop: parseFloat(s.paddingTop),
      padBottom: parseFloat(s.paddingBottom),
      padLeft: parseFloat(s.paddingLeft),
      padRight: parseFloat(s.paddingRight),
    };
  };
  const centered = (el) => {
    let n = el;
    while (n) {
      if (getComputedStyle(n).textAlign === 'center') return true;
      n = n.parentElement;
    }
    return false;
  };
  const sections = [...document.querySelectorAll('section[id]')].map((s) => {
    const rail = s.querySelector(':scope > div[class*="max-w-"]');
    const railBox = box(rail);
    return {
      id: s.id,
      box: box(s),
      rail: railBox,
      // Where the rail's own padding puts the content: the expected gutter.
      contentLeft: railBox ? railBox.left + railBox.padLeft : null,
      railIsCentered: rail ? centered(rail) : false,
      blocks: [...(rail ? rail.children : [])].filter((c) => !centered(c)).map(box),
      heading: box(s.querySelector('h2')),
    };
  });
  return JSON.stringify({ sections, docHeight: document.documentElement.scrollHeight });
})()`);

const { sections, docHeight } = JSON.parse(raw);
const issues = [];

console.log(`--- layout audit @ ${width}px (page ${docHeight}px) ---`);

// Left-aligned sections must share one content gutter.
const gutters = new Map();

for (const s of sections) {
  if (s.railIsCentered || s.rail === null) {
    console.log(`${s.id.padEnd(12)} centered rail — alignment not applicable`);
    continue;
  }
  const top = s.box.top;
  for (const b of s.blocks) {
    console.log(
      `${s.id.padEnd(12)} block y ${String(b.top - top).padStart(4)}-${String(b.bottom - top).padStart(4)} ` +
        `left ${String(b.left).padStart(4)} w ${b.width}`,
    );
  }
  console.log(
    `${s.id.padEnd(12)} y ${String(s.box.top).padStart(5)}-${String(s.box.bottom).padStart(5)} ` +
      `h ${String(s.box.height).padStart(4)}  pad ${s.box.padTop}/${s.box.padBottom}  ` +
      `rail ${s.rail.left}->${s.rail.right} content (+pad) ${s.contentLeft}`,
  );

  if (s.blocks.length === 0) continue;

  const gutter = Math.min(...s.blocks.map((b) => b.left));
  gutters.set(gutter, [...(gutters.get(gutter) ?? []), s.id]);

  if (gutter !== s.contentLeft) {
    issues.push(`${s.id}: content starts at ${gutter} but the rail's padded content box starts at ${s.contentLeft}`);
  }

  // Blocks that share vertical space must not overlap horizontally.
  const sorted = [...s.blocks].sort((a, b) => a.left - b.left);
  for (let i = 1; i < sorted.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = sorted[j];
      const b = sorted[i];
      const vOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      const hOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      if (vOverlap && hOverlap > 1) {
        issues.push(`${s.id}: two content blocks overlap (left ${a.left} / ${b.left})`);
      }
    }
  }
}

// Section padding should come from a small set (hero may differ intentionally).
const pads = [...new Set(sections.map((s) => `${s.box.padTop}/${s.box.padBottom}`))];
if (pads.length > 2) issues.push(`inconsistent section padding: ${pads.join(", ")}`);

// Adjacent sections must not overlap.
for (let i = 1; i < sections.length; i++) {
  if (sections[i].box.top < sections[i - 1].box.bottom - 1) {
    issues.push(`${sections[i - 1].id} overlaps ${sections[i].id}`);
  }
}

// One shared gutter across all left-aligned sections.
if (gutters.size > 1) {
  const detail = [...gutters.entries()].map(([g, ids]) => `${g}px (${ids.join(", ")})`).join("; ");
  issues.push(`left-aligned sections use different gutters: ${detail}`);
}

console.log(issues.length ? "\nissues:" : "\nno layout issues");
issues.forEach((i) => console.log(`  - ${i}`));

ws.close();
chrome.kill();
await sleep(300);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* harmless */
}
