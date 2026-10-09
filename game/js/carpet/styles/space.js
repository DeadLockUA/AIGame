// Космический ковёр: туманности, звёзды, планеты с кольцами, ракета, орбиты, кайма из звёзд и спутников.
import { CW, CH, css, darken, lighten, mix, pickPalette, star, quad, mirrorX, RNG } from '../kit.js';

const PALS = [
  { bg1: [16, 20, 78], bg2: [58, 22, 104], neb: [[130, 70, 220], [40, 130, 230], [230, 80, 170]], accent: [255, 214, 120], band: [10, 12, 48], edge: [12, 14, 52] },
  { bg1: [6, 36, 58], bg2: [22, 12, 70], neb: [[30, 200, 190], [100, 90, 230], [240, 120, 200]], accent: [150, 255, 232], band: [4, 20, 36], edge: [6, 22, 40] },
  { bg1: [70, 14, 82], bg2: [20, 8, 56], neb: [[250, 70, 170], [255, 150, 70], [120, 70, 230]], accent: [255, 206, 226], band: [38, 8, 46], edge: [40, 8, 48] },
  { bg1: [12, 16, 46], bg2: [84, 24, 70], neb: [[255, 130, 60], [190, 56, 130], [70, 100, 230]], accent: [255, 196, 110], band: [8, 10, 30], edge: [10, 12, 32] },
  { bg1: [8, 32, 46], bg2: [14, 12, 62], neb: [[70, 235, 150], [50, 150, 230], [170, 90, 230]], accent: [186, 255, 176], band: [4, 20, 28], edge: [6, 22, 30] },
  { bg1: [30, 20, 90], bg2: [8, 40, 80], neb: [[255, 96, 120], [90, 170, 255], [190, 120, 255]], accent: [255, 232, 150], band: [16, 10, 56], edge: [18, 12, 58] },
];
const PLANET_COLS = [[244, 150, 84], [226, 92, 96], [92, 184, 226], [150, 224, 156], [204, 154, 244], [252, 214, 104], [240, 120, 180], [120, 130, 240]];

const C = (c, a) => css(c, a);
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };

function sparkle(g, x, y, r, col, a = 1, k = 0.14) {
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x + r * k, y - r * k, x + r, y);
  g.quadraticCurveTo(x + r * k, y + r * k, x, y + r);
  g.quadraticCurveTo(x - r * k, y + r * k, x - r, y);
  g.quadraticCurveTo(x - r * k, y - r * k, x, y - r);
  g.closePath(); g.fillStyle = C(col, a); g.fill();
}

