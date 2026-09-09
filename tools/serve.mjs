import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number.parseInt(process.env.PORT || "8765", 10);

const server = createServer((req, res) => {
  const path = new URL(req.url || "/", "http://localhost").pathname;
  if (["/ui/transitions.js", "/ui/bloom-controls.js", "/ui/storybook.js", "/ui/campaign.js", "/ui/guardians.js", "/ui/terrain.js", "/ui/inhabitants.js", "/ui/display.js", "/ui/menus.js", "/ui/menus.css", "/ui/play-overlay.js", "/ui/play-overlay.css"].includes(path)) {
    res.writeHead(200, { "Content-Type": path.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8", "Cache-Control": "no-store" });
    createReadStream(join(root, path.slice(1))).pipe(res);
    return;
  }
  if (["/assets/mycelium-cathedral.png", "/assets/hearthwood.png", "/assets/lantern.png", "/assets/rainbell.png", "/assets/heartroot.png", "/icons/apple-touch-icon.png", "/icons/icon-192.png", "/icons/icon-512.png"].includes(path)) {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" });
    createReadStream(join(root, path.slice(1))).pipe(res);
    return;
  }
  if (path === "/manifest.webmanifest") {
    res.writeHead(200, { "Content-Type": "application/manifest+json", "Cache-Control": "no-store" });
    createReadStream(join(root, "manifest.webmanifest")).pipe(res);
    return;
  }
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
