// Сезоны, генерация заказов (сюжетных и побочных), профили грязи, пороги открытия.
import s01 from '../data/story/season01.js';
import s02 from '../data/story/season02.js';
import s03 from '../data/story/season03.js';
import s04 from '../data/story/season04.js';
import s05 from '../data/story/season05.js';
import s06 from '../data/story/season06.js';
import s07 from '../data/story/season07.js';
import s08 from '../data/story/season08.js';
import s09 from '../data/story/season09.js';
import s10 from '../data/story/season10.js';
import CAL from '../data/calibration.js';
import { RNG, hashString, clamp } from '../util.js';
import { placeFinds } from '../wash/dirtgen.js';

export const SEASONS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10];
export const THRESHOLD = 70;
// Подписчики, необходимые для открытия района.
export const FOLLOWER_REQ = [0, 80, 290, 620, 1100, 1750, 2600, 3600, 4800, 6300];
// Типы грязи, открытые к сезону (накопительно).
export const DIRT_BY_SEASON = [
  ['dust', 'hair', 'mud'],
  ['dust', 'hair', 'mud', 'sand', 'grease'],
  ['dust', 'hair', 'mud', 'sand', 'grease', 'stain'],
  ['dust', 'hair', 'mud', 'sand', 'grease', 'stain', 'deep'],
];
export const ALL_DIRT_IDS = ['dust', 'hair', 'mud', 'sand', 'grease', 'stain', 'deep', 'mold'];
export const dirtForSeason = (s) => (s <= 4 ? DIRT_BY_SEASON[s - 1] : ALL_DIRT_IDS);

export const CULTURES_BY_SEASON = {
  1: ['retro', 'scandi'], 2: ['turkish', 'moroccan', 'indian'], 3: ['persian', 'indian', 'scandi'],
  4: ['japanese', 'scandi', 'moroccan'], 5: ['persian', 'turkish', 'moroccan'], 6: ['persian', 'indian', 'japanese', 'scandi', 'turkish'],
  7: ['persian', 'indian', 'retro'], 8: ['navajo', 'retro', 'japanese', 'persian'], 9: ['persian', 'indian', 'moroccan', 'turkish', 'japanese', 'navajo'],
  10: ['persian', 'indian', 'moroccan', 'turkish', 'japanese', 'navajo', 'scandi', 'retro'],
};
export const ABSURD_STYLES = ['pizza', 'space', 'ocean', 'cats', 'ducks', 'wizard', 'garden', 'mushrooms', 'dino', 'candy', 'robots', 'clouds'];
export const QUIRK_IDS = ['regrow', 'ghosts', 'dark', 'sway', 'slippery', 'mirror', 'heavy', 'foamy'];
export const QUIRK_INFO = {
  regrow: { name: 'Зарастает', desc: 'Грязь снова появляется на отмытых местах.' },
  ghosts: { name: 'Призрачные пятна', desc: 'Время от времени проступают новые пятна.' },
  dark: { name: 'Тьма', desc: 'Видно только то, что рядом с пальцем.' },
  sway: { name: 'Живой ковёр', desc: 'Ковёр качается из стороны в сторону.' },
  slippery: { name: 'Скользкий', desc: 'Инструмент скользит с инерцией.' },
  mirror: { name: 'Зеркало', desc: 'Управление по горизонтали отражено.' },
  heavy: { name: 'Тяжёлый', desc: 'Средства и вода расходуются в полтора раза быстрее.' },
  foamy: { name: 'Пенный', desc: 'Пена сама растекается по ковру.' },
};

const round5 = (n) => Math.max(20, Math.round(n / 5) * 5);
export const LIMIT_MUL = 1.35, LIMIT_ADD = 10;
const limitFor = (par) => round5(par * LIMIT_MUL + LIMIT_ADD);

/** Профиль грязи: слои по типам. d — сквозная сложность 0..59, avail — открытые типы. */
export function makeProfile(d, focus, avail, rng) {
  const u = clamp(d / 59, 0, 1);
  const cover = 0.30 + 0.55 * u;
  const amt = 0.6 + 0.4 * u;
  const layers = [{ type: 'dust', cover: 0.35 + 0.25 * u, amt: 0.55 + 0.25 * u }];
  const scale = { dust: 1, hair: 0.8, sand: 0.9, mud: 0.9, grease: 0.7, stain: 0.55, deep: 0.9, mold: 0.65 };
  const set = new Set(['dust']);
  for (const t of focus) {
    if (set.has(t)) { layers[0].cover = Math.min(0.9, layers[0].cover + 0.15); continue; }
    set.add(t);
    layers.push({ type: t, cover: clamp(cover * (scale[t] ?? 1) * rng.range(0.9, 1.15), 0.12, 0.9), amt: clamp(amt * rng.range(0.9, 1.05), 0.4, 1) });
  }
  // «разнообразие»: до двух дополнительных типов
  const extra = avail.filter((t) => !set.has(t));
  const nExtra = u < 0.2 ? 0 : u < 0.45 ? 1 : u < 0.75 ? 2 : 3;
  for (let i = 0; i < nExtra && extra.length; i++) {
    const t = extra.splice(rng.int(0, extra.length - 1), 1)[0];
    set.add(t);
    layers.push({ type: t, cover: clamp(cover * (scale[t] ?? 1) * 0.55, 0.1, 0.5), amt: clamp(amt * 0.85, 0.35, 0.95) });
  }
  return { layers };
}

