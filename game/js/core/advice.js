// Советы по набору: сколько и каких средств нужно на заказ. Чистая логика.
import { DIRT, PRODUCTS, ALL_TOOLS, FILTERS } from '../data/gear.js';
import { unitPrice, productAvailable, filterAvailable } from './economy.js';
import * as ST from './state.js';

// Оценка расхода: сколько единиц нужно на этот заказ.
export function recommend(order, state, challengeIds = []) {
  const wet = {};
  for (const L of order.profile.layers) {
    const t = DIRT.findIndex((d) => d.id === L.type);
    if (t >= 3) wet[t] = (wet[t] || 0) + L.cover * L.amt * DIRT[t].weight;
  }
  const total = Object.values(wet).reduce((a, b) => a + b, 0) || 1;
  const picks = {};
  const avail = PRODUCTS.filter((p) => productAvailable(state, p));
  for (const [t, w] of Object.entries(wet)) {
    let best = null, bv = -1;
    for (const p of avail) {
      const v = (p.aff[t] * p.rate) / Math.pow(unitPrice(state, 'product', p.id), 0.65);
      if (v > bv) { bv = v; best = p; }
    }
    if (best) picks[best.id] = (picks[best.id] || 0) + w / total;
  }
  const out = {};
  const base = 6 + order.u * 10;
  const useMul = challengeIds.includes('c_heavy') ? 1.5 : 1;
  for (const [id, share] of Object.entries(picks)) out[id] = Math.max(3, Math.round(base * (0.6 + share) * useMul));
  if (!Object.keys(out).length) out.p_soap = 5;
  const rin = ALL_TOOLS[state.equipped.rinse];
  const steam = rin.steam ? Math.round((30 + order.u * 40) * useMul) : 0;
  const waterMul = (challengeIds.includes('c_dry') ? 2 : 1) * useMul;
  const water = rin.steam ? 0 : Math.round((90 + order.u * 100) * rin.flow * waterMul);
  return { products: out, water, steam };
}


/** Докупает рекомендованное. Возвращает потраченные монеты. */
export function autoBuy(state, order, challengeIds = []) {
  const rec = recommend(order, state, challengeIds);
  let spent = 0, ok = true;
  const need = (kind, id, target) => {
    const have = ST.stockOf(state, kind, id);
    if (have >= target) return;
    const r = ST.buyConsumable(state, kind, id, Math.ceil(target - have));
    if (r.ok) spent += r.price; else ok = false;
  };
  for (const [id, n] of Object.entries(rec.products)) need('product', id, n);
  if (rec.water) need('water', 'water', rec.water);
  if (rec.steam) need('steam', 'steam', rec.steam);
  const best = FILTERS.filter((f) => filterAvailable(state, f)).sort((a, b) => b.quality - a.quality)[0];
  if (!Object.values(state.inventory.filters).some((n) => n > 0) && best) need('filter', best.id, 1);
  return { spent, ok };
}

/** Аварийный набор: если нет средств и денег на них, Ворсик находит заначку. Возвращает текст или null. */
export function ensureStarter(state) {
  const have = Object.values(state.inventory.products).reduce((a, b) => a + b, 0);
  const rin = ALL_TOOLS[state.equipped.rinse];
  let msg = null;
  if (have < 1 && state.coins < 6) {
    state.inventory.products.p_eco = (state.inventory.products.p_eco || 0) + 6;
    msg = 'Ворсик нашёл заначку деда Ефима: 6 порций эко-геля.';
  }
  if (!rin.steam && state.inventory.water < 20 && state.coins < 6) {
    state.inventory.water += 60;
    msg = (msg ? msg + ' ' : '') + 'И немного воды.';
  }
  if (rin.steam && state.inventory.steam < 10 && state.coins < 10) {
    state.inventory.steam += 30;
    msg = (msg ? msg + ' ' : '') + 'И немного пара.';
  }
  return msg;
}
