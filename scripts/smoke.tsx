/**
 * Headless render smoke test: renders the whole page tree to a string so a
 * runtime error in any component fails the command instead of the browser.
 * Run with: npm run smoke
 */
import { renderToString } from "react-dom/server";
import App from "../src/App";

const html = renderToString(<App />);

const checks: Array<[string, boolean]> = [
  ["hero headline", html.includes("Ship AI features")],
  ["hosted beta cta", html.includes("Join the hosted") || html.includes("Join the beta")],
  ["self-host vs cloud table", html.includes("Self-hosted core") && html.includes("Trellis Cloud")],
  ["open-source section", html.includes("Apache-2.0")],
  ["pricing tiers", html.includes("Cloud Beta") && html.includes("Scale")],
  ["waitlist form", html.includes('id="waitlist-email"')],
  ["faq", html.includes("paywall")],
  ["footer", html.includes("Trellis Labs")],
  ["no crypto.randomUUID", !html.includes("randomUUID")],
  ["no unresolved mock urls", !html.includes("trellis-labs.example")],
  ["repo url present", html.includes("https://github.com/ksmarty/trellis")],
  ["no dead placeholder links", !/<a[^>]*href="#"/.test(html)],
  [
    "no invented github numbers",
    !html.includes("17.4k") && !html.includes("620+") && !html.includes("3.2k"),
  ],
];

const failed = checks.filter(([, ok]) => !ok);

for (const [name, ok] of checks) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
}

console.log(`\nrendered ${html.length} chars`);

if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed: ${failed.map(([n]) => n).join(", ")}`);
  process.exit(1);
}

console.log("all section checks passed");
