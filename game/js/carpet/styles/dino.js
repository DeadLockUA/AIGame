// Динозавры: следы лап, папоротники, яйца, кости, вулкан, малыши-динозаврики. Кайма из листьев и костей.
import { CW, CH, css, mix, darken, lighten, pickPalette, petalPath, mirrorX } from '../kit.js';

const PALS = [
  { field: [214, 178, 118], field2: [188, 148, 90], border: [66, 98, 56], accent: [236, 206, 128], accent2: [196, 96, 58], ink: [250, 240, 206], dark: [52, 36, 24], leaf: [92, 142, 70], leaf2: [58, 104, 54], egg: [244, 230, 196], baby: [118, 176, 88], baby2: [226, 150, 70], rock: [92, 64, 52], edge: [54, 74, 44] },
  { field: [48, 88, 66], field2: [34, 70, 52], border: [128, 80, 44], accent: [238, 188, 96], accent2: [232, 112, 56], ink: [248, 236, 200], dark: [22, 38, 28], leaf: [110, 168, 78], leaf2: [74, 130, 70], egg: [240, 226, 186], baby: [232, 170, 74], baby2: [120, 190, 150], rock: [70, 52, 50], edge: [86, 52, 30] },
  { field: [150, 70, 48], field2: [120, 52, 38], border: [44, 66, 50], accent: [250, 190, 80], accent2: [255, 120, 50], ink: [252, 236, 200], dark: [38, 20, 18], leaf: [96, 150, 74], leaf2: [60, 108, 58], egg: [246, 228, 192], baby: [140, 190, 90], baby2: [250, 170, 80], rock: [60, 40, 40], edge: [30, 46, 36] },
  { field: [84, 136, 126], field2: [62, 112, 104], border: [150, 104, 58], accent: [244, 214, 140], accent2: [226, 120, 78], ink: [250, 242, 214], dark: [30, 52, 48], leaf: [140, 190, 100], leaf2: [78, 140, 84], egg: [248, 236, 204], baby: [238, 190, 90], baby2: [210, 120, 160], rock: [84, 74, 70], edge: [104, 70, 36] },
  { field: [236, 222, 182], field2: [214, 196, 150], border: [156, 82, 48], accent: [96, 140, 70], accent2: [210, 100, 60], ink: [255, 248, 224], dark: [66, 44, 30], leaf: [104, 156, 74], leaf2: [66, 116, 58], egg: [250, 240, 212], baby: [100, 170, 120], baby2: [232, 160, 70], rock: [110, 82, 64], edge: [112, 54, 30] },
  { field: [90, 78, 108], field2: [70, 60, 90], border: [60, 96, 62], accent: [244, 200, 110], accent2: [240, 120, 90], ink: [248, 238, 214], dark: [30, 24, 44], leaf: [120, 176, 96], leaf2: [78, 134, 76], egg: [244, 232, 204], baby: [150, 206, 110], baby2: [240, 170, 110], rock: [68, 56, 72], edge: [38, 62, 40] },
];

import { RNG, hashString } from '../../util.js';

const TAU = Math.PI * 2;

function outline(g, col, w) { g.lineWidth = w; g.strokeStyle = css(col); g.lineJoin = 'round'; g.stroke(); }

