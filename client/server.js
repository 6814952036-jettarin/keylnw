const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.CLIENT_PORT) || 3000;
const root = __dirname;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.resolve(root, `.${requestPath}`);
    if (!filePath.startsWith(root + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, file) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500).end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
      res.end(file);
    });
  })
  .listen(PORT, () => console.log(`Client running at http://localhost:${PORT}`));
