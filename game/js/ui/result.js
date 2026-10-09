// Итоги заказа.
import { h, icon, toast } from './dom.js';
import { A } from './app.js';
import { avatarEl } from './avatar.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../audio/haptics.js';
import TEXTS from '../data/texts.js';
import { fmt, fmtTime, RNG, hashString } from '../util.js';
import * as ST from '../core/state.js';
import { SEASONS, THRESHOLD } from '../core/progress.js';
import { renderCarpet, CW, FRINGE } from '../carpet/render.js';
import { showHub } from './hub.js';
import { showSeasonStory, showCredits } from './story.js';
import { saveState } from '../core/storage.js';

export function compareEl(before, afterCanvas) {
  const wrap = h('div', { class: 'cmp' });
  const a = afterCanvas, b = before;
  b.className = ''; a.className = 'after';
  const bar = h('div', { class: 'bar-v', style: { left: '50%' } });
  const range = h('input', { type: 'range', min: 0, max: 100, value: 50, 'aria-label': 'До и после' });
  range.addEventListener('input', () => { const v = +range.value; a.style.clipPath = `inset(0 0 0 ${v}%)`; bar.style.left = v + '%'; });
  wrap.append(b, a, bar, h('span', { class: 'tag l' }, 'До'), h('span', { class: 'tag r' }, 'После'), range);
  return wrap;
}

function confetti(root) {
  const c = h('div', { class: 'confetti' });
  const cols = ['#f2b844', '#d9644a', '#2a8c8c', '#8ec9e8', '#f3b6c4', '#9fd8bf'];
  for (let i = 0; i < 46; i++) {
    c.appendChild(h('i', { style: { left: Math.random() * 100 + '%', background: cols[i % cols.length], animationDuration: 1.8 + Math.random() * 1.8 + 's', animationDelay: Math.random() * 0.6 + 's' } }));
  }
  root.appendChild(c);
  setTimeout(() => c.remove(), 4200);
}

export function showResult({ order, challenges, res }) {
  return new Promise(async (resolve) => {
    const { state, root } = A;
   try {
    const out = ST.applyResult(state, order, res, challenges);
    saveState(state);
    A.refreshTop();
    const stars = out.stars;
    if (stars >= 3) { audio.ui('success'); haptics.event('success'); confetti(root); } else if (stars > 0) { audio.ui('star'); haptics.event('success'); } else { audio.ui('fail'); haptics.event('fail'); }

    const rng = new RNG(hashString(order.id + state.stats.jobs));
    const cat = stars === 3 && !res.rescued ? 'perfect' : res.rescued ? 'rescued' : stars >= 2 ? 'good' : 'poor';
    const catLine = rng.pick(TEXTS.catResults[cat]);
    const clientLines = stars >= 2 ? order.success : stars === 1 ? order.partial : order.fail;
    const clientLine = clientLines && clientLines.length ? rng.pick(clientLines) : '';

    const after = res.after || renderCarpet({ style: order.style, seed: order.seed }, 1);
    const cmp = res.before ? compareEl(res.before, after) : null;

    const lines = h('div', null,
      h('div', { class: 'line' }, h('span', null, 'Чистота'), h('span', null, Math.round(res.clean) + '%')),
      h('div', { class: 'line' }, h('span', null, 'Время'), h('span', null, fmtTime(res.timeSec))),
      h('div', { class: 'line' }, h('span', null, 'Оплата'), h('span', { class: 'price' }, icon('coin'), '+' + fmt(out.pay))),
      out.speed ? h('div', { class: 'line' }, h('span', null, 'За скорость'), h('span', { class: 'price' }, icon('coin'), '+' + fmt(out.speed))) : null,
      out.findsCoins ? h('div', { class: 'line' }, h('span', null, 'Находки'), h('span', { class: 'price' }, icon('coin'), '+' + fmt(out.findsCoins))) : null,
      out.rep ? h('div', { class: 'line' }, h('span', null, 'Репутация'), h('span', { class: 'price' }, icon('rep'), '+' + out.rep)) : null,
      out.followers ? h('div', { class: 'line' }, h('span', null, 'Подписчики'), h('span', { class: 'price' }, icon('heart'), '+' + out.followers)) : null,
      h('div', { class: 'line total' }, h('span', null, 'Итого'), h('span', { class: 'price' }, icon('coin'), '+' + fmt(out.total))));

    const finds = res.finds.map((id) => ST.FIND_BY_ID[id]).filter(Boolean);
    const findsEl = finds.length ? h('div', { class: 'card' }, h('b', null, 'Находки'), h('div', { class: 'chips', style: { marginTop: '6px' } }, finds.map((f) => h('span', { class: 'chip' }, f.emoji + ' ' + f.name)))) : null;

    const screen = h('div', { class: 'full' },
      h('div', { class: 'res' },
        h('h2', { style: { margin: 0 } }, stars === 0 ? 'Не получилось' : stars === 3 ? 'Блестяще!' : 'Заказ выполнен'),
        h('div', { class: 'bigstars' }, [1, 2, 3].map((i) => h('span', { class: i <= stars ? 'on' : 'off', style: { animationDelay: i * 0.18 + 's' } }, icon('star')))),
        h('div', { class: 'muted' }, '★ от 70% · ★★ от 90% · ★★★ от 98% чистоты'),
        h('div', { class: 'quote' }, avatarEl(order.client.avatar, 48), h('div', null, h('b', null, order.client.name), h('div', null, clientLine ? '«' + clientLine + '»' : ''))),
        cmp, h('div', { class: 'card' }, lines), findsEl,
        h('div', { class: 'quote' }, icon('cat', 'big'), h('div', null, h('b', null, 'Ворсик'), h('div', null, catLine))),
        out.unlocked && out.unlocked.length ? h('div', { class: 'card', style: { background: '#fff4d6' } }, h('b', null, 'Достижения!'), out.unlocked.map((a) => h('div', null, '🏆 ' + a.name + ' (+' + a.rewardCoins + ' монет' + (a.rewardRep ? ', +' + a.rewardRep + ' реп.' : '') + ')'))) : null,
        out.mercy ? h('div', { class: 'card', style: { background: '#e6f6ef' } }, h('b', null, 'Заначка деда Ефима'), h('div', null, `Ворсик нашёл за плинтусом ${out.mercy} монет. Хватит на мыло.`)) : null,
        out.post ? h('div', { class: 'muted' }, 'Пост ушёл в ленту фирмы.') : null),
      h('div', { class: 'foot', style: { padding: '10px 14px calc(var(--sab) + 12px)', borderTop: '2px solid var(--line)', background: 'var(--paper)' } },
        h('button', { class: 'btn block', onClick: async (ev) => {
          if (ev.currentTarget.disabled) return;
          ev.currentTarget.disabled = true;
          screen.remove();
          if (out.seasonDone) { const s = SEASONS[order.season - 1]; await showSeasonStory(s, 'outro'); if (order.season === 10) await showCredits(state); }
          showHub(); resolve();
        } }, 'Дальше')));
    root.appendChild(screen);
   } catch (err) {
    console.error(err);
    showHub(); resolve();
   }
  });
}
