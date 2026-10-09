// Настройки, достижения, коллекция, о игре.
import { h, icon, toast } from './dom.js';
import { A } from './app.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../audio/haptics.js';
import ACH from '../data/achievements.js';
import FINDS from '../data/finds.js';
import TEXTS from '../data/texts.js';
import * as ST from '../core/state.js';
import { exportSave, importSave, resetSave, saveState } from '../core/storage.js';
import { sensors } from './sensors.js';
import { fmt } from '../util.js';
import { applySettings } from '../main.js';

function sheet(title, bodyNodes) {
  const ov = h('div', { class: 'overlay' });
  const close = () => ov.remove();
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  ov.appendChild(h('div', { class: 'sheet' }, h('div', { class: 'head' }, h('h3', null, title), h('button', { class: 'xbtn', 'aria-label': 'Закрыть', onClick: close }, icon('close'))), h('div', { class: 'body' }, bodyNodes)));
  A.root.appendChild(ov);
  return close;
}

export function openAchievements() {
  const s = A.state;
  const list = ACH.map((a) => {
    const done = !!s.achievements[a.id];
    const p = ST.achievementProgress(s, a);
    return h('div', { class: 'card ach' + (done ? ' done' : '') }, h('div', { class: 'ico' }, icon(done ? 'trophy' : 'lock')),
      h('div', { class: 'grow' }, h('b', null, a.name), h('div', { class: 'muted' }, a.desc), h('div', { class: 'bar', style: { marginTop: '5px' } }, h('i', { style: { width: (p / a.goal) * 100 + '%' } }))),
      h('div', { style: { textAlign: 'right', fontSize: '.8em' } }, h('div', null, `${fmt(p)}/${fmt(a.goal)}`), h('div', { class: 'price' }, icon('coin'), a.rewardCoins), a.rewardRep ? h('div', { class: 'price' }, icon('rep'), a.rewardRep) : null));
  });
  sheet(`Достижения ${Object.keys(s.achievements).length}/${ACH.length}`, list);
}

export function openCollection() {
  const s = A.state;
  const grid = h('div', { class: 'grid3' });
  for (const f of FINDS) {
    const n = s.finds[f.id];
    grid.appendChild(h('div', { class: 'card find rarity-' + f.rarity, style: { margin: 0 } }, h('div', { class: 'em' }, n ? f.emoji : '❔'), h('b', { style: { fontSize: '.78em' } }, n ? f.name : '???'), h('div', { class: 'muted', style: { fontSize: '.7em' } }, n ? (n > 1 ? '×' + n : '') : f.rarity === 'epic' ? 'эпическая' : f.rarity === 'rare' ? 'редкая' : '')));
  }
  sheet(`Находки ${Object.keys(s.finds).length}/${FINDS.length}`, grid);
}

export function openAbout() {
  const tips = TEXTS.tips.slice(0, 14).map((t) => h('div', { class: 'card' }, t));
  sheet('О игре', [h('div', { class: 'card' }, h('b', null, 'Чистый ворс'), h('div', { class: 'muted' }, 'Игра о мойке ковров. Нарисована, озвучена и написана ИИ-агентами. Люди придумывали правила и разрешали.')), h('div', { class: 'h2' }, 'Советы'), tips]);
}

export function openSettings() {
  const s = A.state;
  const st = s.settings;
  const slider = (key, label, ic, cb) => h('div', { class: 'set' }, h('div', { class: 'row' }, icon(ic), h('b', null, label)), h('input', { class: 'slider', type: 'range', min: 0, max: 100, value: Math.round(st[key] * 100), onInput: (e) => { st[key] = +e.target.value / 100; cb && cb(); saveState(s); } }));
  const sw = (key, label, ic, cb) => { const el = h('div', { class: 'switch' + (st[key] ? ' on' : '') }); return h('div', { class: 'set', onClick: () => { st[key] = !st[key]; el.classList.toggle('on', !!st[key]); cb && cb(); saveState(s); } }, h('div', { class: 'row' }, icon(ic), h('b', null, label)), el); };
  const nodes = [
    slider('music', 'Музыка', 'sound', () => audio.setVolumes({ music: st.music, sfx: st.sfx })),
    slider('sfx', 'Звуки', 'sound', () => { audio.setVolumes({ music: st.music, sfx: st.sfx }); audio.ui('tick'); }),
    h('div', { class: 'set' }, h('div', { class: 'row' }, icon('vibe'), h('b', null, 'Вибро-отклик')), h('input', { class: 'slider', type: 'range', min: 0, max: 100, value: Math.round(st.haptics * 100), onInput: (e) => { st.haptics = +e.target.value / 100; haptics.setIntensity(st.haptics); haptics.event('tap'); saveState(s); } })),
    sw('sensors', 'Наклон и встряска', 'tilt', async () => { if (st.sensors) { const ok = await sensors.enable(); if (!ok) toast('Датчики недоступны. Есть кнопки на экране мойки.'); } else sensors.disable(); }),
    sw('colorblind', 'Режим для дальтоников', 'info', () => applySettings(s)),
    h('div', { class: 'set' }, h('div', { class: 'row' }, h('b', null, 'Размер текста')), h('input', { class: 'slider', type: 'range', min: 90, max: 130, value: Math.round(st.textScale * 100), onChange: (e) => { st.textScale = +e.target.value / 100; applySettings(s); saveState(s); } })),
    h('div', { class: 'h2' }, 'Сохранение'),
    h('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } },
      h('button', { class: 'btn sm ghost', onClick: () => exportSave(s) }, icon('download'), 'Экспорт'),
      h('label', { class: 'btn sm ghost' }, icon('upload'), 'Импорт', h('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, onChange: async (e) => { const f = e.target.files[0]; if (!f) return; try { const ns = await importSave(f); saveState(ns); location.reload(); } catch (err) { toast('Не удалось прочитать файл', 'bad'); } } })),
      h('button', { class: 'btn sm ghost', onClick: () => { if (confirm('Стереть весь прогресс?')) { resetSave(); location.reload(); } } }, 'Сброс')),
    h('div', { class: 'muted', style: { marginTop: '10px' } }, 'Прогресс хранится на этом устройстве. Экспорт сохраняет его в файл.'),
  ];
  sheet('Настройки', nodes);
}
