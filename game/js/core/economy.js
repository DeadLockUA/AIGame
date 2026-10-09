// Экономика: цены, доступность, расчёт награды, спасение заказа.
import { PRODUCTS, FILTERS, CONSUMABLE_PRICES, VACUUMS, APPLICATORS, RINSERS, MODS } from '../data/gear.js';
import { WORKSHOP } from '../data/workshop.js';
import { THRESHOLD } from './progress.js';
import { clamp } from '../util.js';

export const lvl = (state, id) => state.workshop[id] || 0;

export function caps(state) {
  const L = lvl(state, 'storage');
  return { products: 40 + 25 * L, filters: 4 + 2 * L, water: 200 + 100 * L, steam: 80 + 60 * L };
}
export const discount = (state) => 1 - 0.04 * lvl(state, 'storage');
export const deskMul = (state) => 1 + [0, 0.08, 0.16, 0.25][lvl(state, 'desk')];
export const boardSlots = (state) => 3 + lvl(state, 'board');
export const modSlots = (state) => (lvl(state, 'lab') >= 3 ? 2 : 1);
export function bonus(state) {
  const L = lvl(state, 'lab');
  return { rate: 1 + [0, 0, 0.1, 0.2][L], dry: 1 + 0.6 * lvl(state, 'dryer') };
}

const TOOL_TIER_SEASON = [1, 1, 3, 5, 7];
export function toolUnlockSeason(phase, id) {
  const list = phase === 'vacuum' ? VACUUMS : phase === 'apply' ? APPLICATORS : RINSERS;
  const i = list.findIndex((t) => t.id === id);
  return TOOL_TIER_SEASON[i] ?? 1;
}
export function productAvailable(state, p) {
  const s = state.season;
  const need = { p_eco: 1, p_soap: 1, p_degreaser: 2, p_enzyme: 3, p_antimold: 5, p_oxy: 6 }[p.id] ?? 1;
  if (s < need && !Object.keys(state.progress.done).length) return false;
  if (p.id === 'p_oxy' && lvl(state, 'lab') < 1) return false;
  return maxSeasonReached(state) >= need;
}
export function filterAvailable(state, f) {
  return maxSeasonReached(state) >= { f_paper: 1, f_coal: 2, f_hepa: 4 }[f.id];
}
export function maxSeasonReached(state) { return Math.max(state.season, state.maxSeason || 1); }
export function modsAvailable(state) { return maxSeasonReached(state) >= 3; }

export function unitPrice(state, kind, id) {
  let base;
  if (kind === 'product') base = PRODUCTS.find((p) => p.id === id).price;
  else if (kind === 'filter') base = FILTERS.find((p) => p.id === id).price;
  else base = CONSUMABLE_PRICES[kind];
  return Math.max(0.1, base * discount(state));
}

export const starsFor = (clean) => (clean >= 98 ? 3 : clean >= 90 ? 2 : clean >= THRESHOLD ? 1 : 0);

export function rescueCost(order, uses) {
  return 1 + Math.floor((order.season - 1) / 3) + uses;
}
export const RESCUE_SECONDS = 25;

/** Расчёт итогов. result: { clean, leftFrac, rescued, finds:[{value,rep}], challenges:[id], appeal } */
export function settle(state, order, result, challenges = []) {
  const stars = starsFor(result.clean);
  const mulDesk = deskMul(state);
  let chPay = 1, chRep = 0;
  for (const c of challenges) { chPay *= c.pay; chRep += c.rep; }
  let base = order.pay * mulDesk * chPay;
  let pay;
  if (stars === 0) pay = result.clean < 5 ? 0 : base * 0.4 * Math.pow(clamp(result.clean / THRESHOLD, 0, 1), 2);
  else pay = base * (0.62 + 0.38 * clamp((result.clean - THRESHOLD) / (98 - THRESHOLD), 0, 1));
  const speed = stars > 0 && !result.rescued ? base * 0.35 * clamp(result.leftFrac, 0, 1) : 0;
  const findsCoins = result.finds.reduce((a, f) => a + f.value, 0);
  const findsRep = result.finds.reduce((a, f) => a + (f.rep || 0), 0);
  let rep = findsRep + (stars > 0 ? chRep : 0);
  if (stars === 3 && !result.rescued) rep += 1 + (result.leftFrac >= 0.3 ? 1 : 0);
  if (stars === 3 && order.absurd) rep += 1;
  const followers = stars === 0 ? 0 : Math.round(Math.pow(stars, 1.3) * (3 + order.season) * (order.absurd ? 1.5 : 1) * (1 + (result.appeal || 0)) * (order.kind === 'side' ? 0.75 : 1) + (stars === 3 ? 2 : 0));
  return {
    stars, pay: Math.round(pay), speed: Math.round(speed), findsCoins, rep, followers,
    total: Math.round(pay + speed + findsCoins),
  };
}

export function kitCost(state, kit) {
  let c = 0;
  for (const [id, n] of Object.entries(kit.products || {})) c += n * unitPrice(state, 'product', id);
  c += (kit.water || 0) * unitPrice(state, 'water');
  c += (kit.steam || 0) * unitPrice(state, 'steam');
  return c;
}

export { WORKSHOP, MODS };
