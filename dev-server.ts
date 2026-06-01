const PORT = Number(process.env.PORT) || 3000;
const ROOT = import.meta.dir;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function resolvePath(pathname: string): string | null {
  let path = decodeURIComponent(pathname);
  if (path === "/") path = "/index.html";
  if (path.includes("..")) return null;
  return `${ROOT}${path}`;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const filePath = resolvePath(new URL(req.url).pathname);
    if (!filePath) {
      return new Response("Bad Request", { status: 400 });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }

    const ext = filePath.slice(filePath.lastIndexOf("."));
    const type = MIME[ext];
    return new Response(file, type ? { headers: { "Content-Type": type } } : undefined);
  },
});

console.log(`Dev server: http://localhost:${server.port}`);
console.log("Nhấn Ctrl+C để dừng.");