/** Папоротник: растёт вверх от (0,0). */
function fern(g, len, c1, c2, curl = 0.3, dark = null) {
  const P1 = [curl * len * 0.35, -len * 0.5], P2 = [curl * len * 0.55, -len];
  const pt = (t) => [2 * (1 - t) * t * P1[0] + t * t * P2[0], -len * 0 + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
  const tan = (t) => [2 * (1 - t) * P1[0] + 2 * t * (P2[0] - P1[0]), 2 * (1 - t) * P1[1] + 2 * t * (P2[1] - P1[1])];
  g.strokeStyle = css(c2); g.lineWidth = Math.max(1, len * 0.03); g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(P1[0], P1[1], P2[0], P2[1]); g.stroke();
  const n = 11;
  for (let i = 1; i <= n; i++) {
    const t = 0.1 + (i / n) * 0.86;
    const [x, y] = pt(t), [tx, ty] = tan(t);
    const a = Math.atan2(ty, tx) + Math.PI / 2;
    const L = len * 0.34 * (1 - t * 0.78);
    for (const s of [-1, 1]) {
      g.save(); g.translate(x, y); g.rotate(a + s * 1.05);
      petalPath(g, L, L * 0.3);
      g.fillStyle = css(s > 0 ? c1 : mix(c1, c2, 0.25)); g.fill();
      if (dark) { g.lineWidth = Math.max(0.5, len * 0.012); g.strokeStyle = css(dark, 0.6); g.stroke(); }
      g.restore();
    }
  }
  const [ex, ey] = P2;
  g.save(); g.translate(ex, ey); g.rotate(Math.atan2(tan(1)[1], tan(1)[0]) + Math.PI / 2);
  petalPath(g, len * 0.1, len * 0.04); g.fillStyle = css(c1); g.fill(); g.restore();
}

function eggPath(g, w, h) {
  g.beginPath(); g.moveTo(0, -h);
  g.bezierCurveTo(w * 0.7, -h, w, -h * 0.1, w, h * 0.3);
  g.bezierCurveTo(w, h * 0.78, w * 0.55, h, 0, h);
  g.bezierCurveTo(-w * 0.55, h, -w, h * 0.78, -w, h * 0.3);
  g.bezierCurveTo(-w, -h * 0.1, -w * 0.7, -h, 0, -h);
  g.closePath();
}

function egg(g, w, h, pal, base, spot, rng) {
  eggPath(g, w, h);
  const gr = g.createLinearGradient(-w, -h, w, h);
  gr.addColorStop(0, css(lighten(base, 0.25))); gr.addColorStop(1, css(darken(base, 0.12)));
  g.fillStyle = gr; g.fill();
  g.save(); eggPath(g, w, h); g.clip();
  const n = 5 + (rng ? rng.int(0, 3) : 2);
  for (let i = 0; i < n; i++) {
    const a = (i * 2.399) % TAU, r = (0.25 + ((i * 0.37) % 0.55)) * w;
    g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r * 1.3, w * (0.1 + (i % 3) * 0.05), 0, TAU);
    g.fillStyle = css(spot, 0.8); g.fill();
  }
  g.restore();
  eggPath(g, w, h); outline(g, pal.dark, Math.max(0.8, w * 0.07));
  g.beginPath(); g.ellipse(-w * 0.35, -h * 0.35, w * 0.12, h * 0.2, 0.5, 0, TAU);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
}

function footprint(g, s, col, alpha = 1) {
  g.fillStyle = css(col, alpha);
  g.beginPath(); g.ellipse(0, s * 0.3, s * 0.3, s * 0.36, 0, 0, TAU); g.fill();
  for (const a of [-0.7, 0, 0.7]) {
    g.save(); g.rotate(a); g.translate(0, -s * 0.42);
    g.beginPath(); g.ellipse(0, 0, s * 0.15, s * 0.26, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-s * 0.08, -s * 0.2); g.lineTo(0, -s * 0.42); g.lineTo(s * 0.08, -s * 0.2); g.closePath(); g.fill();
    g.restore();
  }
}

function bone(g, len, th, col, line) {
  const r = th * 0.6;
  g.beginPath();
  g.rect(-len / 2, -th / 2, len, th);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    g.moveTo(sx * len / 2 + r, sy * th * 0.55); g.arc(sx * (len / 2 + r * 0.2), sy * th * 0.55, r, 0, TAU);
  }
  g.fillStyle = css(col); g.fill();
  g.lineWidth = Math.max(0.6, th * 0.25); g.strokeStyle = css(line); g.stroke();
  g.beginPath(); g.rect(-len / 2, -th / 2, len, th); g.fillStyle = css(col); g.fill();
}

/** Малыш-динозаврик в профиль, смотрит вправо. s — длина тела. */
function baby(g, s, c, belly, spike, dark, cheek) {
  const lw = Math.max(0.8, s * 0.045);
  // хвост
  g.beginPath(); g.moveTo(-s * 0.35, -s * 0.14);
  g.quadraticCurveTo(-s * 0.95, -s * 0.05, -s * 1.05, s * 0.2);
  g.quadraticCurveTo(-s * 0.7, s * 0.1, -s * 0.3, s * 0.3); g.closePath();
  g.fillStyle = css(c); g.fill(); outline(g, dark, lw);
  // шипы
  for (let i = 0; i < 5; i++) {
    const x = -s * 0.32 + i * s * 0.16, y = -s * 0.3 + Math.abs(i - 2) * s * 0.035;
    g.beginPath(); g.moveTo(x - s * 0.07, y + s * 0.03); g.lineTo(x, y - s * 0.17); g.lineTo(x + s * 0.07, y + s * 0.03); g.closePath();
    g.fillStyle = css(spike); g.fill(); outline(g, dark, lw * 0.8);
  }
  // ноги
  for (const x of [-s * 0.22, s * 0.22]) {
    g.beginPath(); g.roundRect ? g.roundRect(x - s * 0.08, s * 0.1, s * 0.17, s * 0.4, s * 0.07) : g.rect(x - s * 0.08, s * 0.1, s * 0.17, s * 0.4);
    g.fillStyle = css(darken(c, 0.12)); g.fill(); outline(g, dark, lw);
  }
  // тело
  g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.33, 0, 0, TAU);
  g.fillStyle = css(c); g.fill();
  g.save(); g.clip();
  g.beginPath(); g.ellipse(s * 0.04, s * 0.3, s * 0.5, s * 0.24, 0, 0, TAU); g.fillStyle = css(belly); g.fill();
  g.restore();
  g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.33, 0, 0, TAU); outline(g, dark, lw);
  // голова
  g.beginPath(); g.ellipse(s * 0.56, -s * 0.28, s * 0.3, s * 0.26, 0, 0, TAU);
  g.fillStyle = css(c); g.fill(); outline(g, dark, lw);
  g.beginPath(); g.ellipse(s * 0.78, -s * 0.22, s * 0.16, s * 0.12, 0, 0, TAU);
  g.fillStyle = css(lighten(c, 0.15)); g.fill(); outline(g, dark, lw * 0.8);
  g.beginPath(); g.arc(s * 0.62, -s * 0.37, s * 0.075, 0, TAU); g.fillStyle = '#fff'; g.fill(); outline(g, dark, lw * 0.7);
  g.beginPath(); g.arc(s * 0.64, -s * 0.37, s * 0.04, 0, TAU); g.fillStyle = css(dark); g.fill();
  g.beginPath(); g.arc(s * 0.58, -s * 0.2, s * 0.055, 0, TAU); g.fillStyle = css(cheek, 0.7); g.fill();
  g.beginPath(); g.arc(s * 0.74, -s * 0.2, s * 0.07, 0.2, 1.7); g.lineWidth = lw * 0.8; g.strokeStyle = css(dark); g.stroke();
}

