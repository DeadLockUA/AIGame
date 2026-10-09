// Главный хаб: заказы, магазин, мастерская, лента, прочее.
import { h, icon, toast, clear } from './dom.js';
import { A } from './app.js';
import { avatarEl } from './avatar.js';
import { thumb } from './thumbs.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../audio/haptics.js';
import { DIRT, VACUUMS, APPLICATORS, RINSERS, MODS, PRODUCTS, FILTERS, ALL_TOOLS, ALL_MODS, PHASE_NAMES } from '../data/gear.js';
import { WORKSHOP } from '../data/workshop.js';
import TEXTS from '../data/texts.js';
import ACH from '../data/achievements.js';
import FINDS from '../data/finds.js';
import { SEASONS, storyOrders, THRESHOLD, FOLLOWER_REQ, seasonDone, seasonUnlocked, QUIRK_INFO } from '../core/progress.js';
import * as ST from '../core/state.js';
import { caps, unitPrice, productAvailable, filterAvailable, toolUnlockSeason, maxSeasonReached, modsAvailable, modSlots, lvl, deskMul, boardSlots } from '../core/economy.js';
import { fmt } from '../util.js';
import { openPrep } from './prep.js';
import { postCard } from './feed.js';
import { openSettings, openAchievements, openCollection, openAbout } from './more.js';
import { showSeasonStory } from './story.js';

const BANNERS = [
  ['#e9895a', '#d9644a'], ['#e0a23c', '#c8742c'], ['#6a79c8', '#4a5aa8'], ['#3a8fb8', '#2a6f98'], ['#a2693c', '#7a4a2a'],
  ['#8a5aa8', '#5e3a82'], ['#4f9a6a', '#357a50'], ['#b8445a', '#8a2c42'], ['#6c6a8a', '#4a486a'], ['#d9a02a', '#a86c18'],
];
export const dirtDot = (id) => { const d = DIRT.find((x) => x.id === id); return h('i', { style: { background: `rgb(${d.color.join(',')})` } }); };
export const dirtName = (id) => DIRT.find((x) => x.id === id).name;

let tab = 'orders';
let viewSeason = null;
let shopTab = 'tools';
let body, tabbar, topEl;
const pills = {};

export function showHub(opts = {}) {
  const { state, root } = A;
  clear(root);
  if (!viewSeason || viewSeason > state.season) viewSeason = state.season;
  topEl = h('div', { class: 'topbar' });
  const tips = { coins: 'Монеты: тратятся на инструменты, средства и мастерскую.', rep: 'Репутация: спасает заказ, когда вышло время, и открывает редкие инструменты.', followers: 'Подписчики: красивые посты открывают новые районы.' };
  const mk = (key, ic) => { const el = h('button', { class: 'pill', 'aria-label': tips[key], onClick: () => toast(tips[key]) }, icon(ic), h('span', { class: 'v' }, '')); pills[key] = el; return el; };
  topEl.append(mk('coins', 'coin'), mk('rep', 'rep'), mk('followers', 'heart'));
  body = h('div', { class: 'content' });
  tabbar = h('div', { class: 'tabbar' });
  const defs = [['orders', 'orders', 'Заказы'], ['shop', 'shop', 'Магазин'], ['workshop', 'workshop', 'Мастерская'], ['feed', 'feed', 'Лента'], ['more', 'more', 'Ещё']];
  for (const [id, ic, label] of defs) {
    tabbar.appendChild(h('button', { class: 'tab' + (tab === id ? ' active' : ''), data: { tab: id }, onClick: () => { tab = id; audio.ui('tab'); haptics.event('tap'); renderTabs(); renderBody(); } }, icon(ic), label));
  }
  root.append(h('div', { class: 'screen' }, topEl, body, tabbar));
  A.refreshTop = refreshTop;
  refreshTop(); renderTabs(); renderBody();
  audio.musicMenu(state.season);
  if (opts.afterResult) { /* ничего */ }
}

