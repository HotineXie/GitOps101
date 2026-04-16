import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const rootDir = path.resolve(process.argv[2] ?? "dist");
const port = Number(process.argv[3] ?? 4173);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"]
]);

function resolveRequestPath(urlPathname) {
  const cleanPath = urlPathname === "/" ? "/index.html" : urlPathname;
  const normalizedPath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(rootDir, normalizedPath);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  let filePath = resolveRequestPath(requestUrl.pathname);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    await access(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extension) ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Serving ${rootDir} at http://localhost:${port}`);
});
