// Экран мойки: HUD, жесты, фазы, расходники, находки, спасение заказа.
import { h, icon, toast } from './dom.js';
import { WashEngine, GW, GH } from '../wash/engine.js';
import { fillDirt } from '../wash/dirtgen.js';
import { WashView, TOTAL_H } from '../wash/view.js';
import { CW } from '../carpet/render.js';
import { DIRT, PHASES, PHASE_NAMES, ALL_PRODUCTS, ALL_TOOLS, ALL_FILTERS } from '../data/gear.js';
import { QUIRK_INFO, THRESHOLD } from '../core/progress.js';
import { timeMul } from '../core/adaptive.js';
import { bonus, rescueCost, RESCUE_SECONDS } from '../core/economy.js';
import { FIND_BY_ID } from '../core/state.js';
import { CHALLENGES } from '../data/workshop.js';
import TEXTS from '../data/texts.js';
import { sensors } from './sensors.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../audio/haptics.js';
import { fmtTime, clamp } from '../util.js';

export function buildKit(state, challenges) {
  const ids = challenges.map((c) => c.id);
  const products = {};
  for (const [id, n] of Object.entries(state.inventory.products)) if (n > 0.01) products[id] = n;
  const filterId = Object.keys(state.inventory.filters).filter((id) => state.inventory.filters[id] > 0).sort((a, b) => ALL_FILTERS[b].quality - ALL_FILTERS[a].quality)[0] || null;
  return {
    vacuum: state.equipped.vacuum, applicator: state.equipped.applicator, rinse: state.equipped.rinse,
    mods: state.equipped.mods, bonus: bonus(state),
    stock: { products, water: state.inventory.water * (ids.includes('c_dry') ? 0.5 : 1), steam: state.inventory.steam, filter: filterId },
    _filterId: filterId,
  };
}

export function createEngine(state, order, challenges) {
  const kit = buildKit(state, challenges);
  const finds = order.finds.map((f) => ({ ...f, emoji: FIND_BY_ID[f.id]?.emoji || '✨' }));
  const ids = challenges.map((c) => c.id);
  const limit = order.limit * timeMul(state) * (ids.includes('c_rush') ? 0.7 : 1);
  const eng = new WashEngine({ limit: Math.round(limit), kit, quirks: order.quirks, seed: order.seed, finds, heavyExtra: ids.includes('c_heavy') ? 1.5 : 1 });
  fillDirt(eng, order.profile, order.seed);
  return { eng, kit };
}

