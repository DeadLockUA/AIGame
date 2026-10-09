// Огородный ковёр: грядки с морковкой, помидорами и капустой, цветы, лейки и забор в кайме.
import { CW, CH, css, mix, darken, lighten, pickPalette, petalPath, star } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { grass: [118, 176, 78], grass2: [78, 138, 60], soil: [104, 66, 42], soil2: [136, 90, 58], plank: [176, 128, 78], fence: [248, 242, 224], fenceDark: [196, 184, 152], leaf: [84, 168, 62], leafDark: [44, 108, 44], red: [226, 58, 46], orange: [255, 148, 34], cab: [166, 214, 126], pink: [244, 120, 166], yellow: [255, 206, 56], can: [64, 150, 206], edge: [60, 100, 44] },
  { grass: [182, 170, 84], grass2: [140, 128, 58], soil: [96, 58, 34], soil2: [128, 82, 48], plank: [150, 98, 56], fence: [160, 108, 66], fenceDark: [112, 70, 38], leaf: [110, 156, 56], leafDark: [64, 104, 40], red: [210, 70, 36], orange: [250, 130, 24], cab: [196, 206, 120], pink: [230, 110, 80], yellow: [255, 196, 50], can: [200, 90, 50], edge: [100, 80, 36] },
  { grass: [160, 206, 150], grass2: [110, 170, 120], soil: [128, 94, 70], soil2: [164, 124, 92], plank: [220, 200, 170], fence: [110, 170, 214], fenceDark: [70, 124, 176], leaf: [108, 186, 118], leafDark: [56, 128, 84], red: [236, 84, 92], orange: [255, 160, 70], cab: [190, 226, 170], pink: [248, 150, 190], yellow: [255, 220, 100], can: [236, 120, 140], edge: [64, 124, 96] },
  { grass: [64, 126, 70], grass2: [40, 92, 54], soil: [70, 44, 34], soil2: [98, 62, 46], plank: [140, 90, 56], fence: [214, 70, 56], fenceDark: [150, 40, 36], leaf: [70, 150, 70], leafDark: [30, 90, 48], red: [232, 52, 44], orange: [255, 140, 30], cab: [150, 200, 120], pink: [250, 120, 160], yellow: [255, 210, 60], can: [240, 190, 60], edge: [28, 70, 40] },
  { grass: [134, 190, 90], grass2: [92, 150, 66], soil: [140, 70, 44], soil2: [172, 98, 60], plank: [196, 150, 90], fence: [255, 214, 80], fenceDark: [206, 156, 40], leaf: [96, 176, 60], leafDark: [50, 112, 40], red: [222, 50, 50], orange: [255, 134, 28], cab: [176, 220, 130], pink: [240, 110, 150], yellow: [255, 224, 90], can: [70, 160, 140], edge: [86, 56, 30] },
  { grass: [100, 160, 100], grass2: [64, 122, 82], soil: [86, 62, 52], soil2: [116, 86, 70], plank: [170, 150, 120], fence: [238, 232, 214], fenceDark: [180, 170, 146], leaf: [88, 164, 96], leafDark: [40, 104, 70], red: [214, 56, 70], orange: [250, 150, 50], cab: [170, 210, 150], pink: [236, 130, 190], yellow: [250, 210, 80], can: [110, 100, 190], edge: [44, 84, 64] },
];

function leaf(g, len, w, col, dark) {
  petalPath(g, len, w); g.fillStyle = css(col); g.fill();
  g.lineWidth = Math.max(0.01, len * 0.03); g.strokeStyle = css(dark); g.stroke();
  g.beginPath(); g.moveTo(0, -len * 0.05); g.lineTo(0, -len * 0.85); g.lineWidth = len * 0.02; g.stroke();
}

function mound(g, x, y, w) {
  g.beginPath(); g.ellipse(x, y, w, w * 0.22, 0, 0, TAU); g.fillStyle = 'rgba(30,14,6,0.35)'; g.fill();
}

