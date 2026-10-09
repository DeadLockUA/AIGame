// Миниатюры ковров (ленивая отрисовка, кэш).
import { renderCarpet } from '../carpet/render.js';

const cache = new Map();
const queue = [];
let busy = false;

function pump() {
  if (busy) return;
  busy = true;
  const step = () => {
    const job = queue.shift();
    if (!job) { busy = false; return; }
    try {
      const key = job.spec.style + ':' + job.spec.seed + ':' + job.scale;
      let src = cache.get(key);
      if (!src) { src = renderCarpet(job.spec, job.scale); cache.set(key, src); if (cache.size > 80) cache.delete(cache.keys().next().value); }
      job.canvas.width = src.width; job.canvas.height = src.height;
      job.canvas.getContext('2d').drawImage(src, 0, 0);
      job.canvas.classList.add('ready');
    } catch (e) { /* стиль мог не отрисоваться */ }
    setTimeout(step, 12);
  };
  setTimeout(step, 0);
}

export function thumb(spec, cls = 'thumb', scale = 0.4) {
  const c = document.createElement('canvas');
  c.className = cls; c.width = 10; c.height = 16;
  c.style.background = '#e7d6b8';
  queue.push({ canvas: c, spec, scale });
  pump();
  return c;
}
