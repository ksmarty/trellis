/**
 * Layout + contrast audit in the running preview.
 *   node scripts/audit.mjs [url] [width]
 * Flags: text overlapping other text, elements clipped outside the viewport,
 * text below 12px, and text with a contrast ratio under 4.5:1.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://127.0.0.1:4100/preview/7313b9060c7b/";
const width = Number(process.argv[3] ?? 1440);
const port = 9900 + Math.floor(Math.random() * 90);
const profile = mkdtempSync(join(tmpdir(), "audit-"));

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
await sleep(2400);
for (let y = 0; y < 9000; y += 800) {
  await ev(`window.scrollTo(0, ${y})`);
  await sleep(90);
}
await ev("window.scrollTo(0, 0)");
await sleep(400);

const audit = await ev(`(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.6) return c;
      n = n.parentElement;
    }
    return { r: 5, g: 6, b: 10, a: 1 };
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const textNodes = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,dt,dd,label,input')]
    .filter((el) => {
      const t = (el.innerText || el.placeholder || '').trim();
      if (!t) return false;
      // Gradient/clipped text reports transparent — contrast can't be sampled.
      if (String(el.className).includes('bg-clip-text') || String(el.className).includes('bg-gradient')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < document.body.scrollHeight;
    });

  const lowContrast = [];
  const tiny = [];
  const boxes = [];

  for (const el of textNodes) {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.5) continue;
    const fs = parseFloat(s.fontSize);
    const fg = parse(s.color);
    if (!fg || fg.a < 1) continue;
    const bg = bgOf(el);
    const cr = ratio(fg, bg);
    if (cr < 4.5) {
      lowContrast.push({ text: (el.innerText || el.placeholder || '').trim().slice(0, 38), cls: String(el.className).slice(0, 40), ratio: Math.round(cr * 100) / 100, size: fs });
    }
    if (fs < 12) tiny.push({ text: (el.innerText || '').trim().slice(0, 30), size: fs, cls: String(el.className).slice(0, 40) });
    const r = el.getBoundingClientRect();
    boxes.push({ el, r });
  }

  // Text-vs-text overlap (ignoring ancestors/descendants of each other).
  const overlaps = [];
  const leaf = boxes.filter(({ el }) => !boxes.some(({ el: o }) => o !== el && el.contains(o)));
  for (let i = 0; i < leaf.length; i++) {
    for (let j = i + 1; j < leaf.length; j++) {
      const a = leaf[i], b = leaf[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.el.closest('.marquee-mask') || b.el.closest('.marquee-mask')) continue;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ox > 6 && oy > 6) {
        overlaps.push({
          a: (a.el.innerText || '').trim().slice(0, 28),
          b: (b.el.innerText || '').trim().slice(0, 28),
          area: Math.round(ox * oy),
        });
      }
    }
  }

  return JSON.stringify({
    lowContrast: lowContrast.sort((x, y) => x.ratio - y.ratio).slice(0, 12),
    tiny,
    overlaps: overlaps.sort((x, y) => y.area - x.area).slice(0, 8),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  });
})()`);

const data = JSON.parse(audit);
console.log(`--- audit @ ${width}px ---`);
console.log("horizontal overflow:", data.overflow, "px");
console.log("text under 12px:", data.tiny.length);
if (data.tiny.length) console.log(JSON.stringify(data.tiny.slice(0, 8), null, 1));
console.log("text overlapping text:", data.overlaps.length);
if (data.overlaps.length) console.log(JSON.stringify(data.overlaps, null, 1));
console.log("contrast below 4.5:1:", data.lowContrast.length);
if (data.lowContrast.length) console.log(JSON.stringify(data.lowContrast, null, 1));

ws.close();
chrome.kill();
await sleep(300);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* harmless */
}
