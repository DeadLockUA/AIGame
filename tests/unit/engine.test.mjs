import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WashEngine, GW, GH, GN } from '../../game/js/wash/engine.js';
import { fillDirt } from '../../game/js/wash/dirtgen.js';
import { D } from '../../game/js/data/gear.js';

const kit = () => ({ vacuum: 'v_mouse', applicator: 'a_spray', rinse: 'r_can', stock: { products: { p_soap: 50 }, water: 200, steam: 0, filter: 'f_paper' } });
function eng(profile, extra = {}) {
  const e = new WashEngine({ limit: 100, kit: kit(), seed: 3, ...extra });
  fillDirt(e, profile, 3);
  return e;
}
function sweep(e, phase, ctx = {}, passes = 1) {
  for (let p = 0; p < passes; p++) for (let y = 3; y < GH; y += 5) {
    e.apply(phase, 0, y, GW - 1, y, 1.2, ctx); e.tick(1 / 30);
  }
}

test('чистота стартует с нуля и не выходит за 0..100', () => {
  const e = eng({ layers: [{ type: 'dust', cover: 0.6, amt: 0.7 }] });
  assert.ok(e.cleanPct >= 0 && e.cleanPct < 1);
  sweep(e, 'vacuum', {}, 6);
  assert.ok(e.cleanPct > 80 && e.cleanPct <= 100);
});

test('пылесос убирает сухое и не трогает мокрую грязь', () => {
  const e = eng({ layers: [{ type: 'dust', cover: 0.6, amt: 0.7 }, { type: 'mud', cover: 0.5, amt: 0.8 }] });
  const mud0 = e.dirt[D.mud].reduce((a, b) => a + b, 0);
  sweep(e, 'vacuum', {}, 5);
  const mud1 = e.dirt[D.mud].reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(mud1 - mud0) < 1e-3);
});

test('средство расходуется, пена разрыхляет, смыв отмывает', () => {
  const e = eng({ layers: [{ type: 'mud', cover: 0.5, amt: 0.8 }] });
  const stock0 = e.stock.products.p_soap;
  sweep(e, 'apply', { product: 'p_soap', speed: 40 }, 2);
  assert.ok(e.stock.products.p_soap < stock0);
  for (let i = 0; i < 150; i++) e.tick(1 / 30);
  const loose = e.loose[D.mud].reduce((a, b) => a + b, 0);
  assert.ok(loose > 5, 'разрыхлено ' + loose);
  const before = e.cleanPct;
  sweep(e, 'rinse', {}, 3);
  assert.ok(e.cleanPct > before + 20);
  assert.ok(e.stock.water < 200);
});

test('смыв без пылесоса превращает пыль в грязь (штраф за порядок)', () => {
  const e = eng({ layers: [{ type: 'dust', cover: 0.7, amt: 0.8 }] });
  const mud0 = e.dirt[D.mud].reduce((a, b) => a + b, 0);
  sweep(e, 'rinse', {}, 1);
  const mud1 = e.dirt[D.mud].reduce((a, b) => a + b, 0);
  assert.ok(mud1 > mud0 + 1);
});

test('пустой флакон не даёт пены', () => {
  const e = new WashEngine({ limit: 50, kit: { ...kit(), stock: { products: { p_soap: 0 }, water: 10, steam: 0 } }, seed: 1 });
  fillDirt(e, { layers: [{ type: 'mud', cover: 0.3, amt: 0.7 }] }, 1);
  const r = e.apply('apply', 5, 5, 20, 5, 0.5, { product: 'p_soap', speed: 20 });
  assert.equal(r.empty, true);
  assert.equal(e.foam.reduce((a, b) => a + b, 0), 0);
});

test('находка раскрывается, когда под ней чисто, и собирается один раз', () => {
  const finds = [{ id: 'f_button', x: 30, y: 40, r: 3 }];
  const e = new WashEngine({ limit: 100, kit: kit(), seed: 1, finds });
  fillDirt(e, { layers: [{ type: 'dust', cover: 0.5, amt: 0.6 }] }, 1);
  assert.equal(e.finds[0].revealed, false);
  sweep(e, 'vacuum', {}, 6);
  sweep(e, 'apply', { product: 'p_soap', speed: 40 }, 2);
  for (let i = 0; i < 150; i++) e.tick(1 / 30);
  sweep(e, 'rinse', {}, 4);
  e.updateMetrics();
  assert.equal(e.finds[0].revealed, true);
  assert.ok(e.collectFind(0));
  assert.equal(e.collectFind(0), null);
});

test('квирк regrow возвращает грязь', () => {
  const e = eng({ layers: [{ type: 'dust', cover: 0.3, amt: 0.3 }] }, { quirks: [{ id: 'regrow', every: 1, size: 4, amount: 0.8, type: 'mud' }] });
  const m0 = e.dirt[D.mud].reduce((a, b) => a + b, 0);
  for (let i = 0; i < 90; i++) e.tick(1 / 30);
  assert.ok(e.dirt[D.mud].reduce((a, b) => a + b, 0) > m0 + 5);
});

test('наклон переносит пену, встряска ограничена кулдауном', () => {
  const e = eng({ layers: [{ type: 'mud', cover: 0.5, amt: 0.8 }] });
  for (let x = 20; x < 25; x++) for (let y = 40; y < 45; y++) { e.foam[y * GW + x] = 1; e.foamProd[y * GW + x] = 1; }
  const cm0 = [...e.foam].reduce((a, v, i) => a + v * (i % GW), 0) / [...e.foam].reduce((a, b) => a + b, 0);
  for (let i = 0; i < 40; i++) e.applyTilt(1, 0, 1 / 30);
  const cm1 = [...e.foam].reduce((a, v, i) => a + v * (i % GW), 0) / [...e.foam].reduce((a, b) => a + b, 0);
  assert.ok(cm1 > cm0 + 0.5);
  assert.equal(e.shake(), true);
  assert.equal(e.shake(), false);
});

test('время спасения продлевает лимит', () => {
  const e = eng({ layers: [{ type: 'dust', cover: 0.3, amt: 0.3 }] });
  e.addTime(25);
  assert.equal(e.limit, 125);
});

test('грид имеет ожидаемый размер', () => { assert.equal(GN, GW * GH); });
