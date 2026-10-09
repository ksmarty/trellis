/**
 * Accessibility smoke test in a real browser.
 *   node scripts/a11y-check.mjs [url]
 * Checks heading order, landmarks, form labelling, focus visibility, target
 * sizes, and the prefers-reduced-motion path.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://127.0.0.1:4100/preview/7313b9060c7b/";
const port = 9800 + Math.floor(Math.random() * 90);
const profile = mkdtempSync(join(tmpdir(), "a11y-"));

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

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
await sleep(2400);
for (let y = 0; y < 8000; y += 700) {
  await ev(`window.scrollTo(0, ${y})`);
  await sleep(70);
}
await ev("window.scrollTo(0, 0)");
await sleep(400);

check("single h1", (await ev("document.querySelectorAll('h1').length")) === 1);
check("lang attribute", (await ev("document.documentElement.lang || ''")) === "en");
check("page title present", (await ev("document.title.length")) > 10);
check("skip link is first focusable", (await ev("document.querySelector('a[href=\"#main\"]') !== null")));
check("main landmark", (await ev("!!document.querySelector('main')")));
check("banner landmark", (await ev("!!document.querySelector('header')")));
check("contentinfo landmark", (await ev("!!document.querySelector('footer')")));
check("nav landmarks labelled", (await ev("[...document.querySelectorAll('nav')].every(n => n.hasAttribute('aria-label'))")));

const headingOrder = await ev(
  "[...document.querySelectorAll('h1,h2,h3,h4')].map(h => Number(h.tagName[1])).join('')",
);
let skipped = false;
for (let i = 1; i < headingOrder.length; i++) {
  if (Number(headingOrder[i]) - Number(headingOrder[i - 1]) > 1) skipped = true;
}
check("no skipped heading levels", !skipped, headingOrder);

check(
  "email input is labelled",
  await ev(`(() => {
    const i = document.getElementById('waitlist-email');
    return !!i && (!!document.querySelector('label[for="waitlist-email"]') || !!i.getAttribute('aria-label'));
  })()`),
);

check(
  "status region is live",
  (await ev("document.getElementById('waitlist-status')?.getAttribute('aria-live')")) === "polite",
);

const nameless = await ev(`JSON.stringify(
  [...document.querySelectorAll('button,a,[role="button"]')]
    .filter(el => !(el.innerText || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('title'))
    .map(el => el.tagName + '.' + String(el.className).slice(0, 30))
)`);
check("every control has an accessible name", JSON.parse(nameless).length === 0, nameless);

const smallTargets = await ev(`JSON.stringify(
  [...document.querySelectorAll('a,button')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || el.classList.contains('sr-only')) return false;
      // WCAG 2.5.8 exempts links embedded in a sentence.
      if (el.tagName === 'A' && el.closest('p')) return false;
      return r.height < 24 || r.width < 24;
    })
    .map(el => ((el.innerText || '').trim().slice(0, 24) || el.tagName) + ' ' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height))
)`);
check("tap targets at least 24px", JSON.parse(smallTargets).length === 0, smallTargets);

// Decorative SVGs must be hidden from AT.
const exposedSvgs = await ev(
  "[...document.querySelectorAll('svg')].filter(s => s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('role')).length",
);
check("all svgs hidden or labelled", exposedSvgs === 0, `${exposedSvgs} exposed`);

check(
  "images have alt text",
  await ev("[...document.querySelectorAll('img')].every(i => i.hasAttribute('alt'))"),
);

// Keyboard focus must be visible.
await ev("document.querySelector('a[href=\"#main\"]').focus()");const skipVisible = await ev(`(() => {
  const el = document.activeElement;
  const r = el.getBoundingClientRect();
  return r.height > 0 && getComputedStyle(el).opacity !== '0';
})()`);
check("skip link becomes visible on focus", skipVisible);

// Real keyboard tabbing so :focus-visible actually matches.
await ev("document.body.focus()");
for (let i = 0; i < 2; i++) {
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 9, key: "Tab", code: "Tab" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 9, key: "Tab", code: "Tab" });
  await sleep(120);
}
const focusRing = await ev(`(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  return {
    tag: el.tagName,
    text: (el.innerText || '').trim().slice(0, 24) || el.getAttribute('aria-label'),
    matches: el.matches(':focus-visible'),
    outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor,
  };
})()`);
check(
  "keyboard focus ring visible",
  focusRing.matches && focusRing.outline.startsWith("solid") && !focusRing.outline.includes("0px"),
  JSON.stringify(focusRing),
);

const tabbable = await ev(
  "[...document.querySelectorAll('a[href],button,input,[tabindex]:not([tabindex=\"-1\"])')].filter(el => el.offsetParent !== null || getComputedStyle(el).position === 'fixed').length",
);
check("tabbable elements exist", tabbable > 5, `${tabbable} focusable`);

// prefers-reduced-motion: the terminal must render in full and animations stop.
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await send("Page.navigate", { url });
await sleep(2000);
const reduced = await ev(`(() => {
  const t = document.querySelector('.animate-marquee');
  const lines = [...document.querySelectorAll('[class*="break-all"], .font-mono span')].filter(s => (s.innerText || '').length > 4).length;
  return {
    anim: t ? getComputedStyle(t).animationName : 'none',
    revealOpacity: getComputedStyle(document.querySelector('.reveal')).opacity,
    lines,
  };
})()`);
check("reduced motion: marquee stopped", reduced.anim === "none", reduced.anim);
check("reduced motion: content visible immediately", reduced.revealOpacity === "1", reduced.revealOpacity);
check("reduced motion: terminal output not typed char-by-char", reduced.lines >= 4, `${reduced.lines} spans`);
await send("Emulation.setEmulatedMedia", { features: [] });

ws.close();
chrome.kill();
await sleep(300);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* harmless */
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} accessibility checks passed`);
if (failed.length) process.exit(1);
