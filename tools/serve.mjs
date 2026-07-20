import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number.parseInt(process.env.PORT || "8765", 10);

const server = createServer((req, res) => {
  const path = new URL(req.url || "/", "http://localhost").pathname;
  if (path !== "/" && path !== "/index.html") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(join(root, "index.html")).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Sporeling Dash DEV: http://127.0.0.1:${port}/`);
});