/** Диплодок с длинной шеей, смотрит вправо. */
function longneck(g, s, c, belly, spot, dark) {
  const lw = Math.max(0.8, s * 0.03);
  g.lineCap = 'round';
  // хвост
  g.beginPath(); g.moveTo(-s * 0.3, -s * 0.05);
  g.bezierCurveTo(-s * 0.7, s * 0.0, -s * 0.8, s * 0.2, -s * 1.0, s * 0.14);
  g.bezierCurveTo(-s * 0.8, s * 0.3, -s * 0.5, s * 0.25, -s * 0.2, s * 0.25); g.closePath();
  g.fillStyle = css(c); g.fill(); outline(g, dark, lw);
  // ноги
  for (const x of [-s * 0.28, -s * 0.1, s * 0.12, s * 0.3]) {
    g.beginPath(); g.rect(x - s * 0.06, s * 0.1, s * 0.12, s * 0.38);
    g.fillStyle = css(darken(c, 0.15)); g.fill(); outline(g, dark, lw);
  }
  // шея
  g.beginPath(); g.moveTo(s * 0.18, -s * 0.12);
  g.bezierCurveTo(s * 0.45, -s * 0.2, s * 0.35, -s * 0.8, s * 0.5, -s * 1.05);
  g.lineTo(s * 0.66, -s * 1.0);
  g.bezierCurveTo(s * 0.54, -s * 0.7, s * 0.66, -s * 0.1, s * 0.4, s * 0.15); g.closePath();
  g.fillStyle = css(c); g.fill(); outline(g, dark, lw);
  // тело
  g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.26, 0, 0, TAU); g.fillStyle = css(c); g.fill();
  g.save(); g.clip();
  g.beginPath(); g.ellipse(0, s * 0.26, s * 0.45, s * 0.16, 0, 0, TAU); g.fillStyle = css(belly); g.fill();
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-s * 0.3 + i * s * 0.12, -s * 0.08 + (i % 2) * s * 0.1, s * 0.04, 0, TAU); g.fillStyle = css(spot, 0.9); g.fill(); }
  g.restore();
  g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.26, 0, 0, TAU); outline(g, dark, lw);
  // голова
  g.beginPath(); g.ellipse(s * 0.66, -s * 1.03, s * 0.13, s * 0.09, -0.15, 0, TAU);
  g.fillStyle = css(c); g.fill(); outline(g, dark, lw);
  g.beginPath(); g.arc(s * 0.66, -s * 1.06, s * 0.03, 0, TAU); g.fillStyle = '#fff'; g.fill();
  g.beginPath(); g.arc(s * 0.67, -s * 1.06, s * 0.016, 0, TAU); g.fillStyle = css(dark); g.fill();
}