let prev = {};
function refreshTop() {
  const s = A.state;
  const vals = { coins: Math.floor(s.coins), rep: s.rep, followers: s.followers };
  for (const k of Object.keys(vals)) {
    const el = pills[k]; if (!el) continue;
    el.querySelector('.v').textContent = fmt(vals[k]);
    if (prev[k] !== undefined && prev[k] !== vals[k]) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    prev[k] = vals[k];
  }
}
function renderTabs() { for (const b of tabbar.children) b.classList.toggle('active', b.dataset.tab === tab); }
export function renderBody() {
  const keep = body.scrollTop;
  clear(body);
  ({ orders: tabOrders, shop: tabShop, workshop: tabWorkshop, feed: tabFeed, more: tabMore })[tab]();
  body.scrollTop = keep;
  refreshTop();
}
export function rerender() { renderBody(); }

// ---------- Заказы ----------
function stars(n) { return h('span', { class: 'stars' }, [1, 2, 3].map((i) => h('span', { class: i <= n ? '' : 'off' }, icon('star')))); }
function dirtChips(order) { return h('div', { class: 'chips' }, order.dirtFocus.map((t) => h('span', { class: 'chip' }, dirtDot(t), dirtName(t)))); }

function orderCard(order, state) {
  const done = state.progress.done[order.id];
  const boss = order.absurd;
  const card = h('div', { class: 'card tap order' + (done ? ' done' : '') + (boss ? ' boss' : ''), onClick: () => { audio.ui('open'); openPrep(order); } },
    thumb({ style: order.style, seed: order.seed }, 'thumb'),
    h('div', { class: 'meta' },
      h('div', { class: 't' }, order.title),
      h('div', { class: 'sub' }, `${order.client.name}${order.client.role ? ', ' + order.client.role : ''}`),
      h('div', { class: 'row', style: { marginTop: '4px', gap: '6px', flexWrap: 'wrap' } },
        boss ? h('span', { class: 'badge' }, 'АБСУРД') : null, order.kind === 'story' && done ? [h('span', { class: 'chip good' }, 'Выполнено'), stars(done.stars)] : null,
        h('span', { class: 'price' }, icon('coin'), '~' + fmt(order.pay * deskMul(state))),
        h('span', { class: 'chip' }, icon('clock'), Math.round(order.limit) + ' с')),
      h('div', { style: { marginTop: '5px' } }, dirtChips(order)),
    ),
  );
  return card;
}