function oneCarrot(g, pal, x, y, h, tilt) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(h, h);
  g.lineJoin = 'round';
  for (const a of [-0.6, -0.22, 0.22, 0.6, 0]) {
    g.save(); g.translate(0, -0.6); g.rotate(a); leaf(g, 0.44 - Math.abs(a) * 0.16, 0.075, a ? pal.leaf : pal.leafDark, pal.leafDark); g.restore();
  }
  g.beginPath(); g.moveTo(-0.15, -0.66); g.bezierCurveTo(-0.16, -0.4, -0.06, -0.12, 0, 0); g.bezierCurveTo(0.06, -0.12, 0.16, -0.4, 0.15, -0.66);
  g.quadraticCurveTo(0, -0.74, -0.15, -0.66); g.closePath();
  const gr = g.createLinearGradient(-0.15, 0, 0.15, 0);
  gr.addColorStop(0, css(lighten(pal.orange, 0.25))); gr.addColorStop(0.6, css(pal.orange)); gr.addColorStop(1, css(darken(pal.orange, 0.25)));
  g.fillStyle = gr; g.fill(); g.lineWidth = 0.018; g.strokeStyle = css(darken(pal.orange, 0.5)); g.stroke();
  g.lineWidth = 0.014;
  for (const [yy, ww] of [[-0.56, 0.1], [-0.44, 0.08], [-0.32, 0.06], [-0.2, 0.04]]) { g.beginPath(); g.moveTo(-ww, yy); g.lineTo(ww * 0.4, yy + 0.015); g.stroke(); }
  g.restore();
}

function carrots(g, pal, x, y, h) {
  mound(g, x, y, h * 0.4);
  oneCarrot(g, pal, x - h * 0.2, y - h * 0.02, h * 0.86, -0.18);
  oneCarrot(g, pal, x + h * 0.2, y - h * 0.02, h * 0.82, 0.2);
  oneCarrot(g, pal, x, y, h);
}

function tomato(g, pal, x, y, r) {
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
  gr.addColorStop(0, css(lighten(pal.red, 0.35))); gr.addColorStop(0.5, css(pal.red)); gr.addColorStop(1, css(darken(pal.red, 0.35)));
  g.beginPath(); g.ellipse(x, y, r * 1.08, r, 0, 0, TAU); g.fillStyle = gr; g.fill();
  g.lineWidth = Math.max(0.7, r * 0.07); g.strokeStyle = css(darken(pal.red, 0.55)); g.stroke();
  g.beginPath(); g.ellipse(x - r * 0.42, y - r * 0.4, r * 0.2, r * 0.12, -0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
  star(g, x, y - r * 0.9, r * 0.5, r * 0.16, 5, -Math.PI / 2 + 0.3);
  g.fillStyle = css(pal.leafDark); g.fill(); g.lineWidth = Math.max(0.5, r * 0.04); g.strokeStyle = css(darken(pal.leafDark, 0.4)); g.stroke();
  g.beginPath(); g.moveTo(x, y - r * 0.85); g.lineTo(x + r * 0.08, y - r * 1.2); g.lineWidth = Math.max(1, r * 0.1); g.strokeStyle = css(pal.leafDark); g.stroke();
}

function tomatoPlant(g, pal, x, y, h) {
  mound(g, x, y, h * 0.45);
  g.save(); g.translate(x, y);
  g.lineCap = 'round';
  g.strokeStyle = '#9a6a3a'; g.lineWidth = h * 0.05; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h * 0.95); g.stroke();
  for (const [a, l] of [[-1.15, 0.5], [1.15, 0.5], [-0.6, 0.52], [0.6, 0.52], [-1.6, 0.38], [1.6, 0.38]]) {
    g.save(); g.translate(0, -h * 0.34); g.rotate(a); leaf(g, h * l, h * 0.1, pal.leaf, pal.leafDark); g.restore();
  }
  tomato(g, pal, -h * 0.2, -h * 0.2, h * 0.2);
  tomato(g, pal, h * 0.2, -h * 0.24, h * 0.18);
  tomato(g, pal, 0, -h * 0.5, h * 0.24);
  g.restore();
}

