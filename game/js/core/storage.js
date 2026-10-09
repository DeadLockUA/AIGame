// Локальное сохранение (localStorage), экспорт и импорт файлом.
import { createState, migrate, ensureBoard } from './state.js';

const KEY = 'chisty-vors-save-v1';

/** Проверяет, что объект похож на сохранение. Бросает исключение, если нет. */
export function validate(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error('не сохранение');
  if (typeof s.coins !== 'number' || !Number.isFinite(s.coins)) throw new Error('нет монет');
  if (s.gallery !== undefined && !Array.isArray(s.gallery)) throw new Error('лента повреждена');
  for (const k of ['owned', 'equipped', 'inventory', 'progress', 'workshop', 'board', 'stats', 'settings']) {
    if (s[k] !== undefined && (typeof s[k] !== 'object' || s[k] === null || Array.isArray(s[k]))) throw new Error('повреждено: ' + k);
  }
  if (s.board && s.board.side !== undefined && !Array.isArray(s.board.side)) throw new Error('доска повреждена');
  if (s.owned && s.owned.tools !== undefined && !Array.isArray(s.owned.tools)) throw new Error('инструменты повреждены');
  return s;
}

export function loadState() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw) { const s = migrate(validate(JSON.parse(raw))); ensureBoard(s); return s; }
  } catch (e) {
    // не затираем испорченное сохранение: кладём копию рядом
    try { if (raw) localStorage.setItem(KEY + '-bad', raw); } catch (e2) { /* ничего */ }
  }
  const s = createState();
  ensureBoard(s);
  return s;
}
let timer = 0;
export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* переполнено или недоступно */ }
}
export function saveSoon(state) { clearTimeout(timer); timer = setTimeout(() => saveState(state), 400); }
export function exportSave(state) {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'chisty-vors-save.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export async function importSave(file) {
  const txt = await file.text();
  const s = migrate(validate(JSON.parse(txt)));
  ensureBoard(s);
  return s;
}
export function resetSave() { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '-bad'); } catch (e) { /* ничего */ } }
