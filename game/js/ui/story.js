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
