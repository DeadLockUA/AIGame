// личный просмотрщик: node tools/my_view.mjs <style> <n> <out.png> [scale] [cols]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const root = new URL('../game/', import.meta.url).pathname;
const types = { '.js': 'text/javascript', '.html': 'text/html' };
const page = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#2a2622}#g{display:flex;flex-wrap:wrap;gap:8px;padding:8px}canvas{display:block}</style><div id=g></div>
<script type=module>
import { renderCarpet } from '/js/carpet/render.js';
const q=new URLSearchParams(location.search);const st=q.get('style'),n=+q.get('n'),sc=+q.get('sc'),w=+q.get('w');
let times=[];
for(let i=0;i<n;i++){const t=performance.now();const c=renderCarpet({style:st,seed:1000+i*77+(+q.get('off')||0)},2);times.push(performance.now()-t);c.style.width=w+'px';c.style.height=(w*1.5)+'px';document.getElementById('g').appendChild(c);}
console.log('times',times.map(x=>x.toFixed(0)).join(','));
document.title='ready';
</script>`;
const srv = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/v.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page); }
  const f = join(root, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(f)] || 'text/plain' }); res.end(readFileSync(f));
}).listen(0);
const [style, n = '4', out = 'v.png', w = '270', off = '0'] = process.argv.slice(2);
const cols = Math.max(1, Math.floor(1400 / (+w + 8)));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await b.newPage({ viewport: { width: cols * (+w + 8) + 8, height: 600 } });
pg.on('console', (m) => console.log(m.text())); pg.on('pageerror', (e) => console.log('pageerror:', e.message));
await pg.goto(`http://localhost:${srv.address().port}/v.html?style=${style}&n=${n}&sc=2&w=${w}&off=${off}`);
await pg.waitForFunction(() => document.title === 'ready', null, { timeout: 60000 });
await pg.screenshot({ path: out, fullPage: true });
await b.close(); srv.close();
