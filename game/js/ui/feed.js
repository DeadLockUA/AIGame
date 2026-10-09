// Карточка поста в ленте фирмы.
import { h, icon } from './dom.js';
import { A } from './app.js';
import { WashEngine } from '../wash/engine.js';
import { fillDirt } from '../wash/dirtgen.js';
import { WashView, TOTAL_H } from '../wash/view.js';
import { renderCarpet, CW } from '../carpet/render.js';
import { compareEl } from './result.js';
import { fmt } from '../util.js';

const beforeCache = new Map();
export function makeBefore(p) {
  if (beforeCache.has(p.id)) { const c = beforeCache.get(p.id); const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.getContext('2d').drawImage(c, 0, 0); return n; }
  const eng = new WashEngine({ limit: 1, kit: { vacuum: 'v_mouse', applicator: 'a_spray', rinse: 'r_can', stock: { products: {}, water: 0, steam: 0 } }, quirks: [], seed: p.seed, finds: (p.finds || []).map((f) => ({ ...f })) });
  fillDirt(eng, p.profile, p.seed);
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = TOTAL_H;
  const view = new WashView(cv, eng, { style: p.style, seed: p.seed });
  const snap = view.snapshotBefore();
  beforeCache.set(p.id, snap); if (beforeCache.size > 20) beforeCache.delete(beforeCache.keys().next().value);
  return snap;
}

export function postCard(p) {
  const photo = h('div', { class: 'photo' });
  setTimeout(() => {
    try { photo.appendChild(compareEl(makeBefore(p), renderCarpet({ style: p.style, seed: p.seed }, 1))); } catch (e) { photo.textContent = 'Фото не загрузилось'; }
  }, 30);
  const when = new Date(p.t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return h('div', { class: 'card post' },
    h('div', { class: 'ph' }, h('span', { class: 'mini' }, '🧼'), h('div', { class: 'grow' }, h('div', null, 'chisty_vors'), h('div', { class: 'muted' }, p.title + ' · ' + when)), h('span', { class: 'stars' }, [1, 2, 3].map((i) => h('span', { class: i <= p.stars ? '' : 'off' }, icon('star'))))),
    photo,
    h('div', { class: 'pb' },
      h('div', { class: 'acts' }, h('span', { class: 'row', style: { gap: '4px' } }, icon('heart'), fmt(p.likes)), h('span', { class: 'muted' }, `Чистота ${p.clean}%`)),
      p.caption ? h('div', null, h('b', null, 'chisty_vors '), p.caption) : h('div', null, h('b', null, 'chisty_vors '), 'Ещё один ковёр вернулся к жизни.'),
      p.comments.map((c) => h('div', { class: 'cm' }, h('b', null, c.who + ' '), c.text))));
}