/** Яйцо с вылупляющимся малышом. */
function hatchling(g, w, h, pal, body, rng) {
  const lw = Math.max(0.8, w * 0.07);
  // малыш
  g.beginPath(); g.arc(0, -h * 0.35, w * 0.72, 0, TAU); g.fillStyle = css(body); g.fill(); outline(g, pal.dark, lw);
  for (const sx of [-1, 1]) {
    g.beginPath(); g.moveTo(sx * w * 0.2, -h * 0.82); g.lineTo(sx * w * 0.32, -h * 1.15); g.lineTo(sx * w * 0.5, -h * 0.8); g.closePath();
    g.fillStyle = css(pal.accent2); g.fill(); outline(g, pal.dark, lw * 0.8);
    g.beginPath(); g.arc(sx * w * 0.28, -h * 0.4, w * 0.19, 0, TAU); g.fillStyle = '#fff'; g.fill(); outline(g, pal.dark, lw * 0.7);
    g.beginPath(); g.arc(sx * w * 0.28 + w * 0.03, -h * 0.38, w * 0.09, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
    g.beginPath(); g.arc(sx * w * 0.48, -h * 0.18, w * 0.1, 0, TAU); g.fillStyle = css(pal.accent2, 0.6); g.fill();
  }
  g.beginPath(); g.arc(0, -h * 0.17, w * 0.2, 0.2, Math.PI - 0.2); g.lineWidth = lw * 0.9; g.strokeStyle = css(pal.dark); g.stroke();
  // скорлупа с зубчиками
  g.save(); g.beginPath();
  const y0 = -h * 0.02, n = 6;
  g.moveTo(-w * 1.3, h * 1.3); g.lineTo(-w * 1.3, y0);
  for (let i = 0; i <= n; i++) g.lineTo(-w * 1.3 + (i / n) * w * 2.6, y0 + (i % 2 ? -h * 0.2 : h * 0.1));
  g.lineTo(w * 1.3, h * 1.3); g.closePath(); g.clip();
  egg(g, w, h, pal, pal.egg, pal.accent, rng);
  g.restore();
}

function volcano(g, w, h, pal, lava) {
  const lw = Math.max(1, w * 0.012);
  g.beginPath(); g.moveTo(-w / 2, 0);
  g.bezierCurveTo(-w * 0.25, -h * 0.12, -w * 0.15, -h * 0.8, -w * 0.1, -h);
  g.lineTo(w * 0.1, -h);
  g.bezierCurveTo(w * 0.15, -h * 0.8, w * 0.25, -h * 0.12, w / 2, 0); g.closePath();
  const gr = g.createLinearGradient(0, -h, 0, 0);
  gr.addColorStop(0, css(lighten(pal.rock, 0.1))); gr.addColorStop(1, css(darken(pal.rock, 0.2)));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.strokeStyle = css(pal.dark, 0.35); g.lineWidth = lw;
  for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(i * w * 0.02, -h); g.lineTo(i * w * 0.1, 0); g.stroke(); }
  // лава-потоки
  for (const [x, wid] of [[-0.03, 0.05], [0.05, 0.04]]) {
    g.beginPath(); g.moveTo(w * (x - 0.04), -h); g.bezierCurveTo(w * (x - 0.1), -h * 0.7, w * (x + 0.05), -h * 0.55, w * (x - 0.02), -h * 0.38);
    g.bezierCurveTo(w * (x - 0.06), -h * 0.2, w * (x + 0.1), -h * 0.12, w * (x + 0.02 + wid), -h * 0.04);
    g.lineWidth = w * wid; g.lineCap = 'round'; g.strokeStyle = css(lava); g.stroke();
    g.lineWidth = w * wid * 0.4; g.strokeStyle = css(lighten(lava, 0.45)); g.stroke();
  }
  g.restore();
  g.beginPath(); g.moveTo(-w * 0.1, -h); g.lineTo(-w * 0.14, -h * 0.82);
  g.moveTo(w * 0.1, -h); g.lineTo(w * 0.14, -h * 0.82);
  g.beginPath(); g.ellipse(0, -h, w * 0.1, h * 0.035, 0, 0, TAU);
  g.fillStyle = css(lava); g.fill(); outline(g, pal.dark, lw);
  g.beginPath(); g.moveTo(-w / 2, 0);
  g.bezierCurveTo(-w * 0.25, -h * 0.12, -w * 0.15, -h * 0.8, -w * 0.1, -h);
  g.moveTo(w * 0.1, -h);
  g.bezierCurveTo(w * 0.15, -h * 0.8, w * 0.25, -h * 0.12, w / 2, 0);
  outline(g, pal.dark, lw * 1.2);
}

function smoke(g, x, y, r, pal, n, rng) {
  for (let i = 0; i < n; i++) {
    const t = i / n;
    g.beginPath(); g.arc(x + Math.sin(t * 5) * r * 0.9, y - t * r * 5, r * (0.6 + t * 0.9), 0, TAU);
    g.fillStyle = css(mix(pal.ink, pal.rock, 0.3 + t * 0.4), 0.55 - t * 0.25); g.fill();
  }
}

function sparks(g, x, y, n, rng, col, spread = 40) {
  for (let i = 0; i < n; i++) {
    const a = rng.range(-2.4, -0.7), d = rng.range(10, spread);
    g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rng.range(1, 2.4), 0, TAU);
    g.fillStyle = css(col, 0.9); g.fill();
  }
}