function tabOrders() {
  const state = A.state;
  const sid = viewSeason;
  const season = SEASONS[sid - 1];
  const [c1, c2] = BANNERS[sid - 1];
  const orders = storyOrders(sid);
  const doneN = orders.filter((o) => (state.progress.done[o.id]?.stars || 0) > 0).length;
  const canPrev = sid > 1, canNext = sid < state.maxSeason && sid < 10;
  const banner = h('div', { class: 'banner', style: { background: `linear-gradient(135deg, ${c1}, ${c2})` } },
    h('div', { class: 'num' }, String(sid).padStart(2, '0')),
    h('h1', null, season.name), h('p', null, season.subtitle),
    h('div', { class: 'mascot', html: icon('cat').innerHTML }),
    h('div', { class: 'row', style: { position: 'absolute', left: '12px', bottom: '8px', gap: '6px' } },
      canPrev ? h('button', { class: 'btn sm ghost', onClick: () => { viewSeason--; if (viewSeason < state.season) { /* просмотр прошлого района */ } renderBody(); } }, icon('back')) : null,
      canNext ? h('button', { class: 'btn sm ghost', onClick: () => { viewSeason++; renderBody(); } }, icon('arrow')) : null));
  body.appendChild(banner);
  if (sid !== state.season) {
    body.appendChild(h('div', { class: 'card row sb' }, h('span', { class: 'muted' }, 'Ты смотришь другой район.'), h('button', { class: 'btn sm teal', onClick: () => { ST.enterSeason(state, sid); A.save(); viewSeason = sid; renderBody(); } }, 'Работать здесь')));
  }
  body.appendChild(h('div', { class: 'card' }, h('div', { class: 'row sb' }, h('b', null, 'Заказы района'), h('b', null, `${doneN} / 6`)), h('div', { class: 'bar', style: { marginTop: '6px' } }, h('i', { style: { width: (doneN / 6) * 100 + '%' } })), h('div', { class: 'muted', style: { marginTop: '6px' } }, season.blurb)));

  // переход в следующий район
  if (sid === state.season && sid < 10) {
    const need = FOLLOWER_REQ[sid];
    if (seasonDone(state, sid)) {
      if (seasonUnlocked(state, sid + 1)) {
        body.appendChild(h('div', { class: 'card', style: { background: '#fff4d6' } }, h('b', null, 'Новый район открыт!'), h('div', { class: 'muted' }, SEASONS[sid].name + ': ' + SEASONS[sid].blurb),
          h('button', { class: 'btn gold block', style: { marginTop: '10px' }, onClick: async () => { audio.ui('success'); ST.enterSeason(state, sid + 1); viewSeason = sid + 1; A.save(); await showSeasonStory(SEASONS[sid], 'intro'); renderBody(); } }, 'Переехать в район «' + SEASONS[sid].name + '»')));
      } else {
        body.appendChild(h('div', { class: 'card' }, h('div', { class: 'row sb' }, h('b', null, 'До следующего района'), h('span', { class: 'price' }, icon('heart'), `${fmt(state.followers)} / ${fmt(need)}`)),
          h('div', { class: 'bar', style: { marginTop: '6px' } }, h('i', { style: { width: Math.min(100, (state.followers / need) * 100) + '%' } })),
          h('div', { class: 'muted', style: { marginTop: '6px' } }, 'Подписчики приходят за красивые посты. Бери заказы с доски: от них растёт лента.')));
      }
    } else if (state.followers < need) {
      body.appendChild(h('div', { class: 'card muted' }, `Чтобы открыть «${SEASONS[sid].name}», нужны ${fmt(need)} подписчиков и все заказы района (сейчас ${fmt(state.followers)}).`));
    }
  }
  body.appendChild(h('div', { class: 'h2' }, 'Заказы района', h('small', null, 'сюжетные')));
  orders.forEach((o) => body.appendChild(orderCard(o, state)));
  if (sid === state.season) {
    body.appendChild(h('div', { class: 'h2' }, 'Доска заказов', h('small', null, `${boardSlots(state)} места`)));
    if (!state.board.side.length) ST.ensureBoard(state);
    state.board.side.forEach((o) => body.appendChild(orderCard(o, state)));
    body.appendChild(h('div', { class: 'muted', style: { textAlign: 'center', margin: '8px' } }, 'Выполненный заказ заменяется новым. Побочные заказы приносят деньги и подписчиков.'));
  }
}

