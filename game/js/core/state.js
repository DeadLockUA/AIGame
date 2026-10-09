// Состояние игры и действия над ним. Чистая логика без DOM (кроме storage.js).
import { ALL_TOOLS, ALL_MODS, ALL_PRODUCTS, ALL_FILTERS, TOOLS_BY_PHASE } from '../data/gear.js';
import { WORKSHOP } from '../data/workshop.js';
import ACH from '../data/achievements.js';
import FINDS from '../data/finds.js';
import TEXTS from '../data/texts.js';
import { SEASONS, seasonDone, seasonUnlocked, buildSideOrder, FOLLOWER_REQ } from './progress.js';
import { caps, unitPrice, boardSlots, modSlots, settle, maxSeasonReached, toolUnlockSeason, modsAvailable } from './economy.js';
import { recordResult, failStreak } from './adaptive.js';
import { RNG, hashString } from '../util.js';

export const SAVE_VERSION = 1;
export const FIND_BY_ID = Object.fromEntries(FINDS.map((f) => [f.id, f]));

export function createState() {
  return {
    v: SAVE_VERSION,
    created: Date.now(),
    coins: 160, rep: 0, followers: 0,
    owned: { tools: ['v_mouse', 'a_spray', 'r_can'], mods: [], decor: [] },
    equipped: { vacuum: 'v_mouse', applicator: 'a_spray', rinse: 'r_can', mods: { vacuum: [], applicator: [], rinse: [] } },
    inventory: { products: { p_soap: 6, p_eco: 4 }, filters: { f_paper: 3 }, water: 140, steam: 0 },
    workshop: { storage: 0, dryer: 0, desk: 0, board: 0, lab: 0 },
    season: 1, maxSeason: 1,
    progress: { done: {}, seasonsSeen: {} },
    board: { seed: (Math.random() * 1e9) | 0, n: 0, side: [] },
    gallery: [],
    finds: {},
    achievements: {},
    stats: { jobs: 0, perfect: 0, stars3: 0, finds: 0, fast: 0, noVacuum: 0, noRescueStreak: 0, bestNoRescue: 0, absurd: 0, challenges: 0, peakCoins: 160, seasons: 0 },
    adaptive: { hist: [] },
    tutorial: { seen: {} },
    settings: { music: 0.7, sfx: 0.9, haptics: 1, sensors: true, textScale: 1, colorblind: false },
    playMs: 0,
  };
}

export function migrate(s) {
  const base = createState();
  const out = { ...base, ...s };
  for (const k of ['owned', 'equipped', 'inventory', 'workshop', 'progress', 'board', 'stats', 'adaptive', 'tutorial', 'settings']) out[k] = { ...base[k], ...(s[k] || {}) };
  out.equipped.mods = { ...base.equipped.mods, ...(s.equipped?.mods || {}) };
  out.inventory.products = { ...(s.inventory?.products || base.inventory.products) };
  out.inventory.filters = { ...(s.inventory?.filters || base.inventory.filters) };
  out.v = SAVE_VERSION;
  return out;
}

// --- доска заказов ---
export function ensureBoard(state) {
  const need = boardSlots(state);
  state.board.side = state.board.side.filter((o) => o.season === state.season);
  while (state.board.side.length < need) {
    state.board.side.push(buildSideOrder(state, TEXTS, state.board.n++));
  }
  state.board.side = state.board.side.slice(0, need);
}
export function removeSide(state, id) {
  state.board.side = state.board.side.filter((o) => o.id !== id);
  ensureBoard(state);
}

