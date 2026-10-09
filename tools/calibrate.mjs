// Калибровка: бот проходит все сюжетные заказы на типичном наборе района. Пишет game/js/data/calibration.js.
import { writeFileSync } from 'node:fs';
import { runBot } from '../game/js/sim/bot.js';
import { storyOrders, refKit, SEASONS } from '../game/js/core/progress.js';
import { PRODUCTS, CONSUMABLE_PRICES } from '../game/js/data/gear.js';

const need = { p_eco: 1, p_soap: 1, p_degreaser: 2, p_enzyme: 3, p_antimold: 5, p_oxy: 6 };
const price = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.price]));
export function stockFor(season, big = 80) {
  const products = {};
  for (const p of PRODUCTS) if ((need[p.id] ?? 1) <= season) products[p.id] = big;
  return { products, water: 600, steam: 300, filter: season >= 4 ? 'f_hepa' : season >= 2 ? 'f_coal' : 'f_paper' };
}
const out = {};
const rows = [];
for (const s of SEASONS) {
  const orders = storyOrders(s.id);
  for (const o of orders) {
    const kit = { ...refKit(s.id), stock: stockFor(s.id) };
    const r = runBot({ profile: o.profile, seed: o.seed, kit, limit: 900, speed: 40, quirks: o.quirks, finds: o.finds, target: 97 });
    let cost = r.used.water * CONSUMABLE_PRICES.water + r.used.steam * CONSUMABLE_PRICES.steam;
    for (const [id, n] of Object.entries(r.used.products)) cost += n * price[id];
    cost += 4;
    out[o.id] = { par: Math.round(r.time), cost: Math.round(cost), clean: Math.round(r.clean) };
    rows.push(`${o.id} par=${Math.round(r.time)} cost=${Math.round(cost)} clean=${r.clean.toFixed(1)} ${o.absurd ? 'ABS ' + o.quirks[0].id : ''}`);
  }
}
writeFileSync(new URL('../game/js/data/calibration.js', import.meta.url), `// Генерируется tools/calibrate.mjs. Время «par» (сек, бот на референсном наборе) и себестоимость.\nexport default ${JSON.stringify(out)};\n`);
console.log(rows.join('\n'));
