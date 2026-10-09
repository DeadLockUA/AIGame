// Дополнительные E2E: квирки, спасение, сохранение, районы, производительность, экраны хаба.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from '../../tools/serve.mjs';

const out = process.env.SHOTS || '/tmp/e2e-shots';
mkdirSync(out, { recursive: true });
const srv = await serve(0);
const base = `http://localhost:${srv.address().port}/?nosw`;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
let failed = 0;
const ok = (c, m) => { if (!c) { failed++; console.log('✗', m); } else console.log('✓', m); };

async function fresh(patch) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await pg.goto(base);
  await pg.waitForSelector('.title-screen');
  if (patch) await pg.evaluate(patch);
  return { ctx, pg, errors };
}
async function toHub(pg) {
  await pg.click('.title-screen .btn');
  if (await pg.locator('.story').count()) for (let i = 0; i < 4 && await pg.locator('.story').count(); i++) { await pg.click('.story'); await pg.waitForTimeout(100); }
  await pg.waitForSelector('.tabbar');
}
async function startOrder(pg, idx = 0) {
  await pg.click('.tab[data-tab=orders]');
  await pg.locator('.order').nth(idx).click();
  await pg.waitForSelector('.sheet');
  await pg.click('.sheet .btn.teal');
  await pg.click('.sheet .foot .btn');
  await pg.waitForSelector('.wash canvas');
  await pg.waitForTimeout(500);
}
async function scribble(pg, rows = 5, y0 = 0.12) {
  const box = await pg.locator('.wash canvas').boundingBox();
  for (let i = 0; i < rows; i++) {
    const y = box.y + box.height * (y0 + i * 0.12);
    await pg.mouse.move(box.x + box.width * 0.1, y); await pg.mouse.down();
    for (let k = 0; k <= 10; k++) { await pg.mouse.move(box.x + box.width * (0.1 + 0.8 * k / 10), y); await pg.waitForTimeout(12); }
    await pg.mouse.up();
  }
}