function cabbage(g, pal, x, y, h) {
  mound(g, x, y, h * 0.45);
  g.save(); g.translate(x, y - h * 0.4); g.scale(h, h);
  g.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    g.save(); g.rotate((i / 7) * TAU + 0.2);
    g.beginPath(); g.ellipse(0, -0.28, 0.2, 0.22, 0, 0, TAU);
    g.fillStyle = css(i % 2 ? pal.leaf : mix(pal.leaf, pal.leafDark, 0.3)); g.fill();
    g.lineWidth = 0.016; g.strokeStyle = css(pal.leafDark); g.stroke();
    g.beginPath(); g.moveTo(0, -0.12); g.lineTo(0, -0.42); g.lineWidth = 0.01; g.stroke();
    g.restore();
  }
  const gr = g.createRadialGradient(-0.08, -0.1, 0.02, 0, 0, 0.36);
  gr.addColorStop(0, css(lighten(pal.cab, 0.4))); gr.addColorStop(1, css(pal.cab));
  g.beginPath(); g.arc(0, 0, 0.34, 0, TAU); g.fillStyle = gr; g.fill(); g.lineWidth = 0.02; g.strokeStyle = css(mix(pal.leafDark, pal.cab, 0.4)); g.stroke();
  g.lineWidth = 0.016;
  for (const [r, a0, a1] of [[0.24, 3.6, 5.6], [0.15, 0.2, 2.2], [0.28, 1.6, 3.4], [0.09, 3.0, 5.0]]) { g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke(); }
  g.beginPath(); g.moveTo(-0.02, 0.02); g.lineTo(-0.1, 0.28); g.moveTo(0.02, 0); g.lineTo(0.2, 0.2); g.moveTo(0, -0.02); g.lineTo(0.06, -0.3); g.stroke();
  g.restore();
}

function radish(g, pal, x, y, h) {
  mound(g, x, y, h * 0.4);
  const one = (dx, s, tilt) => {
    g.save(); g.translate(x + dx * h, y); g.rotate(tilt); g.scale(h * s, h * s);
    for (const a of [-0.5, 0, 0.5]) { g.save(); g.translate(0, -0.5); g.rotate(a); leaf(g, 0.4 - Math.abs(a) * 0.1, 0.09, pal.leaf, pal.leafDark); g.restore(); }
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-0.06, -0.06, -0.3, -0.18, -0.28, -0.32); g.bezierCurveTo(-0.26, -0.5, 0.26, -0.5, 0.28, -0.32); g.bezierCurveTo(0.3, -0.18, 0.06, -0.06, 0, 0);
    const gr = g.createLinearGradient(0, -0.5, 0, 0);
    gr.addColorStop(0, css(pal.pink)); gr.addColorStop(0.55, css(darken(pal.pink, 0.08))); gr.addColorStop(0.75, '#fff6f0'); gr.addColorStop(1, '#fff');
    g.fillStyle = gr; g.fill(); g.lineWidth = 0.02; g.strokeStyle = css(darken(pal.pink, 0.5)); g.stroke();
    g.beginPath(); g.ellipse(-0.1, -0.38, 0.06, 0.035, -0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
    g.restore();
  };
  one(-0.2, 0.7, -0.15); one(0.2, 0.7, 0.15); one(0, 0.9, 0);
}