function sun(g, x, y, r, pal) {
  g.strokeStyle = css(pal.accent, 0.8); g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2); g.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); g.stroke(); }
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = css(pal.accent); g.fill(); outline(g, pal.dark, 1.4);
}

function pteranodon(g, x, y, s, col, dark) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-s, -s * 0.2); g.quadraticCurveTo(-s * 0.4, -s * 0.5, 0, 0); g.quadraticCurveTo(s * 0.4, -s * 0.5, s, -s * 0.2);
  g.quadraticCurveTo(s * 0.5, s * 0.1, 0, s * 0.2); g.quadraticCurveTo(-s * 0.5, s * 0.1, -s, -s * 0.2); g.closePath();
  g.fillStyle = css(col); g.fill(); outline(g, dark, 1);
  g.beginPath(); g.moveTo(0, -s * 0.05); g.lineTo(s * 0.5, -s * 0.12); g.lineTo(0, s * 0.1); g.fillStyle = css(col); g.fill();
  g.restore();
}

function bonesX(g, len, th, pal) {
  for (const a of [0.55, -0.55]) { g.save(); g.rotate(a); bone(g, len, th, pal.ink, pal.dark); g.restore(); }
}

/** Лёгкий фон поля: россыпь следов, листиков и точек. */
function scatter(g, rng, fx, fy, fw, fh, pal) {
  const step = 30;
  for (let y = fy - 5, row = 0; y < fy + fh + 10; y += step, row++) {
    for (let x = fx + (row % 2) * step / 2; x < fx + fw + 10; x += step) {
      const px = x + rng.range(-5, 5), py = y + rng.range(-5, 5), k = rng.int(0, 4);
      g.save(); g.translate(px, py); g.rotate(rng.range(-0.8, 0.8));
      const col = mix(pal.field2, pal.dark, 0.18);
      if (k === 0) footprint(g, 8, col, 0.5);
      else if (k === 1) { petalPath(g, 11, 3.4); g.fillStyle = css(col, 0.45); g.fill(); }
      else if (k === 2) { g.beginPath(); g.arc(0, 0, 1.8, 0, TAU); g.fillStyle = css(col, 0.6); g.fill(); }
      else if (k === 3) { g.fillStyle = css(col, 0.4); g.fillRect(-4, -1, 8, 2); g.beginPath(); g.arc(-4, 0, 1.6, 0, TAU); g.arc(4, 0, 1.6, 0, TAU); g.fill(); }
      else { g.beginPath(); g.arc(0, 0, 3.4, 0, TAU); g.strokeStyle = css(col, 0.5); g.lineWidth = 1; g.stroke(); }
      g.restore();
    }
  }
}

function walk(step, margin, fn) {
  const o = 24, W = CW - 2 * o, H = CH - 2 * o;
  const sides = [[o, o, 1, 0, W, 0], [o + W, o, 0, 1, H, Math.PI / 2], [o + W, o + H, -1, 0, W, Math.PI], [o, o + H, 0, -1, H, -Math.PI / 2]];
  let idx = 0;
  for (const [sx, sy, dx, dy, len, ang] of sides) {
    const n = Math.max(1, Math.round((len - 2 * margin) / step));
    for (let i = 0; i < n; i++) {
      const t = margin + ((i + 0.5) / n) * (len - 2 * margin);
      fn(sx + dx * t, sy + dy * t, ang, idx++);
    }
  }
}

function border(g, pal, rng, variant) {
  const x0 = 6, band = 36;
  g.fillStyle = css(pal.border); g.fillRect(0, 0, CW, CH);
  // чешуйчатая текстура
  g.save(); g.beginPath(); g.rect(0, 0, CW, CH); g.rect(x0 + 3, x0 + 3, CW - 2 * x0 - 6, CH - 2 * x0 - 6); g.clip('evenodd');
  g.strokeStyle = css(darken(pal.border, 0.25), 0.55); g.lineWidth = 1;
  for (let y = 0; y < CH; y += 7) for (let x = ((y / 7) % 2) * 6; x < CW; x += 12) { g.beginPath(); g.arc(x, y, 6, 0.2, Math.PI - 0.2); g.stroke(); }
  g.restore();
  const lines = [[x0, 2.5, pal.accent], [x0 + 4, 1.5, pal.dark], [x0 + band, 1.5, pal.dark], [x0 + band + 3, 2.5, pal.accent]];
  for (const [o, w, c] of lines) { g.strokeStyle = css(c); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); }
  const mid = x0 + band / 2 + 2;
  g.strokeStyle = css(pal.dark, 0.5); g.lineWidth = 1; g.setLineDash([2, 4]); g.strokeRect(mid, mid, CW - 2 * mid, CH - 2 * mid); g.setLineDash([]);
  walk(24, 30, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    if (i % 2 === 0) {
      bone(g, 13, 4.2, pal.ink, pal.dark);
    } else if (variant === 1 && i % 4 === 1) {
      footprint(g, 12, pal.accent);
    } else {
      g.rotate(Math.PI / 2);
      for (const s of [-1, 1]) { g.save(); g.rotate(s * 0.75); petalPath(g, 16, 4.6); g.fillStyle = css(s > 0 ? pal.leaf : pal.leaf2); g.fill(); outline(g, pal.dark, 0.9); g.restore(); }
      g.beginPath(); g.arc(0, 0, 2.2, 0, TAU); g.fillStyle = css(pal.accent); g.fill();
    }
    g.restore();
  });
  const c0 = x0 + band / 2 + 2;
  for (const [x, y] of [[c0, c0], [CW - c0, c0], [c0, CH - c0], [CW - c0, CH - c0]]) {
    g.beginPath(); g.arc(x, y, 17, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
    g.beginPath(); g.arc(x, y, 15, 0, TAU); g.fillStyle = css(pal.accent); g.fill();
    g.save(); g.translate(x, y);
    if (variant === 2) { g.rotate(0.5); footprint(g, 14, pal.dark); }
    else { g.translate(0, 1); egg(g, 7, 10, pal, pal.egg, pal.accent2, rng); }
    g.restore();
  }
  return x0 + band + 7;
}