function glow(g, x, y, r, col, a = 0.5) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, C(col, a)); gr.addColorStop(1, C(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ---------- небесные тела ---------- */
function planet(g, x, y, r, col, o = {}) {
  const { ring = false, tilt = -0.35, bands = 0, craters = 0, rng = null, ringCol = null, moonRing = false } = o;
  g.save(); g.translate(x, y);
  glow(g, 0, 0, r * 1.9, col, 0.22);
  const drawRing = (front) => {
    g.save(); g.rotate(tilt); g.scale(1, 0.28);
    const rc = ringCol || lighten(col, 0.4);
    for (const [rr, w, a] of [[1.85, r * 0.22, 0.95], [1.55, r * 0.1, 0.8]]) {
      g.beginPath();
      if (front) g.arc(0, 0, r * rr, 0, Math.PI); else g.arc(0, 0, r * rr, Math.PI, Math.PI * 2);
      g.lineWidth = w; g.strokeStyle = C(rr > 1.7 ? rc : darken(rc, 0.25), a); g.stroke();
    }
    g.restore();
  };
  if (ring) drawRing(false);
  // шар
  const gr = g.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  gr.addColorStop(0, C(lighten(col, 0.45))); gr.addColorStop(0.5, C(col)); gr.addColorStop(1, C(darken(col, 0.45)));
  circ(g, 0, 0, r); g.fillStyle = gr; g.fill();
  g.save(); circ(g, 0, 0, r); g.clip();
  for (let i = 0; i < bands; i++) {
    const yy = -r + ((i + 0.5) / bands) * r * 2;
    g.fillStyle = C(i % 2 ? darken(col, 0.25) : lighten(col, 0.3), 0.38);
    g.save(); g.rotate(tilt * 0.5);
    g.beginPath(); g.moveTo(-r * 1.2, yy - r * 0.07);
    g.quadraticCurveTo(0, yy + r * 0.12, r * 1.2, yy - r * 0.07); g.lineTo(r * 1.2, yy + r * 0.07);
    g.quadraticCurveTo(0, yy + r * 0.28, -r * 1.2, yy + r * 0.07); g.fill(); g.restore();
  }
  if (craters && rng) for (let i = 0; i < craters; i++) {
    const a = rng.range(0, 6.28), d = Math.sqrt(rng.next()) * r * 0.75, cr = r * rng.range(0.08, 0.18);
    const cx = Math.cos(a) * d, cy = Math.sin(a) * d;
    circ(g, cx, cy, cr); g.fillStyle = C(darken(col, 0.4), 0.45); g.fill();
    circ(g, cx - cr * 0.15, cy - cr * 0.15, cr * 0.8); g.fillStyle = C(darken(col, 0.15), 0.5); g.fill();
  }
  // терминатор
  const sh = g.createRadialGradient(-r * 0.5, -r * 0.5, r * 0.6, -r * 0.3, -r * 0.3, r * 1.5);
  sh.addColorStop(0, 'rgba(0,0,10,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.4)');
  g.fillStyle = sh; g.fillRect(-r, -r, r * 2, r * 2);
  g.restore();
  circ(g, 0, 0, r); g.lineWidth = 1; g.strokeStyle = C(lighten(col, 0.5), 0.5); g.stroke();
  if (ring) drawRing(true);
  g.restore();
}

function sun(g, x, y, r, col) {
  glow(g, x, y, r * 3.4, col, 0.55);
  g.save(); g.translate(x, y);
  star(g, 0, 0, r * 1.7, r * 1.15, 14, 0); g.fillStyle = C(lighten(col, 0.1), 0.9); g.fill();
  star(g, 0, 0, r * 1.35, r * 1.02, 14, Math.PI / 14); g.fillStyle = C(lighten(col, 0.4)); g.fill();
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
  gr.addColorStop(0, C([255, 255, 230])); gr.addColorStop(1, C(col));
  circ(g, 0, 0, r); g.fillStyle = gr; g.fill();
  g.lineWidth = 1.2; g.strokeStyle = C(darken(col, 0.3), 0.7); g.stroke();
  g.restore();
}

function rocket(g, s, pal, body = [244, 244, 250], tip = [226, 60, 70]) {
  // рисуется вверх, центр в (0,0), высота ~ 2.6 s
  g.save();
  // пламя
  const fl = g.createLinearGradient(0, s * 1.1, 0, s * 2.6);
  fl.addColorStop(0, C([255, 240, 150])); fl.addColorStop(0.5, C([255, 150, 50])); fl.addColorStop(1, C([255, 60, 40], 0));
  g.beginPath(); g.moveTo(-s * 0.4, s * 1.1); g.quadraticCurveTo(-s * 0.5, s * 2, 0, s * 2.7); g.quadraticCurveTo(s * 0.5, s * 2, s * 0.4, s * 1.1); g.closePath();
  g.fillStyle = fl; g.fill();
  g.beginPath(); g.moveTo(-s * 0.2, s * 1.1); g.quadraticCurveTo(-s * 0.25, s * 1.6, 0, s * 1.95); g.quadraticCurveTo(s * 0.25, s * 1.6, s * 0.2, s * 1.1); g.closePath();
  g.fillStyle = C([255, 255, 220], 0.9); g.fill();
  // плавники
  for (const sx of [-1, 1]) {
    g.save(); g.scale(sx, 1);
    g.beginPath(); g.moveTo(s * 0.5, s * 0.3); g.quadraticCurveTo(s * 1.2, s * 0.6, s * 1.15, s * 1.3);
    g.lineTo(s * 0.55, s * 1.1); g.closePath();
    g.fillStyle = C(tip); g.fill(); g.lineWidth = 1.2; g.strokeStyle = C(darken(tip, 0.5)); g.stroke();
    g.restore();
  }
  // корпус
  g.beginPath(); g.moveTo(0, -s * 1.6);
  g.bezierCurveTo(s * 0.85, -s * 0.8, s * 0.7, s * 0.5, s * 0.55, s * 1.15);
  g.lineTo(-s * 0.55, s * 1.15);
  g.bezierCurveTo(-s * 0.7, s * 0.5, -s * 0.85, -s * 0.8, 0, -s * 1.6); g.closePath();
  const bg = g.createLinearGradient(-s * 0.7, 0, s * 0.7, 0);
  bg.addColorStop(0, C(darken(body, 0.2))); bg.addColorStop(0.35, C(lighten(body, 0.1))); bg.addColorStop(1, C(darken(body, 0.28)));
  g.fillStyle = bg; g.fill(); g.lineWidth = 1.3; g.strokeStyle = C(darken(body, 0.55)); g.stroke();
  // носовой конус
  g.save(); g.beginPath(); g.moveTo(0, -s * 1.6);
  g.bezierCurveTo(s * 0.85, -s * 0.8, s * 0.7, s * 0.5, s * 0.55, s * 1.15); g.lineTo(-s * 0.55, s * 1.15);
  g.bezierCurveTo(-s * 0.7, s * 0.5, -s * 0.85, -s * 0.8, 0, -s * 1.6); g.clip();
  g.fillStyle = C(tip); g.beginPath(); g.moveTo(-s, -s * 0.85); g.quadraticCurveTo(0, -s * 0.6, s, -s * 0.85); g.lineTo(s, -s * 2); g.lineTo(-s, -s * 2); g.fill();
  g.fillStyle = C(tip); g.fillRect(-s, s * 0.82, s * 2, s * 0.33);
  g.restore();
  // иллюминатор
  circ(g, 0, -s * 0.2, s * 0.36); g.fillStyle = C([60, 70, 110]); g.fill();
  g.lineWidth = s * 0.12; g.strokeStyle = C([190, 196, 214]); g.stroke();
  circ(g, 0, -s * 0.2, s * 0.24); g.fillStyle = C([110, 200, 255]); g.fill();
  g.fillStyle = C([255, 255, 255], 0.7); g.beginPath(); g.ellipse(-s * 0.08, -s * 0.3, s * 0.07, s * 0.1, 0.5, 0, 6.3); g.fill();
  g.restore();
}

function ufo(g, s, pal) {
  g.save();
  g.beginPath(); g.ellipse(0, -s * 0.2, s * 0.55, s * 0.5, 0, Math.PI, Math.PI * 2);
  g.fillStyle = C([140, 240, 200], 0.85); g.fill(); g.lineWidth = 1; g.strokeStyle = C([40, 120, 100]); g.stroke();
  g.beginPath(); g.ellipse(0, 0, s * 1.4, s * 0.42, 0, 0, 6.3);
  const gr = g.createLinearGradient(0, -s * 0.4, 0, s * 0.4); gr.addColorStop(0, C([220, 224, 240])); gr.addColorStop(1, C([110, 116, 150]));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1.2; g.strokeStyle = C([40, 44, 80]); g.stroke();
  for (let i = -2; i <= 2; i++) { circ(g, i * s * 0.5, s * 0.08 + Math.abs(i) * 0.02 * s, s * 0.09); g.fillStyle = C(i % 2 ? [255, 220, 90] : [255, 110, 130]); g.fill(); }
  g.restore();
}

function satellite(g, s, pal) {
  g.save();
  for (const sx of [-1, 1]) {
    g.save(); g.scale(sx, 1);
    g.fillStyle = C([60, 110, 200]); g.fillRect(s * 0.45, -s * 0.28, s * 0.9, s * 0.56);
    g.strokeStyle = C([160, 200, 255], 0.9); g.lineWidth = 0.8; g.strokeRect(s * 0.45, -s * 0.28, s * 0.9, s * 0.56);
    g.beginPath(); for (let i = 1; i < 3; i++) { g.moveTo(s * (0.45 + i * 0.3), -s * 0.28); g.lineTo(s * (0.45 + i * 0.3), s * 0.28); } g.moveTo(s * 0.45, 0); g.lineTo(s * 1.35, 0); g.stroke();
    g.restore();
  }
  g.beginPath(); g.roundRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8, s * 0.12);
  g.fillStyle = C([236, 200, 90]); g.fill(); g.lineWidth = 1; g.strokeStyle = C([120, 84, 20]); g.stroke();
  circ(g, 0, 0, s * 0.18); g.fillStyle = C([40, 50, 90]); g.fill();
  g.beginPath(); g.moveTo(0, -s * 0.4); g.lineTo(0, -s * 0.8); g.strokeStyle = C([220, 220, 230]); g.stroke(); circ(g, 0, -s * 0.85, s * 0.08); g.fillStyle = C([255, 100, 100]); g.fill();
  g.restore();
}

function moon(g, x, y, r, col, rng) {
  glow(g, x, y, r * 2.2, col, 0.25);
  planet(g, x, y, r, col, { craters: 7, rng });
}

function comet(g, x, y, len, ang, col) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(0, 0, -len, 0);
  gr.addColorStop(0, C(col, 0.95)); gr.addColorStop(1, C(col, 0));
  g.beginPath(); g.moveTo(0, -len * 0.06); g.lineTo(-len, 0); g.lineTo(0, len * 0.06); g.closePath(); g.fillStyle = gr; g.fill();
  glow(g, 0, 0, len * 0.15, col, 0.8);
  circ(g, 0, 0, len * 0.04); g.fillStyle = C([255, 255, 255]); g.fill();
  g.restore();
}