function pumpkin(g, pal, x, y, h) {
  mound(g, x, y, h * 0.5);
  g.save(); g.translate(x, y - h * 0.3); g.scale(h, h);
  g.lineJoin = 'round';
  for (const dx of [-0.22, 0.22, 0]) {
    g.beginPath(); g.ellipse(dx, 0, dx ? 0.22 : 0.24, 0.3, 0, 0, TAU);
    g.fillStyle = css(dx ? darken(pal.orange, 0.1) : lighten(pal.orange, 0.08)); g.fill();
    g.lineWidth = 0.02; g.strokeStyle = css(darken(pal.orange, 0.5)); g.stroke();
  }
  g.beginPath(); g.ellipse(-0.06, -0.12, 0.05, 0.1, 0.3, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill();
  g.beginPath(); g.moveTo(-0.03, -0.28); g.quadraticCurveTo(-0.02, -0.4, 0.05, -0.42); g.lineWidth = 0.07; g.lineCap = 'round'; g.strokeStyle = css(pal.leafDark); g.stroke();
  g.save(); g.translate(0.16, -0.3); g.rotate(0.9); leaf(g, 0.3, 0.1, pal.leaf, pal.leafDark); g.restore();
  g.restore();
}

function sunflower(g, pal, x, y, h, col = null) {
  mound(g, x, y, h * 0.25);
  g.save(); g.translate(x, y); g.scale(h, h);
  g.lineCap = 'round';
  g.strokeStyle = css(pal.leafDark); g.lineWidth = 0.04; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0.03, -0.4, 0, -0.62); g.stroke();
  for (const sx of [-1, 1]) { g.save(); g.translate(0.01, -0.2 - (sx > 0 ? 0.08 : 0)); g.rotate(sx * 1.1); leaf(g, 0.26, 0.08, pal.leaf, pal.leafDark); g.restore(); }
  const petal = col || pal.yellow;
  g.translate(0, -0.7);
  const n = 14;
  for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) {
    g.save(); g.rotate((i / n) * TAU + k * 0.22); g.beginPath(); g.ellipse(0, -0.2 + k * 0.03, 0.055 - k * 0.008, 0.12 - k * 0.025, 0, 0, TAU);
    g.fillStyle = css(k ? lighten(petal, 0.25) : darken(petal, 0.06)); g.fill(); g.lineWidth = 0.008; g.strokeStyle = css(darken(petal, 0.4)); g.stroke(); g.restore();
  }
  g.beginPath(); g.arc(0, 0, 0.13, 0, TAU); g.fillStyle = css(darken(pal.soil, 0.2)); g.fill(); g.lineWidth = 0.014; g.strokeStyle = css(darken(pal.soil, 0.5)); g.stroke();
  g.fillStyle = css(lighten(pal.soil2, 0.15));
  for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 0.012 + (i % 6) * 0.017; g.beginPath(); g.arc(Math.cos(a) * r * 2.2, Math.sin(a) * r * 2.2, 0.012, 0, TAU); g.fill(); }
  g.restore();
}

function can(g, pal, x, y, s, flip = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * flip, s);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const col = pal.can, dk = darken(col, 0.45);
  g.beginPath(); g.ellipse(0.02, 0.0, 0.5, 0.07, 0, 0, TAU); g.fillStyle = 'rgba(30,14,6,0.3)'; g.fill();
  // ручка
  g.beginPath(); g.arc(-0.02, -0.58, 0.3, Math.PI * 1.05, Math.PI * 1.98); g.lineWidth = 0.085; g.strokeStyle = css(dk); g.stroke();
  g.lineWidth = 0.05; g.strokeStyle = css(lighten(col, 0.1)); g.stroke();
  // носик
  g.beginPath(); g.moveTo(0.26, -0.12); g.lineTo(0.28, -0.3); g.lineTo(0.78, -0.82); g.lineTo(0.86, -0.74); g.lineTo(0.38, -0.1); g.closePath();
  g.fillStyle = css(lighten(col, 0.08)); g.fill(); g.lineWidth = 0.025; g.strokeStyle = css(dk); g.stroke();
  // корпус
  g.beginPath(); g.moveTo(-0.34, -0.02); g.lineTo(0.34, -0.02); g.lineTo(0.3, -0.62); g.lineTo(-0.3, -0.62); g.closePath();
  const gr = g.createLinearGradient(-0.34, 0, 0.34, 0);
  gr.addColorStop(0, css(lighten(col, 0.3))); gr.addColorStop(0.45, css(col)); gr.addColorStop(1, css(darken(col, 0.3)));
  g.fillStyle = gr; g.fill(); g.lineWidth = 0.03; g.strokeStyle = css(dk); g.stroke();
  g.beginPath(); g.ellipse(0, -0.62, 0.3, 0.06, 0, 0, TAU); g.fillStyle = css(dk); g.fill(); g.stroke();
  // ободки
  g.lineWidth = 0.02; g.beginPath(); g.moveTo(-0.33, -0.2); g.lineTo(0.33, -0.2); g.moveTo(-0.32, -0.42); g.lineTo(0.32, -0.42); g.stroke();
  g.beginPath(); g.moveTo(-0.22, -0.1); g.lineTo(-0.2, -0.54); g.lineWidth = 0.03; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke();
  // розетка
  g.save(); g.translate(0.82, -0.78); g.rotate(-0.85 + 0.0);
  g.beginPath(); g.ellipse(0, 0, 0.05, 0.14, 0, 0, TAU); g.fillStyle = css(darken(col, 0.1)); g.fill(); g.lineWidth = 0.025; g.strokeStyle = css(dk); g.stroke();
  g.restore();
  g.fillStyle = 'rgba(160,215,255,0.9)';
  for (const [dx, dy] of [[0.95, -0.62], [1.02, -0.74], [0.92, -0.5]]) { g.beginPath(); g.ellipse(dx, dy, 0.025, 0.04, 0.5, 0, TAU); g.fill(); }
  g.restore();
}

