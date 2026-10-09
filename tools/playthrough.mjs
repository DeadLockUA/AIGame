// Симуляция прохождения всей игры ботом: оценка времени, экономики и числа побочных заказов.
// node tools/playthrough.mjs [скорость бота, клеток/с] [множитель «человек медленнее бота»]
import * as ST from '../game/js/core/state.js';
import { SEASONS, storyOrders, seasonDone, seasonUnlocked, FOLLOWER_REQ } from '../game/js/core/progress.js';
import { autoBuy } from '../game/js/core/advice.js';
import { timeMul, failStreak } from '../game/js/core/adaptive.js';
import { bonus, rescueCost, RESCUE_SECONDS, lvl } from '../game/js/core/economy.js';
import { VACUUMS, APPLICATORS, RINSERS, MODS, ALL_FILTERS } from '../game/js/data/gear.js';
import { WORKSHOP } from '../game/js/data/workshop.js';
import TEXTS from '../game/js/data/texts.js';
import { runBot } from '../game/js/sim/bot.js';

const SPEED = Number(process.argv[2] || 36);
const HUMAN = Number(process.argv[3] || 1.3);
const OVERHEAD = 50; // секунд на меню, подготовку и чтение за заказ

const s = ST.createState();
s.board.seed = 12345;
ST.ensureBoard(s);
let t = 0, jobs = 0, sideJobs = 0, fails = 0, rescues = 0;
const starCount = [0, 0, 0, 0];
const failIds = {};
const log = [];
const seasonStats = {};

function equipBest() {
  const score = { vacuum: (t) => t.radius * t.power, applicator: (t) => t.radius * t.deposit, rinse: (t) => t.radius * t.pressure };
  for (const [list, key] of [[VACUUMS, 'vacuum'], [APPLICATORS, 'applicator'], [RINSERS, 'rinse']]) {
    const owned = list.filter((x) => s.owned.tools.includes(x.id));
    owned.sort((a, b) => score[key](b) - score[key](a));
    s.equipped[key] = owned[0].id;
  }
}
function shop() {
  let bought = true;
  while (bought) {
    bought = false;
    for (const [list, key] of [[VACUUMS, 'vacuum'], [APPLICATORS, 'applicator'], [RINSERS, 'rinse']]) {
      const owned = list.filter((x) => s.owned.tools.includes(x.id));
      const next = list.find((x) => !s.owned.tools.includes(x.id) && ST.canBuyTool(s, x.id).ok !== undefined);
      // следующий по цене
      const cand = list.filter((x) => !s.owned.tools.includes(x.id)).sort((a, b) => a.price - b.price)[0];
      if (cand && s.coins >= cand.price * 1.5 + 60 && ST.canBuyTool(s, cand.id).ok) { ST.buyTool(s, cand.id); bought = true; }
    }
    for (const w of WORKSHOP) {
      const c = ST.upgradeCost(s, w.id);
      if (c && s.coins >= c.coins * 1.5 + 60 && s.rep >= c.rep) { ST.buyUpgrade(s, w.id); bought = true; }
    }
    equipBest();
    for (const m of MODS) {
      if (ST.canBuyMod(s, m.id).ok && s.coins >= m.price * 2 + 100) { ST.buyMod(s, m.id); bought = true; }
    }
    for (const d of TEXTS.decor.slice().sort((a, b) => a.price / a.followers - b.price / b.followers)) {
      if (!s.owned.decor.includes(d.id) && s.coins >= d.price * 2.5 + 100 && s.followers < FOLLOWER_REQ[Math.min(9, s.season)] * 1.2) { ST.buyDecor(s, d); bought = true; }
    }
  }
}

