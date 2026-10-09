// Точка входа: загрузка, титульный экран, регистрация service worker.
import { h, clear, icon } from './ui/dom.js';
import { A } from './ui/app.js';
import { loadState, saveState } from './core/storage.js';
import { audio } from './audio/audio.js';
import { haptics } from './audio/haptics.js';
import { showHub } from './ui/hub.js';
import { showSeasonStory } from './ui/story.js';
import { SEASONS } from './core/progress.js';
import { renderCarpet } from './carpet/render.js';

export function applySettings(state) {
  const st = state.settings;
  document.documentElement.style.setProperty('--ts', String(st.textScale || 1));
  document.body.classList.toggle('col-blind', !!st.colorblind);
  audio.setVolumes({ music: st.music, sfx: st.sfx });
  haptics.setIntensity(st.haptics);
}

function titleScreen(state) {
  const root = A.root;
  clear(root);
  const first = state.stats.jobs === 0 && !state.progress.seasonsSeen.intro1;
  let c;
  try { c = renderCarpet({ style: 'persian', seed: 4242 }, 1); c.className = 'title-carpet'; } catch (e) { c = h('div'); }
  const screen = h('div', { class: 'screen title-screen' },
    c, h('h1', null, 'Чистый', h('br'), 'ворс'), h('div', { class: 'sub' }, 'Мойка ковров с котом'),
    h('button', { class: 'btn gold', style: { minWidth: '200px', fontSize: '1.15em' }, onClick: async () => {
      audio.unlock(); haptics.unlock(); audio.ui('success');
      if (first) { state.progress.seasonsSeen.intro1 = true; saveState(state); await showSeasonStory(SEASONS[0], 'intro'); }
      showHub();
    } }, icon('play'), first ? 'Играть' : 'Продолжить'),
    h('div', { class: 'muted' }, 'Нарисовано, озвучено и написано ИИ'));
  root.appendChild(screen);
}

function boot() {
  const state = loadState();
  A.state = state;
  A.root = document.getElementById('app');
  A.save = () => saveState(state);
  A.go = (where) => { if (where === 'hub') showHub(); };
  applySettings(state);
  titleScreen(state);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { saveState(state); audio.suspend && audio.suspend(); }
    else if (!document.body.classList.contains('in-wash')) audio.resume && audio.resume();
  });
  window.addEventListener('pagehide', () => saveState(state));
  const t0 = Date.now();
  setInterval(() => { if (!document.hidden) state.playMs = (state.playMs || 0) + 15000; }, 15000);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.search.includes('nosw')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  window.__game = { state, A };
}
boot();