function plant(g, pal, kind, x, y, h) {
  if (kind === 0) carrots(g, pal, x, y, h);
  else if (kind === 1) tomatoPlant(g, pal, x, y, h);
  else if (kind === 2) cabbage(g, pal, x, y, h * 0.85);
  else if (kind === 3) radish(g, pal, x, y, h * 0.8);
  else if (kind === 4) pumpkin(g, pal, x, y, h * 0.8);
  else sunflower(g, pal, x, y, h * 1.05, kind === 5 ? null : pal.pink);
}

function soil(g, pal, rng, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, css(lighten(pal.soil, 0.2))); gr.addColorStop(1, css(lighten(pal.soil, 0.02)));
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  // борозды
  g.lineWidth = 3;
  for (let yy = y + 5; yy < y + h; yy += 9) {
    g.strokeStyle = css(pal.soil2, 0.55); g.beginPath(); g.moveTo(x, yy);
    for (let xx = x; xx <= x + w; xx += 12) g.lineTo(xx, yy + Math.sin(xx * 0.12 + yy) * 1.5);
    g.stroke();
    g.strokeStyle = css(darken(pal.soil, 0.4), 0.4); g.beginPath(); g.moveTo(x, yy + 4);
    for (let xx = x; xx <= x + w; xx += 12) g.lineTo(xx, yy + 4 + Math.sin(xx * 0.12 + yy) * 1.5);
    g.stroke();
  }
  for (let i = 0; i < w * h / 90; i++) {
    g.beginPath(); g.arc(x + rng.range(0, w), y + rng.range(0, h), rng.range(0.8, 2.2), 0, TAU);
    g.fillStyle = rng.chance(0.5) ? css(pal.soil2, 0.8) : css(darken(pal.soil, 0.5), 0.7); g.fill();
  }
  g.restore();
}

function planks(g, pal, x, y, w, h) {
  g.fillStyle = css(pal.plank); g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, y, w, 1.4);
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y + h - 1.6, w, 1.6);
}

function grassTex(g, pal, rng, x, y, w, h, n) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = css(pal.grass); g.fillRect(x, y, w, h);
  g.lineCap = 'round'; g.lineWidth = 1.3;
  for (let i = 0; i < n; i++) {
    const px = rng.range(x, x + w), py = rng.range(y, y + h), l = rng.range(3, 7), lean = rng.range(-2, 2);
    g.strokeStyle = css(rng.chance(0.5) ? pal.grass2 : lighten(pal.grass, 0.18), 0.9);
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + lean * 0.4, py - l * 0.6, px + lean, py - l); g.stroke();
  }
  g.restore();
}

function post(g, pal, x, y, s) {
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x - s / 2 + 2, y - s / 2 + 2, s, s);
  g.fillStyle = css(pal.fence); g.fillRect(x - s / 2, y - s / 2, s, s);
  g.lineWidth = 1; g.strokeStyle = css(pal.fenceDark); g.strokeRect(x - s / 2, y - s / 2, s, s);
  g.fillStyle = css(pal.fenceDark); g.fillRect(x - s / 2 + 3, y - s / 2 + 3, s - 6, s - 6);
  g.beginPath(); g.moveTo(x - s * 0.3, y + s * 0.3); g.lineTo(x + s * 0.3, y + s * 0.3); g.lineTo(x + s * 0.3, y - s * 0.3); g.closePath();
  g.fillStyle = css(pal.fence); g.fill();
  g.beginPath(); g.moveTo(x - s * 0.3, y + s * 0.3); g.lineTo(x - s * 0.3, y - s * 0.3); g.lineTo(x + s * 0.3, y - s * 0.3); g.closePath();
  g.fillStyle = css(mix(pal.fence, pal.fenceDark, 0.5)); g.fill();
}

