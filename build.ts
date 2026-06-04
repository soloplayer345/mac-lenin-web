const ROOT = import.meta.dir;
const OUT = `${ROOT}/dist`;
const PLACEHOLDER = "%MAC_LENIN_API_BASE%";
const API_BASE = (process.env.MAC_LENIN_API_BASE || "http://localhost:5000").replace(/\/$/, "");

const COPY_DIRS = ["css", "js", "content"] as const;

async function resetDist() {
  const { rm, mkdir } = await import("node:fs/promises");
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
}

async function writeIndexHtml() {
  const src = `${ROOT}/index.html`;
  let html = await Bun.file(src).text();

  if (!html.includes(PLACEHOLDER)) {
    throw new Error(`index.html thiếu placeholder ${PLACEHOLDER}`);
  }

  html = html.replaceAll(PLACEHOLDER, API_BASE);
  await Bun.write(`${OUT}/index.html`, html);
}

async function copyDir(relativeDir: string) {
  const { readdir, mkdir } = await import("node:fs/promises");
  const srcDir = `${ROOT}/${relativeDir}`;
  const destDir = `${OUT}/${relativeDir}`;

  await mkdir(destDir, { recursive: true });

  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    const src = `${srcDir}/${entry.name}`;
    const dest = `${destDir}/${entry.name}`;

    if (entry.isDirectory()) {
      await copyDir(`${relativeDir}/${entry.name}`);
    } else {
      await Bun.write(dest, Bun.file(src));
    }
  }
}

await resetDist();
await writeIndexHtml();

for (const dir of COPY_DIRS) {
  await copyDir(dir);
}

console.log(`Build xong → dist/ (API base: ${API_BASE})`);
