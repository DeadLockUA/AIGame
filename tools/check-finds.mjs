import finds from '../game/js/data/finds.js';
const ids = new Set(finds.map((f) => f.id));
const missing = new Set();
for (let i = 1; i <= 10; i++) {
  const m = await import(`../game/js/data/story/season${String(i).padStart(2, '0')}.js`);
  for (const o of m.default.orders) for (const f of o.finds) if (!ids.has(f)) missing.add(f);
}
console.log([...missing].join(' ') || 'OK');