// ---- Композиции ----

function compVolcanoFull(g, rng, pal, B) {
  const cx = CW / 2;
  const baseY = B.y + B.h * 0.64;
  const sky = g.createLinearGradient(0, B.y, 0, baseY);
  sky.addColorStop(0, css(darken(pal.field, 0.15))); sky.addColorStop(1, css(mix(pal.field, pal.accent, 0.55)));
  g.fillStyle = sky; g.fillRect(B.x, B.y, B.w, B.h);
  // далёкие горы
  for (const [x, w, h, c] of [[B.x + 30, 120, 70, 0.25], [B.x + B.w - 30, 130, 85, 0.3], [cx - 5, 100, 50, 0.2]]) {
    g.beginPath(); g.moveTo(x - w / 2, baseY); g.lineTo(x - w * 0.08, baseY - h); g.lineTo(x + w * 0.1, baseY - h * 0.92); g.lineTo(x + w / 2, baseY); g.closePath();
    g.fillStyle = css(mix(pal.rock, pal.field, 0.5 - c), 0.8); g.fill();
  }
  for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(rng.range(B.x + 6, B.x + B.w - 6), rng.range(B.y + 6, baseY - 90), rng.range(0.8, 1.8), 0, TAU); g.fillStyle = css(pal.ink, 0.6); g.fill(); }
  sun(g, B.x + 42, B.y + 42, 14, pal);
  const flip = rng.chance(0.5) ? -1 : 1;
  for (let i = 0; i < 3; i++) pteranodon(g, cx + flip * (70 + i * 12), B.y + 36 + i * 18, 10 - i * 1.5, pal.dark, pal.ink);
  // дым и вулкан
  const vx = rng.range(-30, 30);
  g.save(); g.translate(cx + vx, baseY);
  smoke(g, 0, -178, 12, pal, 6, rng);
  volcano(g, 240, 170, pal, pal.accent2);
  sparks(g, 0, -176, 9, rng, pal.accent, 38);
  g.restore();
  // холм
  const hy = baseY - 6;
  g.beginPath(); g.moveTo(B.x - 5, hy + 8);
  g.bezierCurveTo(B.x + 60, hy - 14, cx - 30, hy + 4, cx, hy - 2);
  g.bezierCurveTo(cx + 40, hy - 8, B.x + B.w - 50, hy - 16, B.x + B.w + 5, hy + 6);
  g.lineTo(B.x + B.w + 5, B.y + B.h + 5); g.lineTo(B.x - 5, B.y + B.h + 5); g.closePath();
  const gr = g.createLinearGradient(0, hy, 0, B.y + B.h);
  gr.addColorStop(0, css(pal.leaf)); gr.addColorStop(1, css(pal.leaf2));
  g.fillStyle = gr; g.fill(); outline(g, pal.dark, 1.6);
  g.save(); g.clip();
  g.fillStyle = css(pal.leaf2, 0.5);
  for (let y = hy + 14; y < B.y + B.h; y += 14) for (let x = B.x + ((y / 14) % 2) * 9; x < B.x + B.w; x += 18) { g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
  g.restore();
  // папоротники по бокам
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx + sx * 108, B.y + B.h - 10); g.scale(sx, 1); g.rotate(-0.15);
    fern(g, 130, pal.leaf, pal.leaf2, -0.45, pal.dark); g.restore();
    g.save(); g.translate(cx + sx * 80, B.y + B.h - 6); g.scale(sx, 1); g.rotate(0.35);
    fern(g, 80, lighten(pal.leaf, 0.12), pal.leaf2, -0.4, pal.dark); g.restore();
  }
  // гнездо с яйцами
  const ny = B.y + B.h - 78;
  g.beginPath(); g.ellipse(cx, ny + 22, 60, 17, 0, 0, TAU); g.fillStyle = css(pal.rock); g.fill(); outline(g, pal.dark, 1.4);
  const eggs = rng.int(3, 5);
  for (let i = 0; i < eggs; i++) {
    const x = cx + (i - (eggs - 1) / 2) * 30, y = ny + 8 + (i % 2) * 4;
    g.save(); g.translate(x, y);
    if (i === 1) hatchling(g, 13, 17, pal, pal.baby, rng);
    else egg(g, 12, 16, pal, pal.egg, i % 2 ? pal.accent2 : pal.leaf, rng);
    g.restore();
  }
  g.beginPath(); g.ellipse(cx, ny + 30, 66, 14, 0, 0, Math.PI); g.fillStyle = css(darken(pal.rock, 0.1)); g.fill(); outline(g, pal.dark, 1.2);
  // малыши
  const cv = rng.shuffle([pal.baby, pal.baby2, pal.leaf, pal.accent2]);
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx + sx * 90, B.y + B.h - 40); g.scale(-sx, 1);
    baby(g, 34, sx > 0 ? cv[0] : cv[1], pal.ink, pal.accent2, pal.dark, pal.accent2); g.restore();
  }
  // следы
  for (let i = 0; i < 5; i++) {
    g.save(); g.translate(B.x + 26 + i * 10, hy + 38 + (i % 2) * 14 - i * 3); g.rotate(-0.5 + (i % 2) * 0.3);
    footprint(g, 8, pal.leaf2, 0.8); g.restore();
  }
}