// ---------- Магазин ----------
function statChips(t, phase) {
  const c = [];
  c.push(h('span', { class: 'chip' }, `Охват ${t.radius}`));
  if (phase === 'vacuum') c.push(h('span', { class: 'chip' }, `Сила ${t.power}`), h('span', { class: 'chip' }, `Пыль ${Math.round(t.aff[0] * 100)}%`), h('span', { class: 'chip' }, `Шерсть ${Math.round(t.aff[1] * 100)}%`), h('span', { class: 'chip' }, `Песок ${Math.round(t.aff[2] * 100)}%`));
  if (phase === 'apply') c.push(h('span', { class: 'chip' }, `Пена ${t.deposit}`), h('span', { class: 'chip' }, `Расход ${t.usage}`), h('span', { class: 'chip' }, `Скраб ${t.scrub}`));
  if (phase === 'rinse') c.push(h('span', { class: 'chip' }, `Напор ${t.pressure}`), h('span', { class: 'chip' }, `Расход ${t.flow}`), t.steam ? h('span', { class: 'chip good' }, 'Пар') : null);
  return h('div', { class: 'stat chips' }, c);
}
function priceTag(price, rep) {
  return h('span', { class: 'price' }, price ? [icon('coin'), fmt(price)] : null, rep ? [icon('rep'), String(rep)] : null, !price && !rep ? 'Бесплатно' : null);
}
function toolCard(t, phase) {
  const state = A.state;
  const owned = ST.ownsTool(state, t.id);
  const eq = Object.values(state.equipped).includes(t.id);
  const check = ST.canBuyTool(state, t.id);
  const lockS = toolUnlockSeason(phase, t.id);
  const locked = !owned && maxSeasonReached(state) < lockS;
  const ic = phase === 'vacuum' ? 'vacuum' : phase === 'apply' ? 'spray' : t.steam ? 'steam' : 'rinse';
  const card = h('div', { class: 'card tool' + (eq ? ' equipped' : '') + (locked ? ' locked' : '') },
    h('div', { class: 'badgebox' }, icon(locked ? 'lock' : ic)),
    h('div', { class: 'grow' }, h('div', { style: { fontWeight: 900 } }, t.name), h('div', { class: 'muted' }, t.desc), statChips(t, phase)),
    h('div', { style: { textAlign: 'right' } },
      owned ? (eq ? h('span', { class: 'chip good' }, 'Надето') : h('button', { class: 'btn sm teal', onClick: () => { ST.equipTool(state, t.id); audio.ui('tick'); A.save(); renderBody(); } }, 'Надеть'))
        : locked ? h('span', { class: 'chip' }, `Район ${lockS}`)
          : h('div', null, priceTag(t.price, t.rep), check.ok ? null : h('div', { class: 'muted', style: { fontSize: '.72em' } }, check.why), h('div', { style: { height: '4px' } }), h('button', { class: 'btn sm gold' + (check.ok ? '' : ' disabled'), onClick: () => { const r = ST.buyTool(state, t.id); if (r.ok) { audio.ui('buy'); haptics.event('buy'); toast('Куплено: ' + t.name, 'good'); A.save(); renderBody(); } else { audio.ui('error'); toast(r.why, 'bad'); } } }, 'Купить'))));
  return card;
}
function consRow(kind, id, name, desc, color) {
  const state = A.state;
  const have = ST.stockOf(state, kind, id);
  const cap = kind === 'product' ? caps(state).products : kind === 'filter' ? caps(state).filters : caps(state)[kind];
  const price = unitPrice(state, kind, kind === 'water' || kind === 'steam' ? null : id);
  const buy = (n) => { const r = ST.buyConsumable(state, kind, id, n); if (r.ok) { audio.ui('buy'); haptics.event('buy'); A.save(); renderBody(); } else { audio.ui('error'); toast(r.why, 'bad'); } };
  return h('div', { class: 'card' }, h('div', { class: 'row' },
    h('i', { style: { width: '22px', height: '22px', borderRadius: '50%', background: color || '#bbb', border: '2px solid rgba(0,0,0,.15)', flex: 'none' } }),
    h('div', { class: 'grow' }, h('div', { style: { fontWeight: 900 } }, name), h('div', { class: 'muted' }, desc)),
    h('div', { style: { textAlign: 'right' } }, h('div', { class: 'price' }, icon('coin'), price.toFixed(price < 1 ? 2 : 1), ' / ед.'), h('div', { class: 'muted' }, `${Math.round(have * 10) / 10} / ${cap}`))),
    h('div', { class: 'row', style: { marginTop: '8px', justifyContent: 'flex-end', gap: '6px' } }, [1, 5, 10, kind === 'water' || kind === 'steam' ? 50 : 20].map((n) => h('button', { class: 'btn sm ghost', onClick: () => buy(n) }, '+' + n))));
}