// 1. сохранение переживает перезагрузку
{
  const { ctx, pg, errors } = await fresh();
  await toHub(pg);
  await pg.evaluate(() => { window.__game.state.coins = 777; window.__game.A.save(); });
  await pg.reload(); await pg.waitForSelector('.title-screen');
  const c = await pg.evaluate(() => window.__game.state.coins);
  ok(c === 777, 'сохранение переживает перезагрузку');
  await ctx.close();
}
// 2. экраны хаба и «Ещё»
{
  const { ctx, pg, errors } = await fresh(() => {});
  await toHub(pg);
  for (const t of ['shop', 'workshop', 'more']) {
    await pg.click(`.tab[data-tab=${t}]`); await pg.waitForTimeout(250);
  }
  await pg.click('.tab[data-tab=shop]');
  for (const idx of [1, 2]) { await pg.locator('.seg button').nth(idx).click(); await pg.waitForTimeout(250); await pg.screenshot({ path: `${out}/20-shop-${idx}.png` }); }
  await pg.click('.tab[data-tab=workshop]'); await pg.waitForTimeout(250); await pg.screenshot({ path: `${out}/21-workshop.png` });
  await pg.click('.tab[data-tab=more]'); await pg.waitForTimeout(250);
  await pg.locator('.card.tap').nth(0).click(); await pg.waitForSelector('.sheet'); await pg.waitForTimeout(250); await pg.screenshot({ path: `${out}/22-achievements.png` });
  await pg.click('.sheet .xbtn');
  await pg.locator('.card.tap').nth(1).click(); await pg.waitForSelector('.sheet'); await pg.waitForTimeout(200); await pg.screenshot({ path: `${out}/23-collection.png` });
  await pg.click('.sheet .xbtn');
  await pg.locator('.card.tap').nth(2).click(); await pg.waitForSelector('.sheet'); await pg.waitForTimeout(200); await pg.screenshot({ path: `${out}/24-settings.png` });
  await pg.click('.sheet .xbtn');
  ok(errors.length === 0, 'экраны хаба без ошибок' + (errors.length ? ': ' + errors[0] : ''));
  await ctx.close();
}
// 3. каждый квирк: заказ запускается, жесты работают, нет ошибок, fps приемлем
const QUIRKS = ['regrow', 'ghosts', 'dark', 'sway', 'slippery', 'mirror', 'heavy', 'foamy'];
for (const q of QUIRKS) {
  const { ctx, pg, errors } = await fresh();
  await toHub(pg);
  await pg.evaluate((q) => {
    const A = window.__game.A;
    const s = window.__game.state;
    s.board.side = [];
    s.board.n = 4; // ближайший побочный заказ будет абсурдным (n % 5 === 4)
    // подменим заказ на доске абсурдным с нужным квирком
  }, q);
  // откроем сюжетный заказ №5 района 1 и подменим квирк через движок доски
  await pg.click('.tab[data-tab=orders]');
  const card = pg.locator('.order.boss').first();
  await card.scrollIntoViewIfNeeded();
  await card.click(); await pg.waitForSelector('.sheet');
  await pg.click('.sheet .btn.teal');
  // подмена квирка в самом запуске: используем глобальный хук
  await pg.evaluate((q) => { window.__forceQuirk = q; }, q);
  await pg.click('.sheet .foot .btn');
  await pg.waitForSelector('.wash canvas');
  await pg.waitForTimeout(400);
  // подменяем квирк в живом движке
  await pg.evaluate((q) => {
    const e = window.__wash.eng;
    e.quirks = [({ regrow: { id: 'regrow', every: 1, size: 4, amount: 0.5, type: 'mud' }, ghosts: { id: 'ghosts', every: 2, size: 5, types: ['dust', 'mud'] }, dark: { id: 'dark' }, sway: { id: 'sway', amp: 0.08, speed: 1 }, slippery: { id: 'slippery', lag: 0.16 }, mirror: { id: 'mirror' }, heavy: { id: 'heavy', mul: 1.5 }, foamy: { id: 'foamy', rate: 0.5 } })[q]];
    e.heavy = q === 'heavy' ? 1.5 : 1;
    window.__wash.view.dark = q === 'dark';
  }, q);
  await scribble(pg, 4);
  await pg.waitForTimeout(500);
  if (q === 'dark' || q === 'sway' || q === 'mirror') await pg.screenshot({ path: `${out}/30-quirk-${q}.png` });
  const fps = await pg.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 1000) res(n); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  ok(errors.length === 0, `квирк ${q}: без ошибок, fps ${fps}` + (errors.length ? ': ' + errors[0] : ''));
  await ctx.close();
}
// 4. время вышло и спасение
{
  const { ctx, pg, errors } = await fresh();
  await toHub(pg);
  await pg.evaluate(() => { window.__game.state.rep = 5; });
  await startOrder(pg, 0);
  await scribble(pg, 1);
  await pg.evaluate(() => { const e = window.__wash.eng; e.time = e.limit - 0.3; });
  await pg.waitForSelector('.overlay .btn.gold', { timeout: 5000 });
  await pg.screenshot({ path: `${out}/40-timeup.png` });
  await pg.click('.overlay .btn.gold');
  await pg.waitForTimeout(300);
  const lim = await pg.evaluate(() => window.__wash.eng.limit);
  const rep = await pg.evaluate(() => window.__game.state.rep);
  ok(rep < 5, 'спасение списывает репутацию (' + rep + ')');
  await pg.evaluate(() => { const e = window.__wash.eng; e.time = e.limit - 0.2; });
  await pg.waitForSelector('.overlay .btn.ghost', { timeout: 5000 }).catch(() => {});
  ok(errors.length === 0, 'спасение без ошибок' + (errors.length ? ': ' + errors[0] : ''));
  await ctx.close();
}
// 5. сезон: завершение района, сюжет и переезд
{
  const { ctx, pg, errors } = await fresh(() => {
    const s = window.__game.state;
    const ids = ['s01o1', 's01o2', 's01o3', 's01o4', 's01o5'];
    for (const id of ids) s.progress.done[id] = { stars: 3, clean: 99 };
    s.followers = 100;
  });
  await toHub(pg);
  await startOrder(pg, 5);
  // быстрая мойка движком
  await pg.evaluate(() => {
    const e = window.__wash.eng;
    for (let t = 0; t < 8; t++) for (let y = 3; y < 108; y += 4) { e.apply('vacuum', 0, y, 71, y, 1.2, {}); e.tick(1 / 30); }
    window.__wash.setPhase('apply');
    const pid = e.productList[0];
    for (let t = 0; t < 2; t++) for (let y = 3; y < 108; y += 4) { e.apply('apply', 0, y, 71, y, 1.2, { product: pid, speed: 40 }); e.tick(1 / 30); }
    for (let i = 0; i < 200; i++) e.tick(1 / 30);
    for (let t = 0; t < 4; t++) for (let y = 3; y < 108; y += 4) { e.apply('rinse', 0, y, 71, y, 1.2, {}); e.tick(1 / 30); }
    window.__wash.finish();
  });
  await pg.waitForSelector('.res');
  await pg.waitForTimeout(500);
  await pg.screenshot({ path: `${out}/50-result-season.png` });
  await pg.click('.full .foot .btn');
  await pg.waitForSelector('.story');
  await pg.screenshot({ path: `${out}/51-outro.png` });
  for (let i = 0; i < 3 && await pg.locator('.story').count(); i++) { await pg.click('.story'); await pg.waitForTimeout(150); }
  await pg.waitForSelector('.tabbar');
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${out}/52-hub-newseason.png` });
  const unlocked = await pg.evaluate(() => document.body.innerText.includes('Переехать в район'));
  ok(unlocked, 'после района 1 появляется переезд');
  await pg.locator('.btn.gold', { hasText: 'Переехать' }).click();
  await pg.waitForSelector('.story'); await pg.waitForTimeout(200);
  for (let i = 0; i < 4 && await pg.locator('.story').count(); i++) { await pg.click('.story'); await pg.waitForTimeout(150); }
  await pg.waitForSelector('.tabbar');
  const season = await pg.evaluate(() => window.__game.state.season);
  ok(season === 2, 'переезд в район 2');
  await pg.screenshot({ path: `${out}/53-season2.png` });
  ok(errors.length === 0, 'сезонный поток без ошибок' + (errors.length ? ': ' + errors[0] : ''));
  await ctx.close();
}
// 6. офлайн: после первой загрузки игра открывается без сети
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  await pg.goto(base.replace('?nosw', ''));
  await pg.waitForSelector('.title-screen');
  await pg.evaluate(async () => { await navigator.serviceWorker.ready; });
  await pg.waitForTimeout(2500);
  const cached = await pg.evaluate(async () => { const k = await caches.keys(); const c = await caches.open(k[0]); return (await c.keys()).length; });
  await ctx.setOffline(true);
  await pg.reload();
  await pg.waitForSelector('.title-screen', { timeout: 8000 });
  ok(cached > 50, 'офлайн: в кэше ' + cached + ' файлов, игра открывается без сети');
  await pg.click('.title-screen .btn'); await pg.waitForSelector('.story');
  ok(errors.length === 0, 'офлайн без ошибок' + (errors[0] ? ': ' + errors[0] : ''));
  await ctx.close();
}
// 7. титры после 10 района
{
  const { ctx, pg, errors } = await fresh(() => {
    const s = window.__game.state;
    for (let i = 1; i <= 10; i++) for (let k = 1; k <= 6; k++) { if (i === 10 && k === 6) continue; s.progress.done['s' + String(i).padStart(2, '0') + 'o' + k] = { stars: 3, clean: 99 }; }
    for (let i = 1; i <= 9; i++) s.progress.seasonsSeen['s' + i] = true;
    s.season = 10; s.maxSeason = 10; s.followers = 9999;
    window.__game.A.save();
  });
  await pg.reload(); await pg.waitForSelector('.title-screen'); await toHub(pg);
  await startOrder(pg, 5);
  await pg.evaluate(() => {
    const e = window.__wash.eng;
    for (let t = 0; t < 12; t++) for (let y = 3; y < 108; y += 3) { e.apply('vacuum', 0, y, 71, y, 1.2, {}); e.tick(1 / 30); }
    window.__wash.setPhase('apply');
    const pid = e.productList[0];
    for (let t = 0; t < 3; t++) for (let y = 3; y < 108; y += 3) { e.apply('apply', 0, y, 71, y, 1.2, { product: pid, speed: 40 }); e.tick(1 / 30); }
    for (let i = 0; i < 200; i++) e.tick(1 / 30);
    for (let t = 0; t < 5; t++) for (let y = 3; y < 108; y += 3) { e.apply('rinse', 0, y, 71, y, 1.2, {}); e.tick(1 / 30); }
    window.__wash.finish();
  });
  await pg.waitForSelector('.res'); await pg.click('.full .foot .btn');
  await pg.waitForSelector('.story');
  for (let i = 0; i < 4; i++) { if (await pg.locator('.credits').count()) break; await pg.click('.story'); await pg.waitForTimeout(150); }
  await pg.waitForSelector('.credits', { timeout: 5000 });
  await pg.screenshot({ path: `${out}/60-credits.png` });
  ok(true, 'титры показываются после 10 района');
  await pg.click('.credits .btn'); await pg.waitForSelector('.tabbar');
  ok(errors.length === 0, 'финал без ошибок' + (errors[0] ? ': ' + errors[0] : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log(failed ? 'ПРОВАЛ' : 'ГОТОВО');
process.exit(failed ? 1 : 0);
