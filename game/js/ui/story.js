// Сюжетные экраны: интро и итоги района.
import { h, icon } from './dom.js';
import { A } from './app.js';
import { audio } from '../audio/audio.js';

export function showSeasonStory(season, which) {
  return new Promise((resolve) => {
    const lines = season[which] || [];
    let i = 0;
    const speaker = which === 'intro' ? 'Ворсик' : 'Итоги района';
    const textEl = h('div', null, lines[0] || '');
    const who = h('div', { class: 'who' }, icon('cat'), speaker);
    const says = h('div', { class: 'says' }, who, textEl);
    const screen = h('div', { class: 'full story' }, h('div', { class: 'scene' }, h('div', { style: { textAlign: 'center' } }, h('div', { style: { fontSize: '.9em', opacity: .7 } }, 'Район ' + String(season.id).padStart(2, '0')), h('h1', { style: { fontSize: '2.2em', margin: '6px 0' } }, season.name), h('div', { style: { opacity: .8 } }, season.subtitle))), says, h('div', { class: 'tapnote' }, 'Нажми, чтобы продолжить'));
    screen.addEventListener('click', () => {
      i++; audio.ui('tap');
      if (i >= lines.length) { screen.remove(); resolve(); return; }
      textEl.textContent = lines[i];
    });
    A.root.appendChild(screen);
    if (!lines.length) { screen.remove(); resolve(); }
  });
}

// Финальные титры после последнего района. Игра продолжается: доска заказов бесконечна.
export function showCredits(state) {
  return new Promise((resolve) => {
    const st = state.stats;
    const hours = Math.max(0.1, (state.playMs || 0) / 3600000);
    const stat = (v, l) => h('div', null, h('b', null, String(v)), h('span', { style: { opacity: .75, fontSize: '.8em' } }, l));
    const screen = h('div', { class: 'full story credits' },
      h('div', { style: { fontSize: '3em' } }, '🏆'),
      h('h1', null, 'Цикл пройден'),
      h('p', { style: { maxWidth: '320px', opacity: .9 } }, 'Площадь Ковров гудит, дед Ефим наверняка улыбается, кот лежит на самом чистом ковре. Ковры будут всегда, и доска заказов тоже.'),
      h('div', { class: 'statgrid' }, stat(st.jobs, 'заказов'), stat(st.stars3, 'идеальных'), stat(Object.keys(state.finds).length, 'находок'), stat(state.followers, 'подписчиков'), stat(Math.round(state.coins), 'монет'), stat(hours.toFixed(1) + ' ч', 'в игре')),
      h('p', { style: { opacity: .7, fontSize: '.85em' } }, 'Нарисовано, озвучено и написано ИИ-агентами.'),
      h('button', { class: 'btn gold', style: { minWidth: '220px' }, onClick: () => { screen.remove(); resolve(); } }, 'Играть дальше'));
    A.root.appendChild(screen);
  });
}
