// Локальное сохранение (localStorage), экспорт и импорт файлом.
import { createState, migrate, ensureBoard } from './state.js';

const KEY = 'chisty-vors-save-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = migrate(JSON.parse(raw)); ensureBoard(s); return s; }
  } catch (e) { /* пустое хранилище */ }
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
  const s = migrate(JSON.parse(txt));
  ensureBoard(s);
  return s;
}
export function resetSave() { try { localStorage.removeItem(KEY); } catch (e) { /* ничего */ } }
