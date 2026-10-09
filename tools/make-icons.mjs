// Рисует PNG-иконки из icons/icon.svg через Chromium.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../game/icons/icon.svg', import.meta.url), 'utf8');
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
async function shot(size, file, pad = 0) {
  const pg = await b.newPage({ viewport: { width: size, height: size } });
  const inner = pad ? `<div style="position:absolute;inset:${pad}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>` : svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await pg.setContent(`<body style="margin:0;background:${pad ? '#e9895a' : 'transparent'};position:relative">${inner}</body>`);
  await pg.screenshot({ path: new URL('../game/icons/' + file, import.meta.url).pathname, omitBackground: !pad });
  await pg.close();
}
await shot(192, 'icon-192.png'); await shot(512, 'icon-512.png'); await shot(512, 'icon-maskable-512.png', 56);
await b.close();