// --- покупки ---
export function ownsTool(state, id) { return state.owned.tools.includes(id); }
export function toolCategory(id) {
  for (const [ph, list] of Object.entries(TOOLS_BY_PHASE)) if (list.some((t) => t.id === id)) return ph;
  return null;
}
export function canBuyTool(state, id) {
  const t = ALL_TOOLS[id];
  const ph = toolCategory(id);
  if (!t || ownsTool(state, id)) return { ok: false, why: 'Уже куплено' };
  if (maxSeasonReached(state) < toolUnlockSeason(ph, id)) return { ok: false, why: `Откроется в районе №${toolUnlockSeason(ph, id)}` };
  if (state.coins < t.price) return { ok: false, why: 'Не хватает монет' };
  if (state.rep < (t.rep || 0)) return { ok: false, why: 'Не хватает репутации' };
  return { ok: true };
}
export function buyTool(state, id) {
  const c = canBuyTool(state, id);
  if (!c.ok) return c;
  const t = ALL_TOOLS[id];
  state.coins -= t.price; state.rep -= t.rep || 0;
  state.owned.tools.push(id);
  const key = toolCategory(id) === 'vacuum' ? 'vacuum' : toolCategory(id) === 'apply' ? 'applicator' : 'rinse';
  if (t.radius >= (ALL_TOOLS[state.equipped[key]]?.radius ?? 0)) state.equipped[key] = id;
  return { ok: true };
}
export function equipTool(state, id) {
  if (!ownsTool(state, id)) return false;
  const ph = toolCategory(id);
  state.equipped[ph === 'apply' ? 'applicator' : ph] = id;
  return true;
}
export function canBuyMod(state, id) {
  const m = ALL_MODS[id];
  if (state.owned.mods.includes(id)) return { ok: false, why: 'Уже куплено' };
  if (!modsAvailable(state)) return { ok: false, why: 'Откроется в районе №3' };
  if (state.coins < m.price) return { ok: false, why: 'Не хватает монет' };
  if (state.rep < (m.rep || 0)) return { ok: false, why: 'Не хватает репутации' };
  return { ok: true };
}
export function buyMod(state, id) {
  const c = canBuyMod(state, id);
  if (!c.ok) return c;
  const m = ALL_MODS[id];
  state.coins -= m.price; state.rep -= m.rep || 0;
  state.owned.mods.push(id);
  equipMod(state, id);
  return { ok: true };
}
export function equipMod(state, id) {
  const m = ALL_MODS[id];
  const list = state.equipped.mods[m.slot === 'applicator' ? 'applicator' : m.slot];
  if (list.includes(id)) return;
  list.push(id);
  while (list.length > modSlots(state)) list.shift();
}
export function unequipMod(state, id) {
  const m = ALL_MODS[id];
  const key = m.slot;
  state.equipped.mods[key] = state.equipped.mods[key].filter((x) => x !== id);
}

export function stockOf(state, kind, id) {
  if (kind === 'product') return state.inventory.products[id] || 0;
  if (kind === 'filter') return state.inventory.filters[id] || 0;
  return state.inventory[kind] || 0;
}
export function buyConsumable(state, kind, id, qty) {
  const cap = caps(state);
  const have = stockOf(state, kind, id);
  const limit = kind === 'product' ? cap.products : kind === 'filter' ? cap.filters : cap[kind];
  const n = Math.max(0, Math.min(qty, limit - have));
  if (n <= 0) return { ok: false, why: 'Склад полон' };
  const price = unitPrice(state, kind, kind === 'water' || kind === 'steam' ? null : id) * n;
  if (state.coins < price) {
    const afford = Math.floor(state.coins / unitPrice(state, kind, kind === 'water' || kind === 'steam' ? null : id));
    if (afford <= 0) return { ok: false, why: 'Не хватает монет' };
    return buyConsumable(state, kind, id, afford);
  }
  state.coins -= price;
  if (kind === 'product') state.inventory.products[id] = have + n;
  else if (kind === 'filter') state.inventory.filters[id] = have + n;
  else state.inventory[kind] = have + n;
  return { ok: true, n, price };
}
export function upgradeCost(state, id) {
  const w = WORKSHOP.find((x) => x.id === id);
  const l = state.workshop[id] || 0;
  if (l >= w.max) return null;
  return { coins: w.prices[l], rep: w.rep ? w.rep[l] : 0 };
}
export function buyUpgrade(state, id) {
  const c = upgradeCost(state, id);
  if (!c) return { ok: false, why: 'Максимум' };
  if (state.coins < c.coins) return { ok: false, why: 'Не хватает монет' };
  if (state.rep < c.rep) return { ok: false, why: 'Не хватает репутации' };
  state.coins -= c.coins; state.rep -= c.rep;
  state.workshop[id] = (state.workshop[id] || 0) + 1;
  if (id === 'board') ensureBoard(state);
  return { ok: true };
}
export function buyDecor(state, d) {
  if (state.owned.decor.includes(d.id)) return { ok: false, why: 'Уже куплено' };
  if (state.coins < d.price) return { ok: false, why: 'Не хватает монет' };
  state.coins -= d.price;
  state.owned.decor.push(d.id);
  state.followers += d.followers;
  return { ok: true };
}

