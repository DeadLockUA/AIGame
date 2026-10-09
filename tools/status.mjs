// Считает готовность по docs/PLAN.md и (с флагом --write "текст") добавляет запись в docs/STATUS.md
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const plan = readFileSync(new URL('../docs/PLAN.md', import.meta.url), 'utf8');
let total = 0, done = 0;
for (const m of plan.matchAll(/^- \[( |x)\] \((\d+)\)/gm)) {
  const w = Number(m[2]);
  total += w;
  if (m[1] === 'x') done += w;
}
const pct = Math.round((done / total) * 100);
const i = process.argv.indexOf('--write');
if (i > -1) {
  const text = process.argv[i + 1];
  const file = new URL('../docs/STATUS.md', import.meta.url);
  const head = '# Статус проекта\n\nЗаписи добавляются сверху при каждом пуше. До 5 предложений и готовность в процентах.\n\n';
  const old = existsSync(file) ? readFileSync(file, 'utf8').replace(head, '') : '';
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  writeFileSync(file, head + `## ${stamp} · Готовность: ${pct}%\n\n${text}\n\n` + old);
}
console.log(pct);
