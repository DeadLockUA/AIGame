// E2E в мобильной эмуляции Chromium: проходит заказ от титула до итогов и проверяет, что нет ошибок.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from '../../tools/serve.mjs';

const out = process.env.SHOTS || '/tmp/e2e-shots';
mkdirSync(out, { recursive: true });
const srv = await serve(0);
const base = `http://localhost:${srv.address().port}/?nosw`;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' });
const pg = await ctx.newPage();
const errors = [];
pg.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const shot = (n) => pg.screenshot({ path: `${out}/${n}.png` });
const step = (m) => console.log('·', m);
let failed = 0;
const ok = (cond, msg) => { if (!cond) { failed++; console.log('✗', msg); } else console.log('✓', msg); };

await pg.goto(base);
await pg.waitForSelector('.title-screen');
await shot('01-title');
await pg.click('.title-screen .btn');
await pg.waitForSelector('.story');
for (let i = 0; i < 3; i++) { await pg.click('.story'); await pg.waitForTimeout(150); }
await pg.waitForSelector('.tabbar');
ok(true, 'хаб открылся');
await pg.waitForTimeout(600);
await shot('02-hub-orders');
for (const t of ['shop', 'workshop', 'feed', 'more']) { await pg.click(`.tab[data-tab=${t}]`); await pg.waitForTimeout(400); await shot('03-tab-' + t); }
await pg.click('.tab[data-tab=orders]');
await pg.waitForTimeout(300);
await pg.click('.order');
await pg.waitForSelector('.sheet');
await pg.waitForTimeout(400);
await shot('04-prep');
await pg.click('.sheet .btn.teal');
await pg.waitForTimeout(300);
await shot('05-prep-auto');
const coinsBefore = await pg.evaluate(() => window.__game.state.coins);
await pg.click('.sheet .foot .btn');
await pg.waitForSelector('.wash canvas');
await pg.waitForTimeout(800);
await shot('06-wash-start');
const box = await pg.locator('.wash canvas').boundingBox();
const X = (f) => box.x + box.width * f, Y = (f) => box.y + box.height * f;
// раскладка не прыгает при смене фаз
const sizeOf = async () => { const b2 = await pg.locator('.wash canvas').boundingBox(); return `${Math.round(b2.width)}x${Math.round(b2.height)}@${Math.round(b2.y)}`; };
const s0 = await sizeOf();
await pg.click('.phase.apply'); await pg.waitForTimeout(250);
const s1 = await sizeOf();
await pg.click('.phase.rinse'); await pg.waitForTimeout(250);
const s2 = await sizeOf();
await pg.click('.phase.vacuum'); await pg.waitForTimeout(250);
ok(s0 === s1 && s1 === s2, `холст не прыгает при смене фаз (${s0} ${s1} ${s2})`);
// пылесос реальными жестами
step('пылесос жестами');
for (let i = 0; i < 4; i++) {
  await pg.mouse.move(X(0.1), Y(0.12 + i * 0.08)); await pg.mouse.down();
  for (let k = 0; k <= 12; k++) { await pg.mouse.move(X(0.1 + k * 0.065), Y(0.12 + i * 0.08)); await pg.waitForTimeout(16); }
  await pg.mouse.up();
}
await shot('07-wash-vacuum');
const c1 = await pg.evaluate(() => window.__wash.eng.cleanPct);
ok(c1 > 3, `чистота растёт от пылесоса (${c1.toFixed(1)}%)`);
// программная мойка остального
await pg.evaluate(async () => {
  const w = window.__wash, e = w.eng;
  const sweep = (ph, ctx, step = 5, ymax = 108) => { for (let y = 3; y < ymax; y += step) { e.apply(ph, 0, y, 71, y, 1.2, ctx); e.tick(1 / 30); } };
  for (let i = 0; i < 6; i++) sweep('vacuum', {});
  w.setPhase('apply');
  const pid = e.productList.sort((a, b) => (e.stock.products[b] || 0) - (e.stock.products[a] || 0))[0];
  for (let i = 0; i < 2; i++) sweep('apply', { product: pid, speed: 40 });
  for (let i = 0; i < 150; i++) e.tick(1 / 30);
  w.setPhase('rinse');
  sweep('rinse', {}, 5, 50);
});
await pg.waitForTimeout(600);
await shot('08-wash-late');
const c2 = await pg.evaluate(() => window.__wash.eng.cleanPct);
ok(c2 > 30 && c2 < 99, `ковёр отмыт (${c2.toFixed(1)}%)`);
await pg.click('.hud .hb:last-child');
await pg.waitForSelector('.overlay .btn');
await shot('09-confirm');
await pg.locator('.overlay .btn').first().click();
await pg.waitForSelector('.res');
await pg.waitForTimeout(900);
await shot('10-result');
const coinsAfter = await pg.evaluate(() => window.__game.state.coins);
ok(coinsAfter > coinsBefore - 200, 'экономика обновилась');
await pg.click('.full .foot .btn');
await pg.waitForSelector('.tabbar');
await pg.click('.tab[data-tab=feed]');
await pg.waitForTimeout(1200);
await shot('11-feed');
const posts = await pg.evaluate(() => window.__game.state.gallery.length);
ok(posts === 1, 'пост в ленте');
ok(errors.length === 0, 'без ошибок в консоли' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
await b.close(); srv.close();
console.log(failed ? 'ПРОВАЛ' : 'ГОТОВО', 'скриншоты:', out);
process.exit(failed ? 1 : 0);