function border(g, pal, rng) {
  g.fillStyle = css(pal.grass2); g.fillRect(0, 0, CW, CH);
  const bg = rng.fork('bg');
  // трава в кайме: рисуем по всей площади, поле потом закроет
  grassTex(g, pal, bg, 0, 0, CW, CH, 2400);
  g.fillStyle = css(pal.grass2, 0.5);
  g.fillRect(0, 0, CW, CH);
  grassTex(g, pal, bg, 0, 0, CW, CH, 900);
  const c0 = 26, W = CW - 2 * c0, H = CH - 2 * c0;
  const sides = [[c0, c0, W], [CW - c0, c0, H], [CW - c0, CH - c0, W], [c0, CH - c0, H]];
  const fr = bg.fork('flw');
  sides.forEach(([x, y, len], sd) => {
    g.save(); g.translate(x, y); g.rotate(sd * Math.PI / 2);
    // тень забора
    g.fillStyle = 'rgba(20,40,10,0.28)'; g.fillRect(0, -3, len, 22);
    // перекладины
    for (const [yy, hh] of [[-8, 4.5], [4, 4.5]]) {
      g.fillStyle = css(pal.fenceDark); g.fillRect(0, yy, len, hh);
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, yy, len, 1);
    }
    const n = Math.round((len - 30) / 13), step = (len - 30) / (n - 1);
    for (let i = 0; i < n; i++) {
      const px = 15 + i * step, w = 9;
      g.beginPath(); g.moveTo(px - w / 2, 15); g.lineTo(px - w / 2, -10); g.lineTo(px, -16); g.lineTo(px + w / 2, -10); g.lineTo(px + w / 2, 15); g.closePath();
      g.fillStyle = css(pal.fence); g.fill();
      g.fillStyle = css(mix(pal.fence, pal.fenceDark, 0.45)); g.fillRect(px + 0.5, -10 + 0, w / 2 - 0.5, 25);
      g.beginPath(); g.moveTo(px, -16); g.lineTo(px + w / 2, -10); g.lineTo(px, -10); g.closePath(); g.fill();
      g.lineWidth = 0.9; g.strokeStyle = css(darken(pal.fenceDark, 0.3));
      g.beginPath(); g.moveTo(px - w / 2, 15); g.lineTo(px - w / 2, -10); g.lineTo(px, -16); g.lineTo(px + w / 2, -10); g.lineTo(px + w / 2, 15); g.closePath(); g.stroke();
      g.beginPath(); g.arc(px, -4, 1, 0, TAU); g.fillStyle = css(pal.fenceDark); g.fill();
      g.beginPath(); g.arc(px, 8, 1, 0, TAU); g.fill();
      // цветочки у основания
      if (i % 3 === 1) {
        const fc = fr.pick([pal.pink, pal.yellow, [255, 255, 255], pal.red]);
        g.beginPath(); g.moveTo(px + 6.5, 19); g.lineTo(px + 6.5, 14); g.lineWidth = 1; g.strokeStyle = css(pal.leafDark); g.stroke();
        for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.arc(px + 6.5 + Math.cos(a) * 2.2, 13 + Math.sin(a) * 2.2, 1.6, 0, TAU); g.fillStyle = css(fc); g.fill(); }
        g.beginPath(); g.arc(px + 6.5, 13, 1.2, 0, TAU); g.fillStyle = css(pal.yellow); g.fill();
      }
    }
    g.restore();
  });
  for (const [x, y] of [[c0, c0], [CW - c0, c0], [CW - c0, CH - c0], [c0, CH - c0]]) post(g, pal, x, y, 20);
  return 46;
}

