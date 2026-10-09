// Набор помощников для рисования орнаментов. Все функции рисуют в логических координатах ковра (360x540).
import { RNG } from '../util.js';

export const CW = 360;
export const CH = 540;

export function hex(c) {
  if (Array.isArray(c)) return c;
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgb(a, alpha = 1) {
  const [r, g, b] = hex(a);
  return alpha >= 1 ? `rgb(${r | 0},${g | 0},${b | 0})` : `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
}
export function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
}
export const lighten = (c, t) => mix(c, [255, 255, 255], t);
export const darken = (c, t) => mix(c, [0, 0, 0], t);
export const css = (c, a = 1) => rgb(c, a);

/** Выбирает палитру и слегка «сдвигает» оттенки для уникальности. */
export function pickPalette(rng, list) {
  const p = rng.pick(list);
  const out = {};
  const shift = rng.range(-0.05, 0.05);
  for (const k of Object.keys(p)) out[k] = shift > 0 ? lighten(p[k], shift) : darken(p[k], -shift);
  return out;
}

export function polar(g, cx, cy, n, fn, steps = 180) {
  g.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = fn(a);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
}

export function star(g, cx, cy, r1, r2, n, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = rot + (i * Math.PI) / n;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
}

export function ngon(g, cx, cy, r, n, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i * Math.PI * 2) / n;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
}

export function lozenge(g, cx, cy, w, h) {
  g.beginPath();
  g.moveTo(cx, cy - h); g.lineTo(cx + w, cy); g.lineTo(cx, cy + h); g.lineTo(cx - w, cy);
  g.closePath();
}

/** Лепесток-миндаль от (0,0) вверх длиной len и шириной w. */
export function petalPath(g, len, w) {
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(w, -len * 0.25, w * 0.8, -len * 0.8, 0, -len);
  g.bezierCurveTo(-w * 0.8, -len * 0.8, -w, -len * 0.25, 0, 0);
  g.closePath();
}

export function rosette(g, cx, cy, r, petals, c1, c2, c3 = null) {
  g.save(); g.translate(cx, cy);
  for (let i = 0; i < petals; i++) {
    g.save(); g.rotate((i * Math.PI * 2) / petals);
    petalPath(g, r, r * 0.34);
    g.fillStyle = css(c1); g.fill();
    g.lineWidth = Math.max(0.6, r * 0.04); g.strokeStyle = css(c2); g.stroke();
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  g.fillStyle = css(c3 || c2); g.fill();
  g.beginPath(); g.arc(0, 0, r * 0.14, 0, Math.PI * 2);
  g.fillStyle = css(c1); g.fill();
  g.restore();
}

/** Пальметта: веер из листьев. Рисуется вверх от (0,0). */
export function palmette(g, size, c1, c2, c3) {
  const leaves = 7;
  for (let i = 0; i < leaves; i++) {
    const a = ((i - (leaves - 1) / 2) / ((leaves - 1) / 2)) * 1.05;
    g.save(); g.rotate(a);
    petalPath(g, size * (1 - Math.abs(a) * 0.25), size * 0.2);
    g.fillStyle = css(i % 2 ? c1 : c2); g.fill();
    g.lineWidth = Math.max(0.5, size * 0.03); g.strokeStyle = css(c3); g.stroke();
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  g.fillStyle = css(c3); g.fill();
}

/** Боте (капля-«огурец»). Рисуется с центром в (0,0), высота ~ s. */
export function boteh(g, s, c1, c2, c3) {
  g.save();
  g.beginPath();
  g.moveTo(0, s * 0.5);
  g.bezierCurveTo(-s * 0.55, s * 0.5, -s * 0.5, -s * 0.1, -s * 0.05, -s * 0.35);
  g.bezierCurveTo(s * 0.15, -s * 0.5, s * 0.4, -s * 0.52, s * 0.42, -s * 0.38);
  g.bezierCurveTo(s * 0.2, -s * 0.35, s * 0.28, -s * 0.05, s * 0.3, s * 0.15);
  g.bezierCurveTo(s * 0.3, s * 0.4, s * 0.15, s * 0.5, 0, s * 0.5);
  g.closePath();
  g.fillStyle = css(c1); g.fill();
  g.lineWidth = Math.max(0.6, s * 0.04); g.strokeStyle = css(c3); g.stroke();
  g.beginPath(); g.arc(-s * 0.05, s * 0.18, s * 0.2, 0, Math.PI * 2);
  g.fillStyle = css(c2); g.fill(); g.stroke();
  g.beginPath(); g.arc(-s * 0.05, s * 0.18, s * 0.08, 0, Math.PI * 2);
  g.fillStyle = css(c3); g.fill();
  g.restore();
}

/** Лоза: плавная кривая с листьями и цветами. */
export function vine(g, pts, c1, c2, flower, lw = 2) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = css(c1); g.lineWidth = lw;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  g.stroke();
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const a = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]);
    for (const side of [-1, 1]) {
      g.save(); g.translate(x, y); g.rotate(a + side * 1.2 + Math.PI / 2);
      petalPath(g, 11 + (i % 3) * 2, 3.6);
      g.fillStyle = css(c2); g.fill(); g.restore();
    }
    if (i % 2 === 0 && flower) rosette(g, x, y, 4.6, 6, flower[0], flower[1]);
  }
}

/** Рисует содержимое четыре раза, зеркально, вокруг центра (cx,cy). */
export function quad(g, cx, cy, fn) {
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    g.save(); g.translate(cx, cy); g.scale(sx, sy); fn(g); g.restore();
  }
}
export function mirrorX(g, cx, fn) {
  for (const sx of [1, -1]) { g.save(); g.translate(cx, 0); g.scale(sx, 1); fn(g); g.restore(); }
}

/** Идёт вдоль прямоугольной рамки и вызывает fn(x, y, angle, i) каждые `step` пикселей. */
export function alongRect(x, y, w, h, step, fn) {
  const sides = [
    [x, y, 1, 0, w, 0], [x + w, y, 0, 1, h, Math.PI / 2],
    [x + w, y + h, -1, 0, w, Math.PI], [x, y + h, 0, -1, h, -Math.PI / 2],
  ];
  let idx = 0;
  for (const [sx, sy, dx, dy, len, ang] of sides) {
    const n = Math.max(1, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      fn(sx + dx * len * t, sy + dy * len * t, ang, idx++);
    }
  }
}

export function rectBand(g, x, y, w, h, thick, color) {
  g.fillStyle = css(color);
  g.beginPath();
  g.rect(x, y, w, h);
  g.rect(x + thick, y + thick, w - 2 * thick, h - 2 * thick);
  g.fill('evenodd');
}

export function strokeRect(g, x, y, w, h, color, lw = 1) {
  g.strokeStyle = css(color); g.lineWidth = lw; g.strokeRect(x, y, w, h);
}

export function dots(g, x, y, w, h, step, r, color) {
  g.fillStyle = css(color);
  for (let yy = y + step / 2; yy < y + h; yy += step) for (let xx = x + step / 2; xx < x + w; xx += step) {
    g.beginPath(); g.arc(xx, yy, r, 0, Math.PI * 2); g.fill();
  }
}

export { RNG };
