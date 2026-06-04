import { cp, rm, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "dist");
const COPY_DIRS = ["css", "js", "content", "images"];
const COPY_FILES = ["index.html"];

const API_BASE = (process.env.MAC_LENIN_API_BASE || "http://localhost:5000").replace(/\/$/, "");

if (process.env.NETLIFY === "true" && !process.env.MAC_LENIN_API_BASE) {
  console.warn(
    "Cảnh báo: MAC_LENIN_API_BASE chưa được đặt trên Netlify. Chat sẽ fallback localhost:5000."
  );
}

function makeEnvJs(apiBase) {
  return `window.__MAC_LENIN_API_BASE__ = ${JSON.stringify(apiBase)};\n`;
}

async function copyDir(srcDir, destDir) {
  await mkdir(destDir, { recursive: true });
  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(src, dest);
    } else {
      await cp(src, dest);
    }
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const file of COPY_FILES) {
  await cp(path.join(ROOT, file), path.join(OUT, file));
}

for (const dir of COPY_DIRS) {
  await copyDir(path.join(ROOT, dir), path.join(OUT, dir));
}

await writeFile(path.join(OUT, "js", "env.js"), makeEnvJs(API_BASE), "utf8");

console.log(`Build xong → dist/ (API base: ${API_BASE})`);
