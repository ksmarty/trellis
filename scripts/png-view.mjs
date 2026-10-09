/**
 * Dependency-free PNG inspection for visual QA of the rendered page.
 * Decodes Chromium's 8-bit RGB/RGBA PNG output, then prints a palette
 * summary, a per-band brightness profile, and a coarse ASCII luminance map.
 *
 *   node scripts/png-view.mjs <in.png> [cols] [rows] [x] [y] [w] [h]
 *
 * The luminance ramp is " .:-=+*#%@" — dark theme means text shows as dense
 * glyphs on an almost blank field, so check the map against the band profile.
 */
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const [, , file, colsArg = "110", rowsArg = "46"] = process.argv;
if (!file) {
  console.error("usage: node scripts/png-view.mjs <in.png> [cols] [rows] [x] [y] [w] [h]");
  process.exit(2);
}
const cols = Number(colsArg);
const rows = Number(rowsArg);

const buf = readFileSync(file);
if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a png");

let pos = 8;
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
const idat = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString("ascii", pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    if (data[12] !== 0) throw new Error("interlaced png unsupported");
  } else if (type === "IDAT") {
    idat.push(data);
  } else if (type === "IEND") {
    break;
  }
  pos += 12 + len;
}
if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);

const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
if (!channels) throw new Error(`unsupported color type ${colorType}`);

const raw = inflateSync(Buffer.concat(idat));
const stride = width * channels;
const px = Buffer.alloc(height * stride);
const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  const out = px.subarray(y * stride, (y + 1) * stride);
  const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;
  for (let x = 0; x < stride; x++) {
    const a = x >= channels ? out[x - channels] : 0;
    const b = prev ? prev[x] : 0;
    const c = prev && x >= channels ? prev[x - channels] : 0;
    const v = line[x];
    out[x] =
      filter === 0 ? v
      : filter === 1 ? (v + a) & 0xff
      : filter === 2 ? (v + b) & 0xff
      : filter === 3 ? (v + ((a + b) >> 1)) & 0xff
      : (v + paeth(a, b, c)) & 0xff;
  }
}

const rgbAt = (x, y) => {
  const i = y * stride + x * channels;
  return [px[i], px[i + 1], px[i + 2]];
};
const lumAt = (x, y) => {
  const [r, g, b] = rgbAt(x, y);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const counts = new Map();
for (let y = 0; y < height; y += 3) {
  for (let x = 0; x < width; x += 3) {
    const [r, g, b] = rgbAt(x, y);
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}
const total = [...counts.values()].reduce((a, b) => a + b, 0);
const top = [...counts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([k, v]) => {
    const [r, g, b] = k.split(",").map(Number);
    const hex = [r, g, b].map((n) => (n * 16 + 8).toString(16).padStart(2, "0")).join("");
    return `#${hex} ${((v / total) * 100).toFixed(1)}%`;
  });

const win = process.argv.slice(7, 11).map(Number);
const hasWin = win.length === 4 && win.every((n) => Number.isFinite(n));
const [wx, wy, ww, wh] = hasWin ? win : [0, 0, width, height];

console.log(`${file} — ${width}x${height}, ${channels} channels${hasWin ? ` (crop ${ww}x${wh} at ${wx},${wy})` : ""}`);
console.log(`palette: ${top.join("  ")}`);

const bands = 20;
console.log("--- brightness by page band ---");
for (let b = 0; b < bands; b++) {
  const y0 = Math.floor((b * height) / bands);
  const y1 = Math.floor(((b + 1) * height) / bands);
  let lit = 0;
  let n = 0;
  let peak = 0;
  for (let y = y0; y < y1; y += 2) {
    for (let x = 0; x < width; x += 3) {
      const l = lumAt(x, y);
      if (l > 70) lit++;
      if (l > peak) peak = l;
      n++;
    }
  }
  const pct = ((lit / n) * 100).toFixed(1).padStart(5);
  const bar = "#".repeat(Math.round(Number(pct) / 2));
  console.log(`y ${String(y0).padStart(5)}-${String(y1).padStart(5)}  ink ${pct}%  peak ${String(Math.round(peak)).padStart(3)}  ${bar}`);
}

const ramp = " .:-=+*#%@";
console.log(`--- luminance map (${cols}x${rows}) ---`);
const cw = ww / cols;
const ch = wh / rows;
for (let r = 0; r < rows; r++) {
  let line = "";
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    let n = 0;
    for (let y = wy + Math.floor(r * ch); y < Math.min(height, wy + (r + 1) * ch); y++) {
      for (let x = wx + Math.floor(c * cw); x < Math.min(width, wx + (c + 1) * cw); x++) {
        sum += lumAt(x, y);
        n++;
      }
    }
    const lum = n ? sum / n : 0;
    line += ramp[Math.min(ramp.length - 1, Math.round((lum / 255) * (ramp.length - 1)))];
  }
  console.log(line);
}