/* ---------- фон ---------- */
function background(g, pal, rng) {
  const gr = g.createLinearGradient(0, 0, CW * 0.3, CH);
  gr.addColorStop(0, C(pal.bg1)); gr.addColorStop(1, C(pal.bg2));
  g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
  // туманности
  g.save(); g.globalCompositeOperation = 'lighter';
  const n = rng.int(4, 6);
  for (let i = 0; i < n; i++) {
    const col = pal.neb[i % 3];
    const x = rng.range(20, CW - 20), y = rng.range(40, CH - 40), r = rng.range(90, 190);
    for (let k = 0; k < 3; k++) glow(g, x + rng.range(-40, 40), y + rng.range(-40, 40), r * rng.range(0.5, 1), col, 0.34);
  }
  g.restore();
  // млечный путь
  const a = rng.range(-0.7, 0.7) + Math.PI / 2, mx = CW / 2 + rng.range(-40, 40), my = CH / 2 + rng.range(-60, 60);
  for (let i = 0; i < 260; i++) {
    const t = rng.range(-340, 340), off = rng.gauss() * 26;
    const x = mx + Math.cos(a) * t - Math.sin(a) * off, y = my + Math.sin(a) * t + Math.cos(a) * off;
    g.fillStyle = C(mix([255, 255, 255], pal.neb[1], rng.next() * 0.5), rng.range(0.15, 0.6));
    circ(g, x, y, rng.range(0.3, 0.9)); g.fill();
  }
  // звёзды
  for (let i = 0; i < 170; i++) {
    const x = rng.range(0, CW), y = rng.range(0, CH), r = rng.range(0.35, 1.2);
    g.fillStyle = C(rng.chance(0.2) ? pal.accent : [255, 255, 255], rng.range(0.4, 1));
    circ(g, x, y, r); g.fill();
  }
  for (let i = 0; i < 26; i++) {
    const x = rng.range(10, CW - 10), y = rng.range(10, CH - 10), r = rng.range(2.5, 5.5);
    glow(g, x, y, r * 3, pal.accent, 0.35);
    sparkle(g, x, y, r * 1.8, [255, 255, 255], 0.95, 0.1);
    circ(g, x, y, r * 0.35); g.fillStyle = C([255, 255, 255]); g.fill();
  }
}