function compTrail(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2;
  const fl = rng.chance(0.5) ? 1 : -1;
  const mid = [rng.int(0, 2), rng.int(0, 2)];
  const cols = rng.shuffle([pal.baby, pal.baby2, pal.leaf, pal.accent2]);
  // папоротники по краям (зеркально)
  mirrorX(g, cx, (q) => {
    for (const [y, a, L] of [[B.y + B.h - 2, -0.1, 150], [B.y + 2, Math.PI + 0.1, 150]]) {
      q.save(); q.translate(B.w / 2 - 12, y); q.rotate(a); fern(q, L, pal.leaf, pal.leaf2, -0.35, pal.dark); q.restore();
      q.save(); q.translate(B.w / 2 - 34, y); q.rotate(a + (a < 1 ? 0.45 : -0.45)); fern(q, L * 0.62, lighten(pal.leaf, 0.12), pal.leaf2, -0.3, pal.dark); q.restore();
    }
  });
  // две пары малышей, смотрят друг на друга
  for (const [y, k] of [[B.y + 68, 0], [B.y + B.h - 52, 1]]) {
    mirrorX(g, cx, (q) => {
      q.save(); q.translate(58, y); q.scale(-1, 1);
      baby(q, 36, cols[k], pal.ink, pal.accent2, pal.dark, pal.accent2); q.restore();
    });
    g.save(); g.translate(cx, y + 4);
    if (mid[k] === 0) egg(g, 12, 16, pal, pal.egg, pal.accent2, rng); else if (mid[k] === 1) bonesX(g, 26, 5.5, pal); else { sun(g, 0, 0, 9, pal); }
    g.restore();
  }
  // тропа следов между медальоном и парами
  for (const [y0, y1] of [[B.y + 104, cy - 100], [cy + 100, B.y + B.h - 92]]) {
    const n = 3;
    for (let k = 0; k < n; k++) {
      const y = y0 + ((k + 0.5) / n) * (y1 - y0);
      g.save(); g.translate(cx + (k % 2 ? 11 : -11) * fl, y); g.rotate(Math.PI + (k % 2 ? 0.2 : -0.2));
      footprint(g, 15, mix(pal.field2, pal.dark, 0.55), 0.95); g.restore();
    }
  }
  // медальон-яйцо
  const R = 84;
  g.save(); g.translate(cx, cy);
  g.beginPath(); for (let i = 0; i <= 160; i++) { const a = i / 160 * TAU, r = R * (1 + 0.06 * Math.cos(a * 14)); i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); }
  g.closePath(); g.fillStyle = css(pal.border); g.fill(); outline(g, pal.dark, 2);
  g.beginPath(); g.arc(0, 0, R * 0.88, 0, TAU); g.fillStyle = css(pal.accent); g.fill(); outline(g, pal.dark, 1.4);
  g.beginPath(); g.arc(0, 0, R * 0.72, 0, TAU); g.fillStyle = css(mix(pal.field, pal.dark, 0.3)); g.fill(); outline(g, pal.dark, 1.2);
  // лучи-листья внутри
  for (let i = 0; i < 16; i++) { g.save(); g.rotate(i * TAU / 16); petalPath(g, R * 0.7, R * 0.07); g.fillStyle = css(mix(pal.field, pal.leaf, 0.25), 0.7); g.fill(); g.restore(); }
  for (let i = 0; i < 14; i++) {
    g.save(); g.rotate(i * TAU / 14); g.translate(0, -R * 0.8);
    if (i % 2) { petalPath(g, 14, 4.4); g.fillStyle = css(pal.leaf); g.fill(); outline(g, pal.dark, 0.8); }
    else { g.beginPath(); g.arc(0, -3, 3.4, 0, TAU); g.fillStyle = css(pal.accent2); g.fill(); outline(g, pal.dark, 0.8); }
    g.restore();
  }
  g.translate(0, 12); hatchling(g, 32, 42, pal, pal.baby, rng);
  g.restore();
}

