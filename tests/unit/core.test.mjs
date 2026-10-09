import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as ST from '../../game/js/core/state.js';
import { SEASONS, storyOrders, seasonDone, seasonUnlocked, FOLLOWER_REQ, dirtForSeason, ABSURD_STYLES, CULTURES_BY_SEASON, QUIRK_IDS } from '../../game/js/core/progress.js';
import { settle, starsFor, deskMul, caps, unitPrice, rescueCost } from '../../game/js/core/economy.js';
import { timeMul, recordResult } from '../../game/js/core/adaptive.js';
import { STYLES } from '../../game/js/carpet/styles/index.js';
import FINDS from '../../game/js/data/finds.js';
import ACH from '../../game/js/data/achievements.js';
import TEXTS from '../../game/js/data/texts.js';

test('10 сезонов, по 6 заказов, 5-й абсурдный', () => {
  assert.equal(SEASONS.length, 10);
  for (const s of SEASONS) {
    assert.equal(s.orders.length, 6);
    s.orders.forEach((o, i) => {
      assert.equal(o.quirks.length > 0, i === 4, `${o.id} квирк`);
      assert.ok(o.quirks.every((q) => QUIRK_IDS.includes(q)));
      assert.ok(STYLES[o.style], `${o.id}: нет стиля ${o.style}`);
      if (i === 4) assert.ok(ABSURD_STYLES.includes(o.style));
      const avail = dirtForSeason(s.id);
      assert.ok(o.dirtFocus.every((t) => avail.includes(t)), `${o.id}: грязь ${o.dirtFocus}`);
      for (const f of o.finds) assert.ok(FINDS.some((x) => x.id === f), `${o.id}: нет находки ${f}`);
    });
  }
});

test('все заказы собираются и корректны', () => {
  for (let s = 1; s <= 10; s++) for (const o of storyOrders(s)) {
    assert.ok(o.limit >= 60 && o.limit <= 600, `${o.id} limit ${o.limit}`);
    assert.ok(o.pay > 0 && o.profile.layers.length >= 1);
    assert.ok(o.profile.layers.every((l) => l.cover > 0 && l.amt > 0 && l.amt <= 1));
  }
});

test('новая игра: доска, цены, склад', () => {
  const s = ST.createState(); ST.ensureBoard(s);
  assert.equal(s.board.side.length, 3);
  assert.ok(s.coins > 0);
  assert.equal(caps(s).products, 40);
  assert.ok(unitPrice(s, 'product', 'p_soap') > 0);
});

test('покупки: инструмент, склад, апгрейд', () => {
  const s = ST.createState(); s.coins = 5000; s.season = 3; s.maxSeason = 3;
  assert.equal(ST.buyTool(s, 'v_fox').ok, true);
  assert.equal(s.equipped.vacuum, 'v_fox');
  assert.equal(ST.buyTool(s, 'v_fox').ok, false);
  assert.equal(ST.canBuyTool(s, 'v_hippo').ok, false);
  const c0 = s.coins;
  assert.equal(ST.buyConsumable(s, 'product', 'p_soap', 5).ok, true);
  assert.ok(s.coins < c0);
  assert.equal(ST.buyUpgrade(s, 'storage').ok, true);
  assert.equal(caps(s).products, 65);
});

test('звёзды и оплата растут с качеством', () => {
  assert.equal(starsFor(99), 3); assert.equal(starsFor(92), 2); assert.equal(starsFor(75), 1); assert.equal(starsFor(60), 0);
  const s = ST.createState();
  const order = storyOrders(1)[0];
  const mk = (clean, left) => settle(s, order, { clean, leftFrac: left, finds: [] });
  assert.ok(mk(99, 0.5).total > mk(80, 0.1).total);
  assert.ok(mk(60, 0).total < mk(72, 0).total);
  assert.ok(mk(99, 0.5).rep >= 2);
});

test('applyResult: пост, прогресс, остатки, достижения', () => {
  const s = ST.createState(); ST.ensureBoard(s);
  const order = storyOrders(1)[0];
  const out = ST.applyResult(s, order, { clean: 99, leftFrac: 0.4, finds: ['f_button'], leftover: { products: { p_soap: 2 }, water: 80, steam: 0 } }, []);
  assert.equal(out.stars, 3);
  assert.equal(s.progress.done[order.id].stars, 3);
  assert.equal(s.gallery.length, 1);
  assert.equal(s.inventory.products.p_soap, 2);
  assert.ok(out.unlocked.some((a) => a.id === 'a_jobs_1'));
  assert.ok(s.followers > 0);
});

test('район открывается после заказов и подписчиков', () => {
  const s = ST.createState();
  assert.equal(seasonUnlocked(s, 2), false);
  for (const o of SEASONS[0].orders) s.progress.done[o.id] = { stars: 1 };
  assert.equal(seasonDone(s, 1), true);
  assert.equal(seasonUnlocked(s, 2), false);
  s.followers = FOLLOWER_REQ[1];
  assert.equal(seasonUnlocked(s, 2), true);
  assert.equal(ST.enterSeason(s, 2), true);
  assert.equal(s.season, 2);
});

test('адаптивная сложность ограничена ±20%', () => {
  const s = ST.createState();
  for (let i = 0; i < 6; i++) recordResult(s, { clean: 40, leftFrac: 0, rescued: false });
  assert.ok(timeMul(s) <= 1.2 && timeMul(s) > 1.1);
  for (let i = 0; i < 6; i++) recordResult(s, { clean: 99, leftFrac: 0.8, rescued: false });
  assert.ok(timeMul(s) >= 0.85 && timeMul(s) < 0.95);
});

test('спасение дорожает с районом и использованием', () => {
  assert.ok(rescueCost({ season: 10 }, 1) > rescueCost({ season: 1 }, 0));
});

test('контент: достижения и тексты по схеме', () => {
  assert.ok(ACH.length >= 40); assert.ok(FINDS.length >= 60);
  assert.equal(new Set(ACH.map((a) => a.id)).size, ACH.length);
  assert.ok(TEXTS.sideBriefs.length >= 80 && TEXTS.sideClients.length >= 60 && TEXTS.decor.length >= 24);
  for (const k of ['perfect', 'good', 'poor', 'rescued']) assert.ok(TEXTS.catResults[k].length >= 10);
});

test('сохранение: migrate дополняет недостающие поля', () => {
  const s = ST.migrate({ coins: 7 });
  assert.equal(s.coins, 7); assert.ok(s.settings && s.workshop && s.inventory.products);
});