// --- итоги заказа ---
const NICKS_A = ['ковро', 'пена', 'ворс', 'пушок', 'чисто', 'уютка', 'нитка', 'щётка', 'мыльный', 'узор', 'тихий', 'рыжий', 'сонный', 'колючий'];
const NICKS_B = ['_любитель', '_фан', '_мастер', 'Кот', '_2000', '_из_подъезда', '_обзор', '88', '_у_окна', '_не_спит', 'ва', '_настроение'];
function nick(rng) { return '@' + rng.pick(NICKS_A) + rng.pick(NICKS_B); }

function makeComments(rng, stars, absurd) {
  const out = [];
  const n = 2 + (stars >= 2 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const pool = stars === 0 ? TEXTS.commentsFunny : rng.chance(absurd ? 0.5 : 0.3) ? TEXTS.commentsFunny : TEXTS.commentsPraise;
    out.push({ who: nick(rng), text: rng.pick(pool) });
  }
  if (rng.chance(0.5)) out.push({ who: '@vorsik_cat', text: rng.pick(TEXTS.commentsCat) });
  return out;
}

/**
 * Применяет результат мойки. result: { clean, leftFrac, rescued, finds:[id], timeSec, usedVacuum, leftover:{products,water,steam,filter}, appeal }
 * Возвращает объект итогов для экрана.
 */