function tabShop() {
  const state = A.state;
  const seg = h('div', { class: 'seg' }, [['tools', 'Инструменты'], ['mods', 'Насадки'], ['cons', 'Расходники']].map(([id, label]) => h('button', { class: shopTab === id ? 'on' : '', onClick: () => { shopTab = id; audio.ui('tab'); renderBody(); } }, label)));
  body.appendChild(h('div', { class: 'h2' }, 'Магазин'));
  body.appendChild(seg);
  if (shopTab === 'tools') {
    for (const [ph, list] of [['vacuum', VACUUMS], ['apply', APPLICATORS], ['rinse', RINSERS]]) {
      body.appendChild(h('div', { class: 'h2' }, PHASE_NAMES[ph]));
      list.forEach((t) => body.appendChild(toolCard(t, ph)));
    }
  } else if (shopTab === 'mods') {
    body.appendChild(h('div', { class: 'muted' }, `Насадки вставляются в слоты инструментов: ${modSlots(state)} на инструмент.` + (modsAvailable(state) ? '' : ' Откроются в районе №3.')));
    for (const slot of ['vacuum', 'applicator', 'rinse']) {
      body.appendChild(h('div', { class: 'h2' }, { vacuum: 'Пылесос', applicator: 'Средство', rinse: 'Смыв' }[slot]));
      MODS.filter((m) => m.slot === slot).forEach((m) => {
        const owned = state.owned.mods.includes(m.id), eq = state.equipped.mods[slot].includes(m.id);
        const chk = ST.canBuyMod(state, m.id);
        body.appendChild(h('div', { class: 'card tool' + (eq ? ' equipped' : '') },
          h('div', { class: 'badgebox' }, icon('gear')), h('div', { class: 'grow' }, h('b', null, m.name), h('div', { class: 'muted' }, m.desc)),
          owned ? (eq ? h('button', { class: 'btn sm ghost', onClick: () => { ST.unequipMod(state, m.id); A.save(); renderBody(); } }, 'Снять') : h('button', { class: 'btn sm teal', onClick: () => { ST.equipMod(state, m.id); audio.ui('tick'); A.save(); renderBody(); } }, 'Надеть'))
            : h('div', { style: { textAlign: 'right' } }, priceTag(m.price, m.rep), chk.ok ? null : h('div', { class: 'muted', style: { fontSize: '.72em' } }, chk.why), h('div', { style: { height: '4px' } }), h('button', { class: 'btn sm gold' + (chk.ok ? '' : ' disabled'), onClick: () => { const r = ST.buyMod(state, m.id); if (r.ok) { audio.ui('buy'); toast('Куплено: ' + m.name, 'good'); A.save(); renderBody(); } else toast(r.why, 'bad'); } }, 'Купить'))));
      });
    }
  } else {
    body.appendChild(h('div', { class: 'muted' }, 'Остатки после заказа не пропадают. Вместимость склада растёт с улучшением мастерской.'));
    body.appendChild(h('div', { class: 'h2' }, 'Средства'));
    PRODUCTS.filter((p) => productAvailable(state, p)).forEach((p) => body.appendChild(consRow('product', p.id, p.name, p.desc, `rgb(${p.color.join(',')})`)));
    body.appendChild(h('div', { class: 'h2' }, 'Фильтры'));
    FILTERS.filter((f) => filterAvailable(state, f)).forEach((f) => body.appendChild(consRow('filter', f.id, f.name, f.desc, '#c9bba3')));
    body.appendChild(h('div', { class: 'h2' }, 'Вода и пар'));
    body.appendChild(consRow('water', 'water', 'Вода', 'Нужна лейке, шлангу и душу.', '#6bb6e6'));
    body.appendChild(consRow('steam', 'steam', 'Пар', 'Для парового очистителя.', '#e8eef3'));
  }
}

// ---------- Мастерская ----------
function tabWorkshop() {
  const state = A.state;
  body.appendChild(h('div', { class: 'h2' }, 'Мастерская'));
  WORKSHOP.forEach((w) => {
    const l = lvl(state, w.id), c = ST.upgradeCost(state, w.id);
    body.appendChild(h('div', { class: 'card' }, h('div', { class: 'row' },
      h('div', { class: 'badgebox', style: { width: '46px', height: '46px', borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'var(--paper2)', fontSize: '1.5em' } }, w.icon),
      h('div', { class: 'grow' }, h('b', null, w.name), h('div', { class: 'muted' }, w.desc[0]), h('div', { class: 'chips', style: { marginTop: '4px' } }, h('span', { class: 'chip good' }, w.effect(l)), c ? h('span', { class: 'chip' }, 'Дальше: ' + w.effect(l + 1)) : h('span', { class: 'chip' }, 'Максимум'))),
      c ? h('div', { style: { textAlign: 'right' } }, priceTag(c.coins, c.rep), h('div', { style: { height: '4px' } }), h('button', { class: 'btn sm gold' + (state.coins >= c.coins && state.rep >= c.rep ? '' : ' disabled'), onClick: () => { const r = ST.buyUpgrade(state, w.id); if (r.ok) { audio.ui('buy'); haptics.event('buy'); toast(w.name + ': уровень ' + (l + 1), 'good'); A.save(); renderBody(); } else toast(r.why, 'bad'); } }, 'Улучшить')) : null),
      h('div', { class: 'row', style: { gap: '4px', marginTop: '8px' } }, Array.from({ length: w.max }, (_, i) => h('i', { style: { flex: 1, height: '8px', borderRadius: '5px', background: i < l ? 'var(--mustard)' : 'rgba(58,42,34,.12)' } })))));
  });
  body.appendChild(h('div', { class: 'h2' }, 'Декор', h('small', null, 'растят подписчиков')));
  const grid = h('div', { class: 'grid2' });
  TEXTS.decor.forEach((d) => {
    const own = state.owned.decor.includes(d.id);
    grid.appendChild(h('div', { class: 'card find', style: { margin: 0, opacity: own ? 1 : 0.95 } },
      h('div', { class: 'em' }, d.emoji), h('b', null, d.name), h('div', { class: 'muted', style: { minHeight: '2.6em' } }, d.desc),
      own ? h('span', { class: 'chip good' }, 'Стоит в мастерской') : h('button', { class: 'btn sm gold' + (state.coins >= d.price ? '' : ' disabled'), onClick: () => { const r = ST.buyDecor(state, d); if (r.ok) { audio.ui('buy'); haptics.event('buy'); toast(`${d.name}: +${d.followers} подписчиков`, 'good'); A.save(); renderBody(); } else toast(r.why, 'bad'); } }, icon('coin'), fmt(d.price)),
      h('div', { class: 'muted' }, '+' + d.followers + ' подписч.')));
  });
  body.appendChild(grid);
}

