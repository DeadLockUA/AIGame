// Контактный лист ковров: node tools/contact.mjs <стили через запятую|all> <n> <out.png>
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const root = new URL('../game/', import.meta.url).pathname;
const tools = new URL('./', import.meta.url).pathname;
const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const srv = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = p === '/contact.html' ? join(tools, 'contact.html') : join(root, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const port = srv.address().port;
const [style = 'all', n = '6', out = 'contact.png'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await b.newPage({ viewport: { width: 1180, height: 800 } });
pg.on('console', (m) => console.log('console:', m.text()));
pg.on('pageerror', (e) => console.log('pageerror:', e.message));
await pg.goto(`http://localhost:${port}/contact.html?n=${n}` + (style === 'all' ? '' : `&style=${style}`));
await pg.waitForFunction(() => document.title === 'ready', null, { timeout: 60000 });
await pg.screenshot({ path: out, fullPage: true });
await b.close(); srv.close();
console.log('saved', out);