export function applyResult(state, order, result, challenges = []) {
  const finds = result.finds.map((id) => FIND_BY_ID[id]).filter(Boolean);
  const out = settle(state, order, { ...result, finds }, challenges);
  if (result.repSpent) state.rep = Math.max(0, state.rep - result.repSpent);
  const first = !state.progress.done[order.id];
  state.coins += out.total;
  state.rep += out.rep;
  state.followers += out.followers;
  state.stats.peakCoins = Math.max(state.stats.peakCoins, state.coins);
  state.stats.attempts = (state.stats.attempts || 0) + 1;
  if (out.stars > 0) state.stats.jobs++;
  if (out.stars === 3) { state.stats.stars3++; if (!result.rescued) state.stats.perfect++; }
  if (out.stars > 0 && result.leftFrac >= 0.5) state.stats.fast++;
  if (out.stars > 0 && !result.usedVacuum) state.stats.noVacuum++;
  if (order.absurd && out.stars > 0) state.stats.absurd++;
  if (out.stars > 0) state.stats.challenges += challenges.length;
  if (out.stars > 0 && !result.rescued) state.stats.noRescueStreak++; else state.stats.noRescueStreak = 0;
  state.stats.bestNoRescue = Math.max(state.stats.bestNoRescue, state.stats.noRescueStreak);
  for (const f of finds) { state.finds[f.id] = (state.finds[f.id] || 0) + 1; state.stats.finds++; }
  // остатки расходников возвращаются на склад
  const fin = (v) => (Number.isFinite(v) ? Math.max(0, v) : 0);
  if (result.leftover) {
    const cap = caps(state);
    for (const [id, v] of Object.entries(result.leftover.products || {})) state.inventory.products[id] = Math.min(cap.products, Math.round(fin(v) * 100) / 100);
    state.inventory.water = Math.min(cap.water, Math.round(fin(result.leftover.water)));
    state.inventory.steam = Math.min(cap.steam, Math.round(fin(result.leftover.steam)));
  }
  if (result.filterUsed) state.inventory.filters[result.filterUsed] = Math.max(0, (state.inventory.filters[result.filterUsed] || 0) - 1);
  if (order.kind === 'story') {
    const prev = state.progress.done[order.id];
    state.progress.done[order.id] = { stars: Math.max(prev?.stars || 0, out.stars), clean: Math.max(prev?.clean || 0, result.clean) };
  } else {
    removeSide(state, order.id);
  }
  recordResult(state, { clean: result.clean, leftFrac: result.leftFrac, rescued: result.rescued });
  // пост в ленте
  const rng = new RNG(hashString(order.id + ':' + state.stats.attempts));
  const post = {
    id: 'p' + state.stats.attempts, orderId: order.id, kind: order.kind, title: order.title, style: order.style, seed: order.seed,
    season: order.season, idx: order.idx, stars: out.stars, clean: Math.round(result.clean), caption: order.caption || '',
    client: order.client.name, quirks: order.quirks.map((q) => q.id), finds: order.finds, profile: order.profile,
    comments: makeComments(rng, out.stars, order.absurd), likes: Math.round(out.followers * 3.4 + rng.int(3, 20)), t: Date.now(),
  };
  if (out.stars > 0) { state.gallery.unshift(post); if (state.gallery.length > 400) state.gallery.length = 400; }
  out.post = out.stars > 0 ? post : null;
  // сезон
  out.seasonDone = false; out.newSeason = null;
  if (order.kind === 'story' && seasonDone(state, order.season) && !state.progress.seasonsSeen['s' + order.season]) {
    state.progress.seasonsSeen['s' + order.season] = true;
    state.stats.seasons++;
    out.seasonDone = true;
  }
  const next = state.season + 1;
  if (next <= 10 && seasonUnlocked(state, next) && state.season === order.season && seasonDone(state, order.season)) {
    // район откроется кнопкой «Переехать» в хабе; здесь только отмечаем доступность
    state.maxSeason = Math.max(state.maxSeason, Math.min(10, state.season));
    out.newSeason = next;
  }
  // помощь при неудачах: чтобы нельзя было застрять без денег на мыло
  out.mercy = 0;
  if (out.stars === 0 && failStreak(state) >= 2 && state.coins < 60) { out.mercy = Math.ceil(60 - state.coins); state.coins += out.mercy; }
  out.unlocked = evalAchievements(state);
  return out;
}

export function enterSeason(state, id) {
  if (!seasonUnlocked(state, id)) return false;
  state.season = id;
  state.maxSeason = Math.max(state.maxSeason, id);
  state.board.side = [];
  ensureBoard(state);
  return true;
}

// --- достижения ---
function metric(state, key) {
  const s = state.stats;
  switch (key) {
    case 'jobs': return s.jobs;
    case 'perfect': return s.perfect;
    case 'stars3': return s.stars3;
    case 'finds': return s.finds;
    case 'followers': return state.followers;
    case 'coins': return s.peakCoins;
    case 'fast': return s.fast;
    case 'noVacuum': return s.noVacuum;
    case 'noRescue': return s.bestNoRescue;
    case 'seasons': return s.seasons;
    case 'absurd': return s.absurd;
    case 'owned': return state.owned.tools.length;
    case 'mods': return state.owned.mods.length;
    case 'decor': return state.owned.decor.length;
    case 'challenges': return s.challenges;
    case 'gallery': return state.gallery.length;
    default: return 0;
  }
}
export function evalAchievements(state) {
  const out = [];
  for (const a of ACH) {
    if (state.achievements[a.id]) continue;
    if (metric(state, a.check) >= a.goal) {
      state.achievements[a.id] = Date.now();
      state.coins += a.rewardCoins || 0;
      state.rep += a.rewardRep || 0;
      out.push(a);
    }
  }
  return out;
}
export const achievementProgress = (state, a) => Math.min(a.goal, metric(state, a.check));

export function totalStoryDone(state) {
  let n = 0;
  for (const s of SEASONS) for (const o of s.orders) if ((state.progress.done[o.id]?.stars || 0) > 0) n++;
  return n;
}
export { FOLLOWER_REQ };
