// Составляет game/precache.json: список всех файлов игры и версия по их содержимому.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = new URL('../game/', import.meta.url).pathname;
const files = [];
(function walk(d) {
  for (const n of readdirSync(d).sort()) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else { const r = relative(root, p); if (r !== 'sw.js' && r !== 'precache.json') files.push(r); }
  }
})(root);
const hash = createHash('sha1');
for (const f of files) { hash.update(f); hash.update(readFileSync(join(root, f))); }
const out = { version: hash.digest('hex').slice(0, 10), files: ['./', ...files] };
writeFileSync(join(root, 'precache.json'), JSON.stringify(out));
console.log('precache', out.version, files.length);