export default {
  id: 'garden',
  name: 'Огород',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const pr = rng.fork('gar');
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    const cx = CW / 2, cy = CH / 2;
    const comp = rng.int(0, 2);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    grassTex(g, pal, pr.fork('g'), fx, fy, fw, fh, 900);
    const kinds = pr.shuffle([0, 1, 2, 3, 4, 5, 6]);

    if (comp === 0) {
      // ряды грядок
      const rows = 5, bh = 72, gap = (fh - rows * bh) / (rows - 1);
      for (let r = 0; r < rows; r++) {
        const y = fy + r * (bh + gap);
        g.fillStyle = 'rgba(20,50,10,0.3)'; g.fillRect(fx, y + 4, fw, bh);
        soil(g, pal, pr, fx, y, fw, bh);
        planks(g, pal, fx, y, fw, 5); planks(g, pal, fx, y + bh - 5, fw, 5);
        const kind = kinds[r % kinds.length];
        const n = kind === 5 || kind === 6 ? 4 : 4;
        for (let i = 0; i < n; i++) plant(g, pal, kind, fx + fw * (i + 0.5) / n, y + bh - 8, 60);
        if (r < rows - 1) {
          // на тропинке: цветочки/леечка
          const yy = y + bh + gap / 2;
          for (let i = 0; i < 9; i++) {
            const px = fx + fw * (i + 0.5) / 9 + pr.range(-3, 3);
            g.beginPath(); g.arc(px, yy + pr.range(-2, 2), 2.2, 0, TAU); g.fillStyle = css(pr.pick([pal.pink, pal.yellow, [255, 255, 255]])); g.fill();
          }
        }
      }
    } else if (comp === 1) {
      // четыре грядки крест-накрест
      const pw = 22, plotW = (fw - pw) / 2, plotH = (fh - pw) / 2;
      g.fillStyle = css([226, 206, 150]); g.fillRect(cx - pw / 2, fy, pw, fh); g.fillRect(fx, cy - pw / 2, fw, pw);
      g.fillStyle = css([186, 164, 110], 0.8);
      for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(pr.range(fx, fx + fw), pr.range(fy, fy + fh), pr.range(0.8, 1.8), 0, TAU); g.fill(); }
      let q = 0;
      for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const x = fx + sx * (plotW + pw), y = fy + sy * (plotH + pw);
        soil(g, pal, pr, x, y, plotW, plotH);
        planks(g, pal, x, y, plotW, 5); planks(g, pal, x, y + plotH - 5, plotW, 5);
        g.fillStyle = css(pal.plank); g.fillRect(x, y, 5, plotH); g.fillRect(x + plotW - 5, y, 5, plotH);
        const kind = kinds[q++];
        const cols = 2, rws = 3;
        for (let r = 0; r < rws; r++) for (let c = 0; c < cols; c++) {
          plant(g, pal, kind, x + plotW * (c + 0.5) / cols, y + 14 + (plotH - 18) * (r + 1) / rws - 2, 56);
        }
      }
      // центр: цветок на площадке
      g.beginPath(); g.arc(cx, cy, 30, 0, TAU); g.fillStyle = css(pal.soil); g.fill(); g.lineWidth = 4; g.strokeStyle = css(pal.plank); g.stroke();
      sunflower(g, pal, cx, cy + 22, 64, pr.chance(0.5) ? null : pal.pink);
    } else {
      // шахматная посадка на зелёной лужайке: каждое растение на своей земляной кочке
      g.fillStyle = css(pal.grass2, 0.35);
      for (let y = fy; y < fy + fh; y += 40) g.fillRect(fx, y, fw, 20);
      const rows = 6, sy = fh / rows, sx = fw / 3;
      let k = pr.int(0, 5);
      const cans = [[fx + 40, fy + fh - 30], [fx + fw - 40, fy + 46]];
      for (let r = 0; r < rows; r++) {
        const odd = r % 2, cnt = odd ? 2 : 3;
        for (let c = 0; c < cnt; c++) {
          const x = fx + sx * (c + (odd ? 1 : 0.5)), y = fy + sy * (r + 1) - 12;
          if (cans.some(([qx, qy]) => Math.hypot(qx - x, qy - y) < 70)) continue;
          g.save(); g.beginPath(); g.ellipse(x, y + 2, 38, 13, 0, 0, TAU); g.clip();
          soil(g, pal, pr, x - 40, y - 12, 80, 28);
          g.restore();
          g.beginPath(); g.ellipse(x, y + 2, 38, 13, 0, 0, TAU); g.lineWidth = 2.2; g.strokeStyle = css(pal.plank); g.stroke();
          plant(g, pal, kinds[(k++) % 7], x, y, 62);
        }
      }
      can(g, pal, cans[0][0], cans[0][1], 58, 1, -0.05);
      can(g, pal, cans[1][0], cans[1][1], 58, -1, 0.05);
    }
    g.restore();
    return { edge: pal.edge, fringe: [214, 196, 150] };
  },
};
