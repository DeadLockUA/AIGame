// Простой статический сервер для локальной игры: node tools/serve.mjs [порт]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
const root = new URL('../game/', import.meta.url).pathname;
const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
export function serve(port = 0) {
  return new Promise((res) => {
    const srv = createServer((req, rsp) => {
      let p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
      if (p.endsWith('/')) p += 'index.html';
      const f = join(root, p);
      if (!f.startsWith(root) || !existsSync(f) || statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end('not found'); }
      rsp.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      rsp.end(readFileSync(f));
    }).listen(port, () => res(srv));
  });
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const s = await serve(Number(process.argv[2] || 8080));
  console.log('http://localhost:' + s.address().port + '/');
}
