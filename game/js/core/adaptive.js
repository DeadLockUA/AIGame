// Адаптивная сложность: плавная подстройка таймера под последние результаты (в пределах ±20%).
import { clamp } from '../util.js';

export function recordResult(state, r) {
  const h = state.adaptive.hist;
  h.push({ clean: r.clean, left: r.leftFrac, rescued: !!r.rescued });
  while (h.length > 6) h.shift();
}

export function timeMul(state) {
  const h = state.adaptive.hist;
  if (h.length < 2) return 1;
  let s = 0;
  for (const r of h) {
    if (r.clean < 70) s -= 1.6;
    else if (r.rescued) s -= 0.9;
    else if (r.clean < 90) s -= 0.3;
    else if (r.clean >= 98 && r.left > 0.4) s += 1;
    else if (r.clean >= 98) s += 0.5;
    else s += 0.15;
  }
  s /= h.length;
  // s<0 -> больше времени (до 1.2), s>0 -> меньше (до 0.85)
  return clamp(1 - s * 0.16, 0.85, 1.2);
}