export function quirkParams(id, u) {
  switch (id) {
    case 'regrow': return { id, every: 6.5 - 2.5 * u, size: 4, amount: 0.5, type: 'mud' };
    case 'ghosts': return { id, every: 9.5 - 3.5 * u, size: 5, types: ['dust', 'mud', 'stain'] };
    case 'dark': return { id };
    case 'sway': return { id, amp: 0.06 + 0.04 * u, speed: 0.9 };
    case 'slippery': return { id, lag: 0.16 };
    case 'mirror': return { id };
    case 'heavy': return { id, mul: 1.5 };
    case 'foamy': return { id, rate: 0.5 };
    default: return { id };
  }
}

export function refKit(season) {
  const t = Math.min(4, Math.floor((season - 1) / 2));
  const V = ['v_mouse', 'v_fox', 'v_cyclone', 'v_cyclone', 'v_hippo'];
  const A = ['a_spray', 'a_foam', 'a_vortex', 'a_mist', 'a_mist'];
  const R = ['r_can', 'r_hose', 'r_hose', 'r_storm', 'r_storm'];
  return { vacuum: V[t], applicator: A[t], rinse: R[t] };
}

const FIND_COUNT_BY_SEASON = (u) => (u < 0.3 ? 1 : u < 0.7 ? 2 : 3);

/** Достраивает сюжетный заказ числами. */
export function buildStoryOrder(season, idx) {
  const so = season.orders[idx];
  const d = (season.id - 1) * 6 + idx;
  const u = d / 59;
  const seed = hashString(so.id) >>> 0;
  const rng = new RNG(seed);
  const avail = dirtForSeason(season.id);
  const focus = so.dirtFocus.filter((t) => avail.includes(t));
  const profile = makeProfile(d, focus.length ? focus : ['mud'], avail, rng.fork('p'));
  const absurd = so.quirks.length > 0;
  const par = CAL[so.id]?.par ?? 70 + d * 1.6;
  const cost = CAL[so.id]?.cost ?? 25 + d * 3;
  const pay = round5(cost * 2.3 + 45 + 14 * d + (absurd ? 40 : 0));
  return {
    id: so.id, kind: 'story', season: season.id, idx, d, u, seed,
    title: so.title, style: so.style, client: so.client, intro: so.intro, success: so.success, partial: so.partial, fail: so.fail,
    caption: so.caption, dirtFocus: focus, quirks: so.quirks.map((q) => quirkParams(q, u)), absurd,
    finds: placeFinds(so.finds.slice(0, FIND_COUNT_BY_SEASON(u)), seed), findIds: so.finds,
    profile, par, limit: limitFor(par), pay, cost,
  };
}

export function storyOrders(seasonId) {
  const s = SEASONS[seasonId - 1];
  return s.orders.map((_, i) => buildStoryOrder(s, i));
}

/** Побочный заказ для доски. */
export function buildSideOrder(state, texts, n) {
  const seasonId = state.season;
  const rng = new RNG((state.board.seed ^ (n * 2654435761)) >>> 0);
  const avail = dirtForSeason(seasonId);
  const tier = rng.int(0, 5);
  const d = (seasonId - 1) * 6 + tier;
  const u = d / 59;
  const absurd = n % 5 === 4;
  const brief = rng.pick(texts.sideBriefs);
  const client = rng.pick(texts.sideClients);
  const focus = (brief.dirt || []).filter((t) => avail.includes(t));
  if (!focus.length) focus.push(rng.pick(avail));
  if (rng.chance(0.5)) { const x = rng.pick(avail); if (!focus.includes(x)) focus.push(x); }
  const style = absurd ? rng.pick(ABSURD_STYLES) : rng.pick(CULTURES_BY_SEASON[seasonId]);
  const seed = (hashString('side' + n) ^ state.board.seed) >>> 0;
  const profile = makeProfile(d, focus, avail, rng.fork('p'));
  const baseId = SEASONS[seasonId - 1].orders[tier].id;
  const par = (CAL[baseId]?.par ?? 70 + d * 1.6) * (absurd ? 1.1 : 0.95);
  const cost = (CAL[baseId]?.cost ?? 25 + d * 3);
  const quirk = absurd ? [quirkParams(rng.pick(QUIRK_IDS), u)] : [];
  return {
    id: 'side' + n, kind: 'side', season: seasonId, idx: tier, d, u, seed,
    title: absurd ? 'Странный заказ' : 'Заказ с доски', style, client: { name: client.name, role: client.role, avatar: avatarFor(client.name) },
    intro: [brief.text], success: [], partial: [], fail: [], caption: '',
    dirtFocus: focus, quirks: quirk, absurd,
    finds: [], findIds: [], profile, par, limit: limitFor(par),
    pay: round5((cost * 2.1 + 35 + 11 * d) * (absurd ? 1.3 : 1)), cost, n,
  };
}

export function avatarFor(name) {
  const r = new RNG(hashString(name));
  return { skin: r.int(0, 4), hair: r.int(0, 7), hairStyle: r.int(0, 5), shirt: r.int(0, 7), accessory: r.int(0, 5) };
}

export function seasonDone(state, seasonId) {
  const s = SEASONS[seasonId - 1];
  return s.orders.every((o) => (state.progress.done[o.id]?.stars ?? 0) >= 1);
}
export function seasonUnlocked(state, seasonId) {
  if (seasonId === 1) return true;
  return seasonDone(state, seasonId - 1) && state.followers >= FOLLOWER_REQ[seasonId - 1];
}
export function finalCycleDone(state) { return seasonDone(state, 10); }