function runOrder(order) {
  shop();
  autoBuy(s, order);
  const products = {};
  for (const [id, n] of Object.entries(s.inventory.products)) if (n > 0.01) products[id] = n;
  const filter = Object.keys(s.inventory.filters).filter((id) => s.inventory.filters[id] > 0).sort((a, b) => ALL_FILTERS[b].quality - ALL_FILTERS[a].quality)[0] || null;
  const kit = { vacuum: s.equipped.vacuum, applicator: s.equipped.applicator, rinse: s.equipped.rinse, mods: s.equipped.mods, bonus: bonus(s), stock: { products, water: s.inventory.water, steam: s.inventory.steam, filter } };
  let limit = Math.round(order.limit * timeMul(s));
  let rescued = false, grace = 0;
  const ease = failStreak(s) >= 4 ? 0.75 : 1;
  const prof = ease === 1 ? order.profile : { layers: order.profile.layers.map((l) => ({ ...l, cover: l.cover * ease, amt: l.amt * (0.9 + 0.1 * ease) })) };
  let r = runBot({ profile: prof, seed: order.seed, kit, limit, speed: SPEED, quirks: order.quirks, finds: order.finds, target: 98 });
  // спасение: если не дотянули до порога и хватает репутации
  let uses = 0;
  while (r.clean < 70 && s.rep >= rescueCost(order, uses) && uses < 2) {
    s.rep -= rescueCost(order, uses); uses++; rescued = true; rescues++;
    limit += RESCUE_SECONDS * uses;
    r = runBot({ profile: prof, seed: order.seed, kit: { ...kit, stock: { products: { ...products }, water: s.inventory.water, steam: s.inventory.steam, filter } }, limit, speed: SPEED, quirks: order.quirks, finds: order.finds, target: 98 });
  }
  const used = r.used;
  const left = { products: {}, water: Math.max(0, s.inventory.water - used.water), steam: Math.max(0, s.inventory.steam - used.steam) };
  for (const [id, n] of Object.entries(products)) left.products[id] = Math.max(0, n - (used.products[id] || 0));
  const res = { clean: r.clean, leftFrac: Math.max(0, (limit - r.time) / limit), rescued, finds: r.eng.finds.filter((f) => f.revealed).map((f) => f.id), leftover: left, filterUsed: filter, usedVacuum: true, timeSec: r.time };
  const before = s.coins;
  const out = ST.applyResult(s, order, res, []);
  if (out.stars === 0) { fails++; failIds[order.id] = (failIds[order.id] || 0) + 1; if (failIds[order.id] === 3) console.log('застрял на', order.id, order.quirks.map((q) => q.id).join(','), 'чистота', r.clean.toFixed(1), 'лимит', limit, 'время', r.time.toFixed(0), 'набор', JSON.stringify([s.equipped.vacuum, s.equipped.applicator, s.equipped.rinse]), 'монет', Math.round(s.coins), 'расходники', JSON.stringify(Object.fromEntries(Object.entries(s.inventory.products).map(([k, v]) => [k, +v.toFixed(1)]))), 'вода', s.inventory.water); }
  starCount[out.stars]++;
  const dur = Math.min(r.time, limit + 5) * HUMAN + OVERHEAD;
  t += dur; jobs++;
  if (order.kind === 'side') sideJobs++;
  const st = (seasonStats[order.season] ||= { jobs: 0, side: 0, t: 0, coins: 0, fails: 0 });
  st.jobs++; st.t += dur; st.coins += out.total; if (order.kind === 'side') st.side++; if (out.stars === 0) st.fails++;
  return out;
}

let guard = 0;
while (!(seasonDone(s, 10)) && guard++ < 330) {
  const sid = s.season;
  const story = storyOrders(sid).filter((o) => !(s.progress.done[o.id]?.stars > 0));
  if (story.length) { runOrder(story[0]); continue; }
  // район закрыт по сюжету
  if (sid < 10 && seasonUnlocked(s, sid + 1)) { ST.enterSeason(s, sid + 1); continue; }
  if (sid >= 10) break;
  // нужны подписчики: побочные заказы
  ST.ensureBoard(s);
  const side = s.board.side.slice().sort((a, b) => b.pay - a.pay)[0];
  runOrder(side);
}
for (const [k, v] of Object.entries(seasonStats)) log.push(`район ${k}: заказов ${v.jobs} (побочных ${v.side}), провалов ${v.fails}, время ${(v.t / 60).toFixed(0)} мин, монет за район ${Math.round(v.coins)}`);
console.log(log.join('\n'));
console.log(`ВСЕГО: ${jobs} заказов (побочных ${sideJobs}), ${(t / 3600).toFixed(2)} ч, провалов ${fails}, спасений ${rescues}`);
console.log('звёзды 0/1/2/3:', starCount.join(' / '));
console.log(`итог: монет ${Math.round(s.coins)}, репутации ${s.rep}, подписчиков ${s.followers}, инструментов ${s.owned.tools.length}, ачивок ${Object.keys(s.achievements).length}, завершён: ${seasonDone(s, 10)}`);