export function runWash({ state, order, challenges = [], root, onQuit }) {
  return new Promise((resolve) => {
    const { eng, kit } = createEngine(state, order, challenges);
    const spec = { style: order.style, seed: order.seed };
    const noVac = challenges.some((c) => c.id === 'c_novac');
    const quirks = order.quirks;
    const qid = (id) => quirks.some((q) => q.id === id);
    const slip = quirks.find((q) => q.id === 'slippery');

    const canvas = h('canvas');
    const stage = h('div', { class: 'stage' }, canvas);
    const timerEl = h('div', { class: 'timer' }, icon('clock'), h('span', null, fmtTime(eng.limit)));
    const meterFill = h('i');
    const meterTxt = h('span', null, '0%');
    const meter = h('div', { class: 'meter' }, meterFill, h('div', { class: 'thr', style: { left: THRESHOLD + '%' } }), meterTxt);
    const pauseBtn = h('button', { class: 'hb', 'aria-label': 'Пауза' }, icon('pause'));
    const doneBtn = h('button', { class: 'hb', 'aria-label': 'Закончить' }, icon('check'));
    const hud = h('div', { class: 'hud' }, timerEl, meter, pauseBtn, doneBtn);
    const scanEl = h('div', { class: 'scan' });
    const hintEl = h('div', { class: 'hint', style: { display: 'none' } });
    stage.appendChild(hintEl);

    let phase = noVac ? 'apply' : 'vacuum';
    let product = bestProduct(eng);
    const phaseBtns = {};
    const phasesEl = h('div', { class: 'phases' });
    for (const ph of PHASES) {
      const tool = ph === 'vacuum' ? eng.vac : ph === 'apply' ? eng.app : eng.rin;
      const ic = ph === 'vacuum' ? 'vacuum' : ph === 'apply' ? 'spray' : tool.steam ? 'steam' : 'rinse';
      const b = h('button', { class: `phase ${ph}${ph === 'vacuum' && noVac ? ' dis' : ''}`, onClick: () => setPhase(ph) },
        icon(ic), h('span', null, PHASE_NAMES[ph] === 'Смыв' && tool.steam ? 'Пар' : PHASE_NAMES[ph]), h('small', null, tool.name.replace(/ [«"].*$/, '')));
      phaseBtns[ph] = b; phasesEl.appendChild(b);
    }
    const prodRow = h('div', { class: 'prodrow' });
    const gFilter = gauge('filter', 'Фильтр'), gProd = gauge('spray', 'Средство'), gWater = gauge(eng.rin.steam ? 'steam' : 'drop', eng.rin.steam ? 'Пар' : 'Вода');
    const gaugeRow = h('div', { class: 'gauge' }, gFilter.el, gProd.el, gWater.el);
    const dock = h('div', { class: 'dock' }, phasesEl, prodRow, gaugeRow);

    // боковые кнопки: встряска и стрелки наклона
    const shakeBtn = h('button', { class: 'fab', 'aria-label': 'Встряхнуть', onClick: () => doShake() }, icon('shake'));
    const padToggle = h('button', { class: 'fab', 'aria-label': 'Наклон', onClick: () => { pad.style.display = pad.style.display === 'none' ? 'grid' : 'none'; } }, icon('tilt'));
    const side = h('div', { class: 'sidebtns' }, padToggle, shakeBtn);
    let nudge = { x: 0, y: 0, t: 0 };
    const pad = h('div', { class: 'pad', style: { display: 'none' } },
      ...[['u', 0, -1, '↑'], ['l', -1, 0, '←'], ['r', 1, 0, '→'], ['d', 0, 1, '↓']].map(([cl, x, y, t]) => h('button', { class: cl, onClick: () => { nudge = { x, y, t: 0.45 }; haptics.event('tap'); } }, t)));
    stage.append(side, pad);

    const screen = h('div', { class: 'screen wash' }, hud, scanEl, stage, dock);
    root.appendChild(screen);

    // размеры
    let view;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function layout() {
      const r = stage.getBoundingClientRect();
      const aspect = CW / TOTAL_H;
      let w = r.width, hgt = w / aspect;
      if (hgt > r.height) { hgt = r.height; w = hgt * aspect; }
      canvas.style.width = Math.floor(w) + 'px'; canvas.style.height = Math.floor(hgt) + 'px';
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr);
      if (!view) view = new WashView(canvas, eng, spec);
      view.setSize(canvas.width, canvas.height, dpr);
    }
    requestAnimationFrame(layout);
    const ro = new ResizeObserver(() => layout());
    ro.observe(stage);

    // состояние
    let paused = false, ended = false, rescues = 0, rescued = false, started = false, warned = false;
    let last = performance.now(), tAll = 0, hudT = 0, musicT = 0;
    let down = false, px = 0, py = 0, ex = 0, ey = 0, prevEx = 0, prevEy = 0, held = 0, speed = 0, usedVac = false;
    let toolOn = null;
    const seen = state.tutorial.seen;
    let hintTimer = 0, hintLeft = 0;

    function setPhase(ph) {
      if (ph === 'vacuum' && noVac) return;
      phase = ph; audio.ui('tab'); haptics.event('tap');
      for (const k of PHASES) phaseBtns[k].classList.toggle('on', k === ph);
      prodRow.style.display = ph === 'apply' ? 'flex' : 'none';
      refreshDock();
    }
    function refreshProducts() {
      prodRow.replaceChildren();
      const ids = eng.productList.slice().sort((a, b) => ALL_PRODUCTS[a].price - ALL_PRODUCTS[b].price);
      for (const id of ids) {
        const p = ALL_PRODUCTS[id]; const n = eng.stock.products[id] || 0;
        const el = h('button', { class: `prod${id === product ? ' on' : ''}${n < 0.05 ? ' zero' : ''}`, onClick: () => { product = id; audio.ui('tick'); refreshProducts(); refreshDock(); } },
          h('i', { style: { background: `rgb(${p.color.join(',')})` } }), h('span', null, p.name.replace(/ [«"].*$/, '') + ' ' + n.toFixed(1)));
        prodRow.appendChild(el);
      }
      if (!ids.length) prodRow.appendChild(h('div', { class: 'muted' }, 'Нет средств. Загляни в магазин.'));
    }
    function gauge(ic, label) {
      const bar = h('i'); const txt = h('span', null, '');
      const el = h('div', { class: 'g' }, icon(ic), h('div', { class: 'bar' }, bar), txt);
      return { el, set(frac, text) { bar.style.width = Math.round(clamp(frac, 0, 1) * 100) + '%'; txt.textContent = text; el.classList.toggle('empty', frac <= 0.02); } };
    }
    function refreshDock() {
      const f = eng.filter;
      if (f) gFilter.set(1 - eng.filterLoad / (f.cap * eng.vac.filterCap), Math.round((1 - clamp(eng.filterLoad / (f.cap * eng.vac.filterCap), 0, 1)) * 100) + '%');
      else gFilter.set(0.85, '—');
      const have = eng.stock.products[product] || 0;
      const total = Math.max(1, kit.stock.products[product] || 1);
      gProd.set(have / total, have.toFixed(1));
      const cap = eng.rin.steam ? Math.max(1, kit.stock.steam) : Math.max(1, kit.stock.water);
      const rem = eng.rin.steam ? eng.stock.steam : eng.stock.water;
      gWater.set(rem / cap, Math.round(rem) + '');
    }
    function buildScan() {
      scanEl.replaceChildren();
      DIRT.forEach((d, t) => {
        if (!eng.initialDirtTypes[t] || eng.initialDirtTypes[t] < 3) return;
        const chip = h('span', { class: 'chip', data: { t } }, h('i', { style: { background: `rgb(${d.color.join(',')})` } }), d.name + ' ', h('b', null, '100%'));
        scanEl.appendChild(chip);
      });
    }
    function updateScan() {
      for (const chip of scanEl.children) {
        const t = +chip.dataset.t;
        let s = 0; const a = eng.dirt[t]; for (let i = 0; i < a.length; i++) s += a[i];
        const frac = Math.min(1, s / eng.initialDirtTypes[t]);
        const pct = Math.round(frac * 100);
        chip.lastChild.textContent = pct + '%';
        chip.style.opacity = pct <= 2 ? 0.45 : 1;
      }
    }
    function bestProduct(e) {
      let best = null, bv = -1;
      for (const id of e.productList) {
        if ((e.stock.products[id] || 0) <= 0) continue;
        const p = ALL_PRODUCTS[id]; let v = 0;
        for (let t = 3; t < DIRT.length; t++) v += e.initialDirtTypes[t] * DIRT[t].weight * p.aff[t] * p.rate;
        if (v > bv) { bv = v; best = id; }
      }
      return best || e.productList[0] || null;
    }

    // ввод
    function pt(e) {
      const r = canvas.getBoundingClientRect();
      const cx = (e.clientX - r.left) * (canvas.width / r.width), cy = (e.clientY - r.top) * (canvas.height / r.height);
      return [cx, cy];
    }
    function toGridPos(cx, cy) {
      let [gx, gy] = view.toGrid(cx, cy);
      if (qid('sway')) gx -= view.sway(tAll);
      if (qid('mirror')) gx = GW - gx;
      return [gx, gy];
    }
    canvas.addEventListener('pointerdown', (e) => {
      if (paused || ended) return;
      e.preventDefault(); audio.unlock(); haptics.unlock();
      canvas.setPointerCapture(e.pointerId);
      const [cx, cy] = pt(e);
      // сбор находки
      for (const f of eng.finds) {
        if (!f.revealed || f.collected) continue;
        const off = qid('sway') ? view.sway(tAll) / GW * CW * view.sx : 0;
        if (Math.hypot(view.gx(f.x) + off - cx, view.gy(f.y) - cy) < 40 * dpr) { collectFind(f, cx, cy); return; }
      }
      down = true; started = true;
      [px, py] = toGridPos(cx, cy);
      ex = prevEx = px; ey = prevEy = py; held = 0; speed = 0;
      view.cursor = { x: cx, y: cy, r: curRadius() * view.sx * (CW / GW), down: true };
      view._cx = cx; view._cy = cy;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!down) return;
      e.preventDefault();
      const [cx, cy] = pt(e);
      [px, py] = toGridPos(cx, cy);
      view._cx = cx; view._cy = cy;
      view.cursor.x = cx; view.cursor.y = cy;
    });
    const up = (e) => { down = false; if (view) view.cursor = null; stopTool(); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    function curTool() { return phase === 'vacuum' ? eng.vac : phase === 'apply' ? eng.app : eng.rin; }
    function curRadius() { return curTool().radius; }
    function toolKind() { return phase === 'rinse' && eng.rin.steam ? 'steam' : phase; }
    function stopTool() { if (toolOn) { audio.toolStop(); toolOn = null; } }

    function collectFind(f, cx, cy) {
      const idx = eng.finds.indexOf(f);
      eng.collectFind(idx);
      view.collecting.push({ x: cx, y: cy, tx: canvas.width * 0.5, ty: -20, t: 0, emoji: f.emoji });
      view.fx.coin(cx, cy);
      audio.sfx('collect'); haptics.event('collect');
      toast(`${f.emoji}  ${FIND_BY_ID[f.id]?.name || 'Находка'}`, 'good');
    }
    function doShake() {
      if (paused || ended) return;
      if (eng.shake()) { audio.sfx('shake'); haptics.event('shake'); screen.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 220 }); }
    }
    sensors.setShakeHandler(() => doShake());

    // подсказки
    const HINTS = [
      { id: 'h_start', when: () => started === false && tAll > 0.6, text: () => noVac ? TEXTS.tutorial.apply : TEXTS.tutorial.vacuum },
      { id: 'h_apply', when: () => started && !noVac && phase === 'vacuum' && dryLeft() < 0.35, text: () => 'Сухое почти убрано. Переходи к «Средству»: ' + TEXTS.tutorial.apply },
      { id: 'h_rinse', when: () => matureFoam() > 60, text: () => 'Пена окрасилась. ' + TEXTS.tutorial.rinse },
      { id: 'h_time', when: () => tAll > 20, text: () => TEXTS.tutorial.time },
      { id: 'h_find', when: () => eng.finds.some((f) => f.revealed && !f.collected), text: () => 'Что-то блестит! Нажми на находку, чтобы забрать.' },
    ];
    function dryLeft() { let s = 0, i0 = 0; for (let t = 0; t < 3; t++) { for (let i = 0; i < eng.N; i += 1) s += eng.dirt[t][i]; i0 += eng.initialDirtTypes[t]; } return i0 ? s / i0 : 0; }
    function matureFoam() { let n = 0; for (let i = 0; i < eng.N; i += 7) if (eng.foam[i] > 0.25 && eng.foamAge[i] > 2.8) n++; return n; }
    function showHint(text) { hintEl.textContent = text; hintEl.style.display = 'block'; hintLeft = 5.5; }
    function checkHints(dt) {
      if (hintLeft > 0) { hintLeft -= dt; if (hintLeft <= 0) hintEl.style.display = 'none'; return; }
      hintTimer += dt; if (hintTimer < 0.7) return; hintTimer = 0;
      for (const hh of HINTS) {
        if (seen[hh.id]) continue;
        if (hh.when()) { seen[hh.id] = true; showHint(hh.text()); break; }
      }
    }

    // конец
    function finish(abandoned = false) {
      if (ended) return;
      ended = true; stopTool(); audio.musicStop(0.8); cancelAnimationFrame(raf); ro.disconnect();
      sensors.setShakeHandler(null);
      const collected = eng.finds.filter((f) => f.collected).map((f) => f.id);
      const auto = eng.collectAllRevealed().map((f) => f.id);
      const before = beforeSnap;
      const left = { products: { ...eng.stock.products }, water: eng.stock.water / (challenges.some((c) => c.id === 'c_dry') ? 0.5 : 1), steam: eng.stock.steam };
      // не возвращаем «вернувшуюся» воду выше исходного запаса
      left.water = Math.min(left.water, state.inventory.water);
      screen.remove();
      resolve({
        abandoned, clean: eng.cleanPct, leftFrac: eng.timeLeft / eng.limit, rescued, rescues,
        finds: [...collected, ...auto], timeSec: eng.time, usedVacuum: eng.stats.strokes.vacuum > 1.5,
        leftover: left, filterUsed: eng.vac && kit._filterId && eng.filterLoad > 0.5 ? kit._filterId : null,
        appeal: (eng.app.appeal || 0) + (eng.rin.appeal || 0) + (eng.vac.appeal || 0), before, limit: eng.limit,
      });
    }
    function timeUp() {
      paused = true; stopTool(); audio.sfx('timeup'); haptics.event('fail');
      const clean = eng.cleanPct;
      const card = h('div', { class: 'overlay' });
      const close = () => { card.remove(); };
      if (clean >= THRESHOLD) {
        card.appendChild(h('div', { class: 'sheet', style: { alignSelf: 'center', borderRadius: '24px', maxWidth: '88%', margin: '0 auto' } },
          h('div', { class: 'body', style: { textAlign: 'center', padding: '20px' } },
            h('h3', null, 'Время вышло!'), h('p', null, `Отмыто ${Math.round(clean)}%. Заказ принят.`),
            h('button', { class: 'btn block', onClick: () => { close(); finish(); } }, 'Смотреть итоги'))));
      } else {
        const cost = rescueCost(order, rescues);
        const can = state.rep >= cost && rescues < 2;
        card.appendChild(h('div', { class: 'sheet', style: { alignSelf: 'center', borderRadius: '24px', maxWidth: '88%', margin: '0 auto' } },
          h('div', { class: 'body', style: { textAlign: 'center', padding: '20px' } },
            h('h3', null, 'Не успели!'), h('p', null, `Отмыто ${Math.round(clean)}%, а нужно хотя бы ${THRESHOLD}%. Можно взять ещё ${RESCUE_SECONDS} секунд за репутацию или сдать как есть.`),
            h('div', { class: 'row', style: { justifyContent: 'center', margin: '8px 0' } }, icon('rep'), h('b', null, ` ${cost}`), h('span', { class: 'muted' }, ` (у тебя ${state.rep})`)),
            h('button', { class: `btn gold block${can ? '' : ' disabled'}`, onClick: () => { state.rep -= cost; rescues++; rescued = true; eng.addTime(RESCUE_SECONDS); audio.sfx('rescue'); haptics.event('rescue'); close(); paused = false; last = performance.now(); refreshTop(); } }, 'Спасти заказ'),
            h('div', { style: { height: '8px' } }),
            h('button', { class: 'btn ghost block', onClick: () => { close(); finish(); } }, 'Сдать как есть'))));
      }
      screen.appendChild(card);
    }
    function refreshTop() { /* репутация показывается в диалоге */ }

    pauseBtn.addEventListener('click', () => {
      if (ended || paused) return;
      paused = true; stopTool(); audio.suspend && audio.suspend();
      const ov = h('div', { class: 'overlay' }, h('div', { class: 'sheet', style: { alignSelf: 'center', borderRadius: '24px', maxWidth: '88%', margin: '0 auto' } },
        h('div', { class: 'body', style: { textAlign: 'center', padding: '20px' } }, h('h3', null, 'Пауза'),
          h('button', { class: 'btn block', onClick: () => { ov.remove(); paused = false; last = performance.now(); audio.resume && audio.resume(); } }, 'Продолжить'),
          h('div', { style: { height: '8px' } }),
          h('button', { class: 'btn teal block', onClick: () => { ov.remove(); finish(); } }, 'Сдать ковёр сейчас'),
          h('div', { style: { height: '8px' } }),
          h('button', { class: 'btn ghost block', onClick: () => { ov.remove(); abandon(); } }, 'Бросить заказ'))));
      screen.appendChild(ov);
    });
    doneBtn.addEventListener('click', () => {
      if (ended || paused) return;
      paused = true; stopTool();
      const ov = h('div', { class: 'overlay' }, h('div', { class: 'sheet', style: { alignSelf: 'center', borderRadius: '24px', maxWidth: '88%', margin: '0 auto' } },
        h('div', { class: 'body', style: { textAlign: 'center', padding: '20px' } }, h('h3', null, 'Сдать ковёр?'),
          h('p', null, `Сейчас отмыто ${Math.round(eng.cleanPct)}%. Остаток времени пойдёт в бонус.`),
          h('button', { class: 'btn block', onClick: () => { ov.remove(); finish(); } }, 'Сдать'),
          h('div', { style: { height: '8px' } }),
          h('button', { class: 'btn ghost block', onClick: () => { ov.remove(); paused = false; last = performance.now(); } }, 'Ещё поработаю'))));
      screen.appendChild(ov);
    });
    function abandon() {
      ended = true; stopTool(); audio.musicStop(0.5); cancelAnimationFrame(raf); ro.disconnect(); sensors.setShakeHandler(null);
      screen.remove(); onQuit && onQuit(); resolve({ abandoned: true, quit: true });
    }

    // старт
    buildScan(); refreshProducts(); setPhase(phase);
    let beforeSnap = null;
    audio.musicStart(order.season); audio.musicSetClean(0);
    if (quirks.length) {
      const q = QUIRK_INFO[quirks[0].id];
      setTimeout(() => { if (!ended) toast(`Особый ковёр: ${q.name}. ${q.desc}`); }, 500);
    }
    let raf;
    let lowFpsFrames = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!view) { last = now; return; }
      if (!beforeSnap) { beforeSnap = view.snapshotBefore(); }
      let dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (dt > 0.034) lowFpsFrames++; else lowFpsFrames = Math.max(0, lowFpsFrames - 1);
      if (!paused && !ended) {
        tAll += dt;
        // наклон
        let gx = sensors.gx, gy = sensors.gy;
        if (nudge.t > 0) { nudge.t -= dt; gx += nudge.x * 0.9; gy += nudge.y * 0.9; }
        if (gx || gy) eng.applyTilt(gx, gy, dt);
        if (down) {
          // скольжение
          const k = slip ? 1 - Math.exp(-dt / slip.lag) : 1;
          prevEx = ex; prevEy = ey;
          ex += (px - ex) * k; ey += (py - ey) * k;
          const dist = Math.hypot(ex - prevEx, ey - prevEy);
          speed += (dist / Math.max(dt, 1e-3) - speed) * Math.min(1, dt * 10);
          if (dist < 0.25) held += dt; else held = 0;
          const res = eng.apply(phase, prevEx, prevEy, ex, ey, dt, { product, held, speed });
          if (view.cursor) {
            const off = qid('sway') ? view.sway(tAll) / GW * CW * view.sx : 0;
            let sxp = view.gx(qid('mirror') ? GW - ex : ex) + off, syp = view.gy(ey);
            view.cursor.x = sxp; view.cursor.y = syp; view.cursor.r = curRadius() * view.sx * (CW / GW);
            view.emit(phase, res, sxp, syp, dt);
          }
          if (res) {
            const kind = toolKind();
            if (!toolOn || toolOn !== kind) { stopTool(); audio.toolStart(kind); toolOn = kind; }
            const inten = res.empty ? 0.1 : clamp(res.rate * 3, 0.1, 1);
            const spd = clamp(speed / 80, 0, 1);
            audio.toolUpdate(kind, inten, spd);
            haptics.tool(kind, res.empty ? 0.1 : inten, spd);
            if (phase === 'vacuum') usedVac = true;
          }
        }
        eng.tick(dt);
        for (const ev of eng.drainEvents()) {
          if (ev.type === 'sparkle') { view.addEvents([ev]); audio.sfx('sparkle'); haptics.event('sparkle'); }
          else if (ev.type === 'found') { audio.sfx('find'); haptics.event('find'); toast('Что-то блестит под пылью!', 'good'); }
          else if (ev.type === 'regrow') audio.sfx('regrow');
          else if (ev.type === 'ghost') { audio.sfx('ghost'); toast('Откуда-то проступило новое пятно!', 'bad'); }
        }
        hudT += dt;
        if (hudT > 0.2) {
          hudT = 0;
          const left = eng.timeLeft;
          timerEl.lastChild.textContent = fmtTime(left);
          timerEl.classList.toggle('low', left < 15);
          meterFill.style.width = eng.cleanPct + '%'; meterTxt.textContent = Math.round(eng.cleanPct) + '%';
          if (Math.floor(left) === 10 && !warned) { warned = true; haptics.event('warn'); }
          refreshDock();
        }
        if (Math.floor(tAll * 2) % 4 === 0 && hudT === 0) updateScan();
        musicT += dt; if (musicT > 0.5) { musicT = 0; audio.musicSetClean(eng.cleanPct); }
        checkHints(dt);
        if (eng.timeLeft <= 0) timeUp();
        else if (eng.cleanPct >= 99.6) { toast('Идеально чисто!', 'good'); finish(); }
      }
      view.render(dt, tAll);
    }
    raf = requestAnimationFrame(frame);
    refreshDock();
  });
}