// ---------- Лента ----------
let feedLimit = 5;
function tabFeed() {
  const state = A.state;
  const likes = state.gallery.reduce((a, p) => a + p.likes, 0);
  body.appendChild(h('div', { class: 'profile' },
    h('div', { class: 'logo' }, h('span', null, '🧼')),
    h('div', { class: 'pstats' }, h('div', null, h('b', null, fmt(state.gallery.length)), h('span', null, 'постов')), h('div', null, h('b', null, fmt(state.followers)), h('span', null, 'подписчиков')), h('div', null, h('b', null, fmt(likes)), h('span', null, 'лайков')))));
  body.appendChild(h('div', { style: { margin: '4px 2px 8px' } }, h('b', null, 'chisty_vors'), h('div', { class: 'muted' }, 'Мойка ковров «Чистый ворс». Пена, пар и красивые узоры. Кот на фото главный.')));
  if (!state.gallery.length) { body.appendChild(h('div', { class: 'empty' }, 'Пока пусто. Отмой первый ковёр, и он появится здесь с фото «до/после».')); return; }
  const list = h('div');
  body.appendChild(list);
  let shown = 0;
  const more = h('button', { class: 'btn ghost block', onClick: () => { addPosts(); } }, 'Показать ещё');
  function addPosts() {
    state.gallery.slice(shown, shown + 4).forEach((p) => list.appendChild(postCard(p)));
    shown = Math.min(state.gallery.length, shown + 4);
    more.style.display = shown < state.gallery.length ? '' : 'none';
  }
  body.appendChild(more);
  addPosts();
}

// ---------- Прочее ----------
function tabMore() {
  const state = A.state;
  const done = Object.keys(state.achievements).length;
  const row = (ic, title, sub, fn) => h('div', { class: 'card tap row', onClick: () => { audio.ui('open'); fn(); } }, h('div', { class: 'badgebox', style: { width: '44px', height: '44px', borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'var(--paper2)' } }, icon(ic)), h('div', { class: 'grow' }, h('b', null, title), h('div', { class: 'muted' }, sub)), icon('arrow'));
  body.appendChild(h('div', { class: 'h2' }, 'Ещё'));
  body.appendChild(row('trophy', 'Достижения', `${done} из ${ACH.length}`, openAchievements));
  body.appendChild(row('find', 'Коллекция находок', `${Object.keys(state.finds).length} из ${FINDS.length}`, openCollection));
  body.appendChild(row('gear', 'Настройки', 'Звук, вибро, датчики, сохранение', openSettings));
  body.appendChild(row('info', 'О игре', 'Совет деда Ефима и немного лора', openAbout));
  const tip = TEXTS.tips[(state.stats.jobs + 3) % TEXTS.tips.length];
  body.appendChild(h('div', { class: 'card quote' }, icon('cat', 'big'), h('div', null, h('b', null, 'Ворсик говорит:'), h('div', null, tip))));
}