/* ---------- кайма ---------- */
function border(g, pal, rng, motif) {
  const bg = g.createLinearGradient(0, 0, 0, CH);
  bg.addColorStop(0, C(pal.band)); bg.addColorStop(1, C(mix(pal.band, pal.bg2, 0.4)));
  g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
  // мелкие звёзды в кайме
  for (let i = 0; i < 220; i++) {
    g.fillStyle = C([255, 255, 255], rng.range(0.15, 0.6)); circ(g, rng.range(0, CW), rng.range(0, CH), rng.range(0.3, 0.8)); g.fill();
  }
  const lines = [[6, 1.4, pal.accent, 0.9], [9.5, 0.8, pal.accent, 0.6], [33, 0.8, pal.accent, 0.6], [36, 1.6, pal.accent, 0.95]];
  for (const [o, w, c, a] of lines) { g.strokeStyle = C(c, a); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); }
  // мотив
  const x0 = 21, y0 = 21, W = CW - 42, H = CH - 42;
  const step = 30;
  const items = [];
  const nW = Math.round(W / step), nH = Math.round(H / step);
  for (let i = 0; i < nW; i++) items.push([x0 + (W * i) / nW, y0, i]);
  for (let i = 0; i < nH; i++) items.push([x0 + W, y0 + (H * i) / nH, i]);
  for (let i = 0; i < nW; i++) items.push([x0 + W - (W * i) / nW, y0 + H, i]);
  for (let i = 0; i < nH; i++) items.push([x0, y0 + H - (H * i) / nH, i]);
  const cols = [[244, 150, 84], [92, 184, 226], [226, 92, 96], [150, 224, 156]];
  items.forEach(([x, y, i], idx) => {
    if (i === 0) return; // углы позже
    if (i % 2 === 0) { glow(g, x, y, 11, pal.accent, 0.35); sparkle(g, x, y, 8.5, pal.accent, 1, 0.16); }
    else if (motif === 0) { planet(g, x, y, 5.2, cols[(idx >> 1) % 4], { ring: (idx >> 1) % 2 === 0, tilt: -0.5 }); }
    else if (motif === 1) { g.save(); g.translate(x, y); g.rotate((idx % 4) * 0.3); satellite(g, 4.6, pal); g.restore(); }
    else { // полумесяц
      circ(g, x, y, 5.5); g.fillStyle = C([250, 238, 190]); g.fill();
      circ(g, x + 2.4, y - 1.4, 5); g.fillStyle = C(pal.band); g.fill();
    }
  });
  for (const [x, y, c] of [[x0, y0, 0], [x0 + W, y0, 1], [x0 + W, y0 + H, 2], [x0, y0 + H, 3]]) {
    circ(g, x, y, 16); g.fillStyle = C(pal.band); g.fill();
    g.lineWidth = 1.4; g.strokeStyle = C(pal.accent); g.stroke();
    planet(g, x, y, 9.5, cols[c], { ring: true, tilt: c % 2 ? 0.5 : -0.5, bands: 3 });
  }
  return 41;
}

