import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.md': 'text/plain; charset=utf-8', '.exe': 'application/octet-stream', '.zip': 'application/zip' };
const server = http.createServer((request, response) => {
  let file;
  try {
    const url = new URL(request.url, 'http://localhost');
    let resource = decodeURIComponent(url.pathname);
    if (resource.startsWith('/dmc-player-downloads/')) resource = resource.slice('/dmc-player-downloads'.length);
    file = path.resolve(root, '.' + (resource.endsWith('/') ? resource + 'index.html' : resource));
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Invalid path');
    if (!fs.statSync(file).isFile()) throw new Error('Not a file');
  } catch (_) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  if (request.method === 'HEAD') response.end(); else fs.createReadStream(file).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`DMC Player preview: http://127.0.0.1:${port}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
