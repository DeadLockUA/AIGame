import { PRODUCTS } from '../game/js/data/gear.js';
const need = { p_eco: 1, p_soap: 1, p_degreaser: 2, p_enzyme: 3, p_antimold: 5, p_oxy: 6 };
export function stockFor(season, big = 80) {
  const products = {};
  for (const p of PRODUCTS) if ((need[p.id] ?? 1) <= season) products[p.id] = big;
  return { products, water: 600, steam: 300, filter: season >= 4 ? 'f_hepa' : season >= 2 ? 'f_coal' : 'f_paper' };
}