/* ---------- композиции ---------- */
function orbitEllipse(g, cx, cy, rx, ry, rot, col) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.setLineDash([5, 5]); g.lineWidth = 1.1; g.strokeStyle = C(col, 0.7);
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.stroke();
  g.setLineDash([]); g.restore();
}
function onOrbit(cx, cy, rx, ry, rot, t) {
  const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
  return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
}

function constellation(g, rng, pal, pts) {
  g.strokeStyle = C(pal.accent, 0.55); g.lineWidth = 0.9; g.setLineDash([2, 3]);
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]);
  for (const [x, y] of pts) { glow(g, x, y, 8, pal.accent, 0.5); sparkle(g, x, y, 5, [255, 255, 255], 1, 0.15); }
}

function compSolar(g, pal, rng, fx) {
  const cx = rng.range(165, 195), cy = rng.range(200, 240);
  const rot = rng.range(-0.3, 0.3);
  sun(g, cx, cy, 28, pal.accent);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const rx = 56 + i * 27, ry = rx * 0.66;
    orbitEllipse(g, cx, cy, rx, ry, rot, pal.accent);
  }
  const shuf = rng.shuffle(PLANET_COLS);
  for (let i = 0; i < n; i++) {
    const rx = 56 + i * 27, ry = rx * 0.66;
    const [x, y] = onOrbit(cx, cy, rx, ry, rot, rng.range(0, 6.28));
    planet(g, x, y, 10 + (i % 3) * 4, shuf[i], { ring: i === 2 || i === n - 1, bands: i % 2 ? 4 : 0, craters: i % 2 ? 0 : 3, rng });
  }
  g.save(); g.translate(rng.range(240, 280), rng.range(400, 450)); g.rotate(0.55);
  rocket(g, 15, pal); g.restore();
  comet(g, 60, 90, 70, 0.6, [255, 255, 255]);
  constellation(g, rng, pal, [[60, 400], [90, 380], [120, 410], [150, 395], [170, 440]]);
  g.save(); g.translate(rng.range(70, 100), rng.range(470, 480)); g.rotate(-0.15); ufo(g, 13, pal); g.restore();
}

function compGiant(g, pal, rng) {
  const cx = rng.range(170, 200), cy = rng.range(300, 340);
  orbitEllipse(g, cx, cy, 124, 48, -0.3, pal.accent);
  planet(g, cx, cy, 66, rng.pick(PLANET_COLS), { ring: true, tilt: -0.3, bands: 7, rng });
  const [mx, my] = onOrbit(cx, cy, 124, 48, -0.3, 4.2);
  moon(g, mx, my, 15, [220, 220, 232], rng);
  g.save(); g.translate(120, 130); g.rotate(-0.4); rocket(g, 20, pal); g.restore();
  planet(g, 280, 110, 22, rng.pick(PLANET_COLS), { bands: 4, rng });
  planet(g, 70, 460, 14, rng.pick(PLANET_COLS), { craters: 4, rng });
  planet(g, 300, 470, 11, rng.pick(PLANET_COLS), { ring: true, rng });
  constellation(g, rng, pal, [[240, 170], [270, 190], [300, 175], [310, 215]]);
  comet(g, 300, 380, 60, 2.6, [255, 255, 255]);
  g.save(); g.translate(75, 235); g.rotate(0.1); satellite(g, 11, pal); g.restore();
}

