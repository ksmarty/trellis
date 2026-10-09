/**
 * Headless browser check against the running dev server. Uses the Chrome
 * DevTools Protocol directly (no extra dependencies):
 *   node scripts/browser-check.mjs [url]
 * Fails on console errors, page exceptions, failed requests, or broken
 * interactive behaviour.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://127.0.0.1:4100/preview/7313b9060c7b/";
const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(200);
  }
  throw new Error("chromium devtools endpoint never came up");
}

const wsUrl = await targetUrl();
const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = () => reject(new Error("devtools websocket failed"));
});

let id = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  }
  if (msg.method === "Runtime.exceptionThrown") {
    pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
  if (msg.method === "Network.loadingFailed" && !msg.params.canceled) {
    failedRequests.push(msg.params.errorText);
  }
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? "evaluate failed");
  return result.value;
};

await send("Runtime.enable");
await send("Network.enable");
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(2500);

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const title = await evaluate("document.title");
check("document loaded", title.includes("Trellis"), title);

const bodyBg = await evaluate("getComputedStyle(document.body).backgroundColor");
check("dark theme applied", bodyBg === "rgb(5, 6, 10)", bodyBg);

const h1 = await evaluate("document.querySelector('h1')?.innerText.replace(/\\s+/g,' ') ?? ''");
check("h1 rendered by React", h1.includes("Ship AI features"), h1);

const sections = await evaluate("[...document.querySelectorAll('section[id]')].map(s => s.id).join(',')");
check(
  "all section anchors present",
  ["top", "features", "platform", "open-source", "pricing", "waitlist", "faq"].every((s) =>
    sections.split(",").includes(s),
  ),
  sections,
);

const gridBg = await evaluate(
  "getComputedStyle(document.querySelector('.bg-grid')).backgroundImage.slice(0, 30)",
);
check("hero grid background painted", gridBg.includes("linear-gradient"), gridBg);

const marqueeAnim = await evaluate(
  "getComputedStyle(document.querySelector('.animate-marquee')).animationName",
);
check("marquee animation running", marqueeAnim === "marquee", marqueeAnim);

// FAQ interaction
const faqBefore = await evaluate("document.querySelectorAll('[aria-expanded]')[0].getAttribute('aria-expanded')");
await evaluate("document.querySelectorAll('button[aria-controls^=\"faq-panel-\"]')[2].click()");
await sleep(450);
const faqAfter = await evaluate(
  "document.querySelectorAll('button[aria-controls^=\"faq-panel-\"]')[2].getAttribute('aria-expanded')",
);
check("faq accordion toggles", faqBefore === "true" && faqAfter === "true", `${faqBefore} -> ${faqAfter}`);

// Waitlist: invalid then valid
await evaluate(`(() => {
  const input = document.getElementById('waitlist-email');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'not-an-email');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('#waitlist form button[type=submit]').click();
})()`);
await sleep(300);
const invalidMsg = await evaluate("document.getElementById('waitlist-status').innerText");
check("invalid email rejected", invalidMsg.includes("typo"), invalidMsg);

await evaluate(`(() => {
  const input = document.getElementById('waitlist-email');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'dev@northwind.io');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('#waitlist form button[type=submit]').click();
})()`);
await sleep(300);
const validMsg = await evaluate("document.getElementById('waitlist-status').innerText");
check("valid email accepted", validMsg.includes("on the list"), validMsg);

const stored = await evaluate("localStorage.getItem('trellis.waitlist')");
check("email persisted locally", (stored ?? "").includes("dev@northwind.io"), stored ?? "null");

// Scroll reveal
await evaluate("window.scrollTo(0, document.body.scrollHeight)");
await sleep(700);
const revealedCount = await evaluate("document.querySelectorAll('.reveal.is-visible').length");
const revealTotal = await evaluate("document.querySelectorAll('.reveal').length");
check("scroll reveals fire", revealedCount > revealTotal / 2, `${revealedCount}/${revealTotal}`);

const horizontal = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
check("no horizontal overflow", horizontal <= 0, `overflow ${horizontal}px`);

const sectionHeights = await evaluate(
  "JSON.stringify([...document.querySelectorAll('section[id]')].map(s => [s.id, Math.round(s.getBoundingClientRect().height)]))",
);
const shortSections = JSON.parse(sectionHeights).filter(([, h]) => h < 150);
check("every section has content height", shortSections.length === 0, sectionHeights);

const clipped = await evaluate(`JSON.stringify(
  [...document.querySelectorAll('h1,h2,h3,p,span,a,button,li')]
    .filter(el => el.scrollWidth > el.clientWidth + 4 && getComputedStyle(el).overflow !== 'hidden' && !el.closest('.marquee-mask') && !el.classList.contains('truncate'))
    .slice(0, 5)
    .map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 40))
)`);
check("no clipped text", JSON.parse(clipped).length === 0, clipped);

const terminalLines = await evaluate("document.querySelectorAll('.font-mono.break-all, .break-all').length");
check("terminal typed out", terminalLines >= 8, `${terminalLines} lines`);

const fontLoaded = await evaluate("document.fonts ? document.fonts.status : 'n/a'");
check("fonts resolved", fontLoaded === "loaded" || fontLoaded === "n/a", fontLoaded);

check("no console errors", consoleErrors.length === 0, consoleErrors.join(" | "));
check("no uncaught exceptions", pageErrors.length === 0, pageErrors.join(" | "));
check("no failed requests", failedRequests.length === 0, failedRequests.join(" | "));

// Mobile viewport pass
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Page.navigate", { url });
await sleep(2200);
await evaluate("window.scrollTo(0, document.body.scrollHeight)");
await sleep(600);
await evaluate("window.scrollTo(0, 0)");
await sleep(400);

const mobileOverflow = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
check("mobile: no horizontal overflow", mobileOverflow <= 0, `overflow ${mobileOverflow}px`);

const mobileH1Size = await evaluate("parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)");
check("mobile: hero type scales down", mobileH1Size <= 48, `${mobileH1Size}px`);

const navHidden = await evaluate(
  "getComputedStyle(document.querySelector('nav[aria-label=\"Sections\"]')).display",
);
check("mobile: desktop nav hidden", navHidden === "none", navHidden);

const mobileConsole = consoleErrors.length;
check("mobile: no new console errors", mobileConsole === 0, consoleErrors.join(" | "));

ws.close();
chrome.kill();
await sleep(400);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* chromium may still be writing its profile — harmless */
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) process.exit(1);