function compParade(g, rng, pal, B) {
  const cx = CW / 2;
  // арка-солнце
  g.beginPath(); g.arc(cx, B.y + B.h * 0.5, 100, 0, TAU);
  g.fillStyle = css(mix(pal.field, pal.accent, 0.35), 0.8); g.fill();
  g.lineWidth = 2; g.setLineDash([5, 5]); g.strokeStyle = css(pal.dark, 0.5); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.arc(cx, B.y + B.h * 0.5, 78, 0, TAU); g.fillStyle = css(mix(pal.field, pal.accent, 0.55), 0.7); g.fill();
  const vsx = rng.chance(0.5) ? -1 : 1;
  g.save(); g.translate(cx + vsx * 62, B.y + B.h * 0.5); smoke(g, 0, -92, 6, pal, 5, rng); volcano(g, 120, 90, pal, pal.accent2); g.restore();
  // высокие папоротники, зеркально
  mirrorX(g, cx, (q) => {
    q.save(); q.translate(88, B.y + B.h - 4); q.rotate(0.05); fern(q, 220, pal.leaf, pal.leaf2, -0.25, pal.dark); q.restore();
    q.save(); q.translate(60, B.y + B.h - 4); q.rotate(0.45); fern(q, 130, lighten(pal.leaf, 0.1), pal.leaf2, -0.3, pal.dark); q.restore();
    for (let i = 0; i < 2; i++) pteranodon(q, 78 - i * 16, B.y + 28 + i * 24, 10 - i * 2, pal.dark, pal.ink);
  });
  // диплодок
  const df = rng.chance(0.5) ? -1 : 1;
  g.save(); g.translate(cx + df * 0.15 * 125, B.y + B.h * 0.66); g.scale(df, 1); longneck(g, 125, pal.baby, pal.ink, pal.accent, pal.dark); g.restore();
  // кости сверху
  g.save(); g.translate(cx, B.y + 24); bonesX(g, 34, 6.5, pal); g.restore();
  // яйца в ряд
  const n = 5;
  for (let i = 0; i < n; i++) {
    g.save(); g.translate(cx + (i - (n - 1) / 2) * 38, B.y + B.h - 36 + (i % 2) * 5);
    if (i === 2) hatchling(g, 14, 18, pal, pal.baby2, rng); else egg(g, 13, 17, pal, pal.egg, [pal.accent2, pal.leaf2, pal.accent][i % 3], rng);
    g.restore();
  }
  // следы
  for (let i = 0; i < 4; i++) {
    g.save(); g.translate(cx + (i % 2 ? 22 : -22), B.y + B.h * 0.84 - i * 0 + 0); g.restore();
  }
}

export default {
  id: 'dino',
  name: 'Динозавры',
  paint(g, rng0) {
    const rng = new RNG(hashString(rng0.s + ':dino'));
    const pal = pickPalette(rng, PALS);
    const variant = rng.int(0, 2);
    const inset = border(g, pal, rng, variant);
    const B = { x: inset, y: inset, w: CW - 2 * inset, h: CH - 2 * inset };
    const gr = g.createRadialGradient(CW / 2, CH / 2, 20, CW / 2, CH / 2, 300);
    gr.addColorStop(0, css(lighten(pal.field, 0.12))); gr.addColorStop(1, css(darken(pal.field, 0.1)));
    g.fillStyle = gr; g.fillRect(B.x, B.y, B.w, B.h);
    g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
    scatter(g, rng.fork('bg'), B.x, B.y, B.w, B.h, pal);
    const comp = [compVolcanoFull, compTrail, compParade][variant];
    comp(g, rng.fork('comp'), pal, B);
    g.restore();
    g.strokeStyle = css(pal.dark); g.lineWidth = 2; g.strokeRect(B.x - 1, B.y - 1, B.w + 2, B.h + 2);
    return { edge: pal.edge, fringe: mix(pal.ink, pal.accent, 0.3) };
  },
};
