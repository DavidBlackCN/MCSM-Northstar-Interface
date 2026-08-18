import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const requestedPort = Number.parseInt(process.env.PORT || "8765", 10);
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536
  ? requestedPort
  : 8765;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

const send = (response, status, body, type = "text/plain; charset=utf-8") => {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
    const pathname = requestUrl.pathname === "/" ? "/preview.html" : decodeURIComponent(requestUrl.pathname);
    const filePath = resolve(themeRoot, `.${pathname}`);
    const insideTheme = filePath === themeRoot || filePath.startsWith(`${themeRoot}${sep}`);

    if (!insideTheme) {
      send(response, 403, "Forbidden");
      return;
    }

    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      send(response, 404, "Not found");
      return;
    }

    const body = await readFile(filePath);
    send(response, 200, body, contentTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream");
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 500;
    send(response, status, status === 404 ? "Not found" : "Preview server error");
  }
});

server.listen(port, host, () => {
  console.log(`Northstar preview: http://${host}:${port}/`);
  console.log("Press Ctrl+C to stop.");
});

server.on("error", (error) => {
  console.error(`Unable to start preview server: ${error.message}`);
  process.exitCode = 1;
});
