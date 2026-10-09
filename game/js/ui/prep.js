// Экран подготовки: набор, закупка расходников, вызовы.
import { h, icon, toast, clear } from './dom.js';
import { A } from './app.js';
import { avatarEl } from './avatar.js';
import { thumb } from './thumbs.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../audio/haptics.js';
import { DIRT, PRODUCTS, ALL_TOOLS, ALL_PRODUCTS, ALL_FILTERS, FILTERS, TOOLS_BY_PHASE, PHASE_NAMES } from '../data/gear.js';
import { CHALLENGES } from '../data/workshop.js';
import { THRESHOLD, QUIRK_INFO } from '../core/progress.js';
import * as ST from '../core/state.js';
import { caps, unitPrice, productAvailable, filterAvailable, deskMul } from '../core/economy.js';
import { timeMul, failStreak } from '../core/adaptive.js';
import { fmt, fmtTime } from '../util.js';
import { dirtDot, dirtName, rerender } from './hub.js';
import { runWash } from './wash.js';
import { showResult } from './result.js';
import { sensors } from './sensors.js';
import { recommend, autoBuy, ensureStarter } from '../core/advice.js';

export function openPrep(order) {
  const { state, root } = A;
  if (root.querySelector('.overlay')) return;
  const chosen = new Set();
  const ov = h('div', { class: 'overlay' });
  const sheet = h('div', { class: 'sheet' });
  ov.appendChild(sheet);
  root.appendChild(ov);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  function close() { ov.remove(); }

  function render() {
    clear(sheet);
    const tm = timeMul(state);
    const rush = chosen.has('c_rush');
    const limit = Math.round(order.limit * tm * (rush ? 0.7 : 1));
    const chs = CHALLENGES.filter((c) => chosen.has(c.id));
    const payMul = chs.reduce((a, c) => a * c.pay, 1) * deskMul(state);
    const rec = recommend(order, state);

    const head = h('div', { class: 'head' }, h('h3', null, order.title), h('button', { class: 'xbtn', 'aria-label': 'Закрыть', onClick: close }, icon('close')));
    const body = h('div', { class: 'body' });
    // клиент
    body.appendChild(h('div', { class: 'quote' }, avatarEl(order.client.avatar, 52), h('div', null, h('b', null, order.client.name), h('div', { class: 'muted' }, order.client.role || ''), h('div', { style: { marginTop: '4px' } }, '«' + (order.intro[0] || 'Отмойте, пожалуйста.') + '»'))));
    // условия
    body.appendChild(h('div', { class: 'card' },
      h('div', { class: 'row sb' }, h('div', { class: 'row' }, thumb({ style: order.style, seed: order.seed }, 'thumb'), h('div', null, h('div', { class: 'chips' }, order.dirtFocus.map((t) => h('span', { class: 'chip' }, dirtDot(t), dirtName(t)))), h('div', { class: 'muted', style: { marginTop: '6px' } }, `Нужно отмыть хотя бы ${THRESHOLD}%, три звезды от 98%`))),
        h('div', { style: { textAlign: 'right' } }, h('div', { class: 'price' }, icon('coin'), '~' + fmt(order.pay * payMul)), h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, icon('clock'), h('b', null, fmtTime(limit)))))));
    if (failStreak(state) >= 4) body.appendChild(h('div', { class: 'card', style: { background: '#e6f6ef' } }, h('b', null, 'Режим поддержки'), h('div', { class: 'muted' }, 'Несколько неудач подряд: ковёр чуть чище, времени больше. Это временно.')));
    if (order.quirks.length) {
      const q = QUIRK_INFO[order.quirks[0].id];
      body.appendChild(h('div', { class: 'card', style: { background: '#f3e6fb' } }, h('span', { class: 'badge' }, 'АБСУРД'), ' ', h('b', null, q.name), h('div', { class: 'muted' }, q.desc)));
    }
    // набор
    body.appendChild(h('div', { class: 'h2' }, 'Набор', h('small', null, 'меняется в магазине')));
    const kitRow = h('div', { class: 'grid3' });
    for (const [ph, key] of [['vacuum', 'vacuum'], ['apply', 'applicator'], ['rinse', 'rinse']]) {
      const t = ALL_TOOLS[state.equipped[key]];
      const owned = TOOLS_BY_PHASE[ph].filter((x) => ST.ownsTool(state, x.id));
      const novac = ph === 'vacuum' && chosen.has('c_novac');
      kitRow.appendChild(h('button', { class: 'card tap find', style: { margin: 0, opacity: novac ? 0.4 : 1 }, onClick: () => {
        if (owned.length < 2) { toast('Других инструментов пока нет. Загляни в магазин.'); return; }
        const i = owned.findIndex((x) => x.id === t.id);
        ST.equipTool(state, owned[(i + 1) % owned.length].id); audio.ui('tick'); A.save(); render();
      } }, h('div', { class: 'muted' }, PHASE_NAMES[ph]), icon(ph === 'vacuum' ? 'vacuum' : ph === 'apply' ? 'spray' : t.steam ? 'steam' : 'rinse', 'big'), h('b', { style: { fontSize: '.8em' } }, t.name.replace(/ [«"].*$/, '')), h('div', { class: 'muted' }, owned.length > 1 ? 'нажми, чтобы сменить' : 'охват ' + t.radius)));
    }
    body.appendChild(kitRow);
    // расходники
    body.appendChild(h('div', { class: 'h2' }, 'Расходники', h('small', null, 'остатки сохраняются')));
    const costEl = h('div');
    const lines = [];
    const addLine = (kind, id, name, color) => {
      const have = ST.stockOf(state, kind, id);
      const price = unitPrice(state, kind, kind === 'water' || kind === 'steam' ? null : id);
      const need = kind === 'product' ? rec.products[id] : kind === 'water' ? rec.water : kind === 'steam' ? rec.steam : kind === 'filter' ? 1 : 0;
      const buy = (n) => { const r = ST.buyConsumable(state, kind, id, n); if (r.ok) { audio.ui('buy'); A.save(); A.refreshTop(); render(); } else { audio.ui('error'); toast(r.why, 'bad'); } };
      const step = kind === 'water' || kind === 'steam' ? 20 : 1;
      lines.push(h('div', { class: 'card' }, h('div', { class: 'row' },
        h('i', { style: { width: '20px', height: '20px', borderRadius: '50%', background: color, border: '2px solid rgba(0,0,0,.15)', flex: 'none' } }),
        h('div', { class: 'grow' }, h('b', null, name), need ? h('div', { class: have < need * 0.7 ? 'chip warn' : 'muted' }, `на заказ примерно ${need}` + (have >= need ? ' (хватает)' : have < need * 0.7 ? ': маловато' : '')) : null),
        h('div', { class: 'stepper' }, h('button', { 'aria-label': 'Меньше', onClick: () => { toast('Остатки хранятся на складе'); } }, icon('minus')), h('b', null, String(Math.round(have * 10) / 10)), h('button', { 'aria-label': 'Больше', onClick: () => buy(step) }, icon('plus'))),
        h('div', { class: 'price', style: { minWidth: '52px', justifyContent: 'flex-end' } }, icon('coin'), price.toFixed(price < 1 ? 2 : 1)))));
    };
    const needProducts = Object.keys(rec.products);
    const plist = PRODUCTS.filter((p) => productAvailable(state, p) && (needProducts.includes(p.id) || ST.stockOf(state, 'product', p.id) > 0 || p.id === 'p_soap'));
    plist.forEach((p) => addLine('product', p.id, p.name, `rgb(${p.color.join(',')})`));
    const rin = ALL_TOOLS[state.equipped.rinse];
    if (rin.steam) addLine('steam', 'steam', 'Пар', '#e8eef3'); else addLine('water', 'water', 'Вода', '#6bb6e6');
    const fl = FILTERS.filter((f) => filterAvailable(state, f));
    fl.forEach((f) => addLine('filter', f.id, 'Фильтр: ' + f.name, '#c9bba3'));
    body.append(...lines);
    body.appendChild(h('button', { class: 'btn teal block', onClick: () => doAutoBuy() }, 'Автоподбор набора'));

    // вызовы
    body.appendChild(h('div', { class: 'h2' }, 'Вызовы', h('small', null, 'по желанию: больше наград')));
    CHALLENGES.forEach((c) => body.appendChild(h('div', { class: 'card tap row', style: { borderColor: chosen.has(c.id) ? 'var(--teal)' : '' }, onClick: () => { chosen.has(c.id) ? chosen.delete(c.id) : chosen.add(c.id); audio.ui('tick'); render(); } },
      h('div', { class: 'switch' + (chosen.has(c.id) ? ' on' : '') }), h('div', { class: 'grow' }, h('b', null, c.name), h('div', { class: 'muted' }, c.desc)), h('div', null, h('div', { class: 'price' }, 'оплата ×' + c.pay), c.rep ? h('div', { class: 'price' }, icon('rep'), '+' + c.rep) : null))));

    const noVacOk = true;
    const foot = h('div', { class: 'foot' },
      h('div', { class: 'grow muted' }, 'Запас: ', h('b', null, `${Math.floor(state.coins)}`), ' монет'),
      h('button', { class: 'btn', onClick: () => start(chs) }, icon('play'), 'К работе'));
    sheet.append(head, body, foot);
  }

  function doAutoBuy() {
    const { spent, ok } = autoBuy(state, order);
    audio.ui(spent > 0 ? 'buy' : 'tick'); A.save(); A.refreshTop();
    toast(spent > 0 ? `Закуплено на ${Math.round(spent)} монет` : ok ? 'Всё уже есть' : 'Не хватает монет', spent > 0 ? 'good' : ok ? '' : 'bad');
    render();
  }

  async function start(chs) {
    const gift = ensureStarter(state);
    if (gift) { toast(gift, 'good'); A.save(); A.refreshTop(); }
    if (!Object.values(state.inventory.products).some((n) => n > 0.05)) { toast('Нет средств. Купи хоть что-нибудь, хотя бы эко-гель.', 'bad'); audio.ui('error'); return; }
    close(); audio.ui('success'); haptics.event('tap');
    if (!state.settings.sensorsAsked && sensors.available) {
      state.settings.sensorsAsked = true;
      if (state.settings.sensors) await sensors.enable().catch(() => false);
    } else if (state.settings.sensors && sensors.available) sensors.enable();
    const res = await runWash({ state, order, challenges: chs, root, onQuit: () => { rerender(); } });
    if (res.quit) { A.save(); A.go('hub'); return; }
    await showResult({ order, challenges: chs, res });
  }
  render();
}