function compMirror(g, pal, rng) {
  const cx = CW / 2;
  const cols = rng.shuffle(PLANET_COLS);
  // центральная ракета
  orbitEllipse(g, cx, 270, 112, 190, 0, pal.accent);
  orbitEllipse(g, cx, 270, 76, 140, 0, pal.accent);
  g.save(); g.translate(cx, 250); rocket(g, 34, pal); g.restore();
  glow(g, cx, 140, 70, pal.neb[0], 0.5);
  const sub = rng.fork('m');
  const seed = sub.s;
  mirrorX(g, cx, (q) => {
    const r = new RNG(seed);
    planet(q, 70, 120, 24, cols[0], { ring: true, tilt: -0.4, bands: 4, rng: r });
    planet(q, 56, 400, 18, cols[1], { bands: 3, rng: r });
    planet(q, 96, 470, 9, cols[2], { rng: r });
    planet(q, 112, 220, 8, cols[3], { craters: 2, rng: r });
    sparkle(q, 52, 270, 12, pal.accent, 0.9);
    sparkle(q, 100, 340, 8, [255, 255, 255], 0.9);
    sparkle(q, 90, 66, 8, [255, 255, 255], 0.9);
    comet(q, 130, 56, 38, 0.5, [255, 255, 255]);
  });
  moon(g, cx, 80, 18, [226, 226, 236], rng);
  g.save(); g.translate(cx, 455); ufo(g, 16, pal); g.restore();
}

function compMoon(g, pal, rng) {
  const mx = rng.range(130, 230);
  planet(g, mx, 130, 74, [226, 224, 236], { craters: 12, rng });
  sun(g, 290, 440, 14, pal.accent);
  g.save(); g.translate(120, 300); g.rotate(rng.range(-0.8, -0.3)); rocket(g, 22, pal, [250, 240, 230], [70, 150, 230]); g.restore();
  g.save(); g.translate(260, 280); g.rotate(0.3); ufo(g, 20, pal); g.restore();
  const cols = rng.shuffle(PLANET_COLS);
  planet(g, 90, 440, 30, cols[0], { ring: true, bands: 5, rng });
  planet(g, 270, 360, 12, cols[1], { rng, craters: 3 });
  planet(g, 220, 480, 9, cols[2], { rng });
  planet(g, 60, 230, 10, cols[3], { bands: 3, rng });
  orbitEllipse(g, 290, 440, 36, 24, 0.3, pal.accent);
  const [ox, oy] = onOrbit(290, 440, 36, 24, 0.3, 1);
  planet(g, ox, oy, 5, cols[4], { rng });
  constellation(g, rng, pal, [[290, 80], [318, 110], [300, 150], [330, 180]]);
  comet(g, 50, 70, 60, 0.7, [255, 255, 255]);
  g.save(); g.translate(180, 400); g.rotate(0.2); satellite(g, 10, pal); g.restore();
}

export default {
  id: 'space',
  name: 'Космос',
  paint(g, rng) {
    const pal = pickPalette(rng.fork('pal'), PALS);
    const inset = border(g, pal, rng.fork('b'), rng.int(0, 2));
    g.save(); g.beginPath(); g.rect(inset, inset, CW - 2 * inset, CH - 2 * inset); g.clip();
    background(g, pal, rng.fork('bg'));
    const v = rng.int(0, 3);
    const r = rng.fork('c');
    if (v === 0) compSolar(g, pal, r); else if (v === 1) compGiant(g, pal, r); else if (v === 2) compMirror(g, pal, r); else compMoon(g, pal, r);
    g.restore();
    g.strokeStyle = C(pal.accent, 0.8); g.lineWidth = 1.2; g.strokeRect(inset, inset, CW - 2 * inset, CH - 2 * inset);
    return { edge: pal.edge, fringe: [214, 208, 232] };
  },
};
