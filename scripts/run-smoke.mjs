/**
 * Bundles scripts/smoke.tsx with esbuild and runs it in Node, so the whole
 * component tree is rendered outside the browser. Fails on any runtime error
 * or missing section.
 */
import { build } from "esbuild";
import { rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const outfile = "scripts/.smoke.build.mjs";

await build({
  entryPoints: ["scripts/smoke.tsx"],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  jsx: "automatic",
  external: ["react", "react-dom", "react-dom/server"],
  logLevel: "warning",
  define: { "process.env.NODE_ENV": '"production"' },
});

await import(pathToFileURL(`${process.cwd()}/${outfile}`).href);
await rm(outfile, { force: true });
