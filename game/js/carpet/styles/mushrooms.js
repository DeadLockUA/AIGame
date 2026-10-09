// Грибной ковёр: мухоморы, лисички, боровики, папоротники, улитки, лесная подстилка и светлячки.
import { CW, CH, css, mix, darken, lighten, pickPalette, petalPath } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { floor: [38, 54, 34], floor2: [64, 88, 52], moss: [98, 140, 62], border: [22, 34, 24], line: [200, 170, 90], cap: [214, 48, 44], spot: [255, 250, 238], chant: [246, 176, 44], porc: [158, 96, 54], fern: [92, 170, 80], leaf1: [200, 120, 40], leaf2: [178, 70, 36], leaf3: [226, 170, 60], glow: [255, 240, 150], edge: [24, 40, 26] },
  { floor: [70, 46, 30], floor2: [108, 72, 42], moss: [128, 130, 56], border: [40, 26, 18], line: [226, 170, 80], cap: [226, 90, 40], spot: [255, 244, 220], chant: [250, 190, 60], porc: [170, 104, 56], fern: [130, 160, 60], leaf1: [214, 110, 34], leaf2: [166, 52, 34], leaf3: [232, 176, 56], glow: [255, 220, 130], edge: [44, 28, 18] },
  { floor: [18, 44, 54], floor2: [32, 80, 86], moss: [60, 150, 130], border: [10, 26, 34], line: [120, 220, 210], cap: [60, 190, 200], spot: [230, 255, 250], chant: [150, 230, 170], porc: [90, 130, 160], fern: [70, 190, 150], leaf1: [60, 160, 150], leaf2: [90, 120, 190], leaf3: [150, 220, 170], glow: [170, 255, 240], edge: [10, 30, 38] },
  { floor: [44, 30, 62], floor2: [78, 56, 104], moss: [110, 150, 110], border: [26, 16, 40], line: [214, 176, 120], cap: [190, 70, 170], spot: [255, 240, 250], chant: [250, 190, 90], porc: [140, 84, 110], fern: [100, 170, 110], leaf1: [196, 110, 60], leaf2: [150, 70, 130], leaf3: [226, 170, 90], glow: [255, 220, 255], edge: [28, 18, 44] },
  { floor: [74, 92, 60], floor2: [112, 134, 82], moss: [150, 180, 90], border: [40, 56, 38], line: [236, 214, 140], cap: [220, 70, 60], spot: [255, 252, 240], chant: [248, 190, 70], porc: [170, 112, 70], fern: [60, 150, 70], leaf1: [220, 140, 50], leaf2: [190, 90, 50], leaf3: [236, 196, 80], glow: [255, 250, 180], edge: [46, 62, 40] },
  { floor: [30, 50, 58], floor2: [56, 84, 80], moss: [120, 160, 90], border: [18, 32, 36], line: [210, 190, 120], cap: [236, 110, 70], spot: [255, 250, 236], chant: [250, 196, 80], porc: [150, 100, 64], fern: [90, 176, 110], leaf1: [210, 130, 56], leaf2: [170, 70, 50], leaf3: [230, 190, 90], glow: [255, 238, 160], edge: [18, 36, 40] },
];

const CREAM = [244, 232, 204];

function fillShade(g, a, b, x0, x1) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, css(a)); gr.addColorStop(1, css(b));
  return gr;
}

/** Мухомор: основание ножки в (x,y), высота h. */
function amanita(g, pal, x, y, h, tilt = 0, capCol = null, spotCol = null) {
  const cap = capCol || pal.cap, spot = spotCol || pal.spot;
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(h, h);
  g.lineJoin = 'round';
  // тень
  g.beginPath(); g.ellipse(0.04, 0.0, 0.34, 0.06, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill();
  // ножка
  g.beginPath(); g.moveTo(-0.2, 0); g.bezierCurveTo(-0.22, -0.08, -0.12, -0.1, -0.12, -0.22); g.lineTo(-0.1, -0.55); g.lineTo(0.1, -0.55); g.lineTo(0.12, -0.22);
  g.bezierCurveTo(0.12, -0.1, 0.22, -0.08, 0.2, 0); g.quadraticCurveTo(0, 0.05, -0.2, 0); g.closePath();
  g.fillStyle = fillShade(g, lighten(CREAM, 0.3), darken(CREAM, 0.22), -0.2, 0.2); g.fill();
  g.lineWidth = 0.014; g.strokeStyle = css(darken(CREAM, 0.5)); g.stroke();
  // пластинки и юбочка
  g.beginPath(); g.ellipse(0, -0.5, 0.48, 0.06, 0, 0, TAU); g.fillStyle = css(darken(CREAM, 0.1)); g.fill(); g.stroke();
  g.lineWidth = 0.008; g.strokeStyle = css(darken(CREAM, 0.4), 0.8);
  for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(i * 0.045, -0.5); g.lineTo(i * 0.06, -0.455 - Math.abs(i) * 0.0012); g.stroke(); }
  g.beginPath(); g.moveTo(-0.17, -0.4); g.quadraticCurveTo(0, -0.31, 0.17, -0.4); g.quadraticCurveTo(0, -0.43, -0.17, -0.4); g.closePath();
  g.fillStyle = css(lighten(CREAM, 0.25)); g.fill(); g.lineWidth = 0.014; g.strokeStyle = css(darken(CREAM, 0.5)); g.stroke();
  // шляпка
  const capPath = () => {
    g.beginPath(); g.moveTo(-0.52, -0.49); g.bezierCurveTo(-0.55, -0.9, -0.22, -1.04, 0, -1.04);
    g.bezierCurveTo(0.22, -1.04, 0.55, -0.9, 0.52, -0.49); g.quadraticCurveTo(0, -0.43, -0.52, -0.49); g.closePath();
  };
  capPath();
  const rg = g.createRadialGradient(-0.18, -0.85, 0.05, 0, -0.7, 0.62);
  rg.addColorStop(0, css(lighten(cap, 0.3))); rg.addColorStop(0.55, css(cap)); rg.addColorStop(1, css(darken(cap, 0.38)));
  g.fillStyle = rg; g.fill();
  g.save(); capPath(); g.clip();
  g.fillStyle = css(spot);
  for (const [sx, sy, sr] of [[-0.25, -0.9, 0.07], [0.12, -0.96, 0.06], [0.3, -0.78, 0.07], [-0.4, -0.7, 0.06], [0, -0.78, 0.085], [-0.14, -0.62, 0.05], [0.22, -0.6, 0.06], [-0.42, -0.55, 0.04], [0.43, -0.58, 0.04], [0.02, -0.56, 0.04]]) {
    g.beginPath(); g.ellipse(sx, sy, sr, sr * 0.8, 0, 0, TAU); g.fill();
  }
  g.restore();
  capPath(); g.lineWidth = 0.02; g.strokeStyle = css(darken(cap, 0.62)); g.stroke();
  g.beginPath(); g.arc(-0.05, -0.62, 0.38, Math.PI * 1.12, Math.PI * 1.38); g.lineCap = 'round'; g.lineWidth = 0.03; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke();
  g.restore();
}

function chanterelle(g, pal, x, y, h, tilt = 0) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(h, h);
  g.lineJoin = 'round';
  g.beginPath(); g.ellipse(0.03, 0.0, 0.3, 0.05, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill();
  const rim = (rx, ry, cy, amp) => {
    g.beginPath();
    for (let i = 0; i <= 56; i++) {
      const a = (i / 56) * TAU, w = 1 + amp * Math.sin(a * 7 + 0.5);
      const px = Math.cos(a) * rx * w, py = cy + Math.sin(a) * ry * w;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
  };
  // воронка
  g.beginPath(); g.moveTo(-0.46, -0.66); g.bezierCurveTo(-0.34, -0.3, -0.1, -0.2, -0.1, 0); g.lineTo(0.1, 0);
  g.bezierCurveTo(0.1, -0.2, 0.34, -0.3, 0.46, -0.66); g.closePath();
  g.fillStyle = fillShade(g, lighten(pal.chant, 0.2), darken(pal.chant, 0.25), -0.45, 0.45); g.fill();
  g.lineWidth = 0.016; g.strokeStyle = css(darken(pal.chant, 0.55)); g.stroke();
  g.lineWidth = 0.012; g.strokeStyle = css(darken(pal.chant, 0.35), 0.8);
  for (const k of [-0.3, -0.15, 0, 0.15, 0.3]) { g.beginPath(); g.moveTo(k * 1.4, -0.62); g.quadraticCurveTo(k * 0.8, -0.35, k * 0.25, -0.02); g.stroke(); }
  rim(0.48, 0.12, -0.66, 0.07);
  g.fillStyle = css(lighten(pal.chant, 0.1)); g.fill(); g.lineWidth = 0.02; g.strokeStyle = css(darken(pal.chant, 0.55)); g.stroke();
  rim(0.34, 0.075, -0.66, 0.05);
  g.fillStyle = css(darken(pal.chant, 0.3)); g.fill();
  g.restore();
}

function porcini(g, pal, x, y, h, tilt = 0) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(h, h);
  g.lineJoin = 'round';
  g.beginPath(); g.ellipse(0.04, 0.0, 0.34, 0.06, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill();
  g.beginPath(); g.moveTo(-0.22, 0); g.bezierCurveTo(-0.3, -0.12, -0.2, -0.3, -0.15, -0.5); g.lineTo(0.15, -0.5); g.bezierCurveTo(0.2, -0.3, 0.3, -0.12, 0.22, 0); g.quadraticCurveTo(0, 0.05, -0.22, 0); g.closePath();
  g.fillStyle = fillShade(g, lighten(CREAM, 0.2), darken(CREAM, 0.28), -0.25, 0.25); g.fill();
  g.lineWidth = 0.016; g.strokeStyle = css(darken(CREAM, 0.55)); g.stroke();
  g.lineWidth = 0.01; g.strokeStyle = css(darken(CREAM, 0.35), 0.8);
  for (const [a, b] of [[-0.1, -0.05], [0.02, 0.1], [-0.16, -0.22], [0.12, 0.18]]) { g.beginPath(); g.moveTo(a, -0.04); g.quadraticCurveTo(a * 1.2, -0.25, b, -0.46); g.stroke(); }
  const cap = () => {
    g.beginPath(); g.moveTo(-0.56, -0.5); g.bezierCurveTo(-0.6, -0.92, -0.24, -1.02, 0, -1.02); g.bezierCurveTo(0.24, -1.02, 0.6, -0.92, 0.56, -0.5);
    g.quadraticCurveTo(0, -0.42, -0.56, -0.5); g.closePath();
  };
  cap();
  const rg = g.createRadialGradient(-0.2, -0.86, 0.04, 0, -0.7, 0.7);
  rg.addColorStop(0, css(lighten(pal.porc, 0.3))); rg.addColorStop(0.5, css(pal.porc)); rg.addColorStop(1, css(darken(pal.porc, 0.4)));
  g.fillStyle = rg; g.fill(); g.lineWidth = 0.02; g.strokeStyle = css(darken(pal.porc, 0.65)); g.stroke();
  g.save(); cap(); g.clip();
  g.fillStyle = css(lighten(CREAM, 0.1), 0.85); g.beginPath(); g.ellipse(0, -0.44, 0.58, 0.05, 0, 0, TAU); g.fill();
  g.fillStyle = css(darken(pal.porc, 0.3), 0.35);
  for (const [sx, sy, sr] of [[-0.25, -0.8, 0.05], [0.18, -0.85, 0.04], [0.32, -0.66, 0.045], [-0.4, -0.62, 0.035], [0.02, -0.7, 0.04]]) { g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill(); }
  g.restore();
  g.beginPath(); g.arc(-0.05, -0.62, 0.4, Math.PI * 1.12, Math.PI * 1.36); g.lineCap = 'round'; g.lineWidth = 0.03; g.strokeStyle = 'rgba(255,255,255,0.4)'; g.stroke();
  g.restore();
}

/** Папоротник: основание (x,y), длина len, направление rot (0 — вверх), curl — завиток. */
function fern(g, pal, x, y, len, rot, curl = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const N = 40, pts = [];
  let px = 0, py = 0, a = -Math.PI / 2;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([px, py, a, t]);
    a += curl * (0.01 + 0.09 * t * t * t * 2.2);
    px += Math.cos(a) * len / N; py += Math.sin(a) * len / N;
  }
  g.lineCap = 'round';
  g.strokeStyle = css(darken(pal.fern, 0.35)); g.lineWidth = Math.max(1, len * 0.025);
  g.beginPath(); pts.forEach(([qx, qy], i) => (i ? g.lineTo(qx, qy) : g.moveTo(qx, qy))); g.stroke();
  for (let i = 3; i < N; i += 2) {
    const [qx, qy, qa, t] = pts[i];
    const l = len * 0.3 * (1 - t * 0.85) * (t < 0.12 ? 0.6 : 1);
    for (const side of [-1, 1]) {
      g.save(); g.translate(qx, qy); g.rotate(qa + Math.PI / 2 + side * (Math.PI / 2 - 0.55 + 0.3 * t));
      petalPath(g, l, l * 0.2);
      g.fillStyle = css(i % 4 === 3 ? lighten(pal.fern, 0.12) : pal.fern); g.fill();
      g.lineWidth = Math.max(0.4, len * 0.008); g.strokeStyle = css(darken(pal.fern, 0.4)); g.stroke();
      g.restore();
    }
  }
  g.restore();
}

function snail(g, pal, x, y, s, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s); g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0.0, 0.0, 0.7, 0.07, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
  const body = [232, 206, 160];
  g.beginPath(); g.moveTo(-0.7, 0); g.quadraticCurveTo(-0.6, -0.16, -0.25, -0.2); g.lineTo(0.3, -0.2);
  g.quadraticCurveTo(0.5, -0.4, 0.58, -0.34); g.quadraticCurveTo(0.7, -0.24, 0.66, -0.1); g.quadraticCurveTo(0.7, 0.0, 0.56, 0.0); g.closePath();
  g.fillStyle = css(body); g.fill(); g.lineWidth = 0.02; g.strokeStyle = css(darken(body, 0.55)); g.stroke();
  for (const [ex, ey, ea] of [[0.5, -0.36, -0.5], [0.6, -0.33, 0.1]]) {
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.sin(ea) * 0.2, ey - 0.28 + Math.cos(ea) * 0.0); g.lineWidth = 0.025; g.stroke();
    g.beginPath(); g.arc(ex + Math.sin(ea) * 0.2, ey - 0.28, 0.035, 0, TAU); g.fillStyle = '#2a1a14'; g.fill();
  }
  g.beginPath(); g.arc(0.6, -0.17, 0.02, 0, TAU); g.fillStyle = '#2a1a14'; g.fill();
  const sh = [196, 134, 78];
  g.beginPath(); g.arc(-0.12, -0.4, 0.42, 0, TAU);
  const rg = g.createRadialGradient(-0.25, -0.55, 0.05, -0.12, -0.4, 0.46);
  rg.addColorStop(0, css(lighten(sh, 0.35))); rg.addColorStop(0.6, css(sh)); rg.addColorStop(1, css(darken(sh, 0.4)));
  g.fillStyle = rg; g.fill(); g.lineWidth = 0.025; g.strokeStyle = css(darken(sh, 0.6)); g.stroke();
  g.beginPath();
  for (let i = 0; i < 90; i++) { const a = i * 0.14, r = 0.03 + i * 0.0038; const px = -0.12 + Math.cos(a) * r, py = -0.4 + Math.sin(a) * r; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.lineWidth = 0.032; g.strokeStyle = css(darken(sh, 0.5)); g.stroke();
  g.restore();
}

function leaf(g, x, y, len, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot);
  petalPath(g, len, len * 0.34); g.fillStyle = css(col); g.fill();
  g.lineWidth = Math.max(0.5, len * 0.03); g.strokeStyle = css(darken(col, 0.45)); g.stroke();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len * 1.08);
  for (const k of [0.3, 0.5, 0.7]) { g.moveTo(0, -len * k); g.lineTo(len * 0.2, -len * (k + 0.1)); g.moveTo(0, -len * k); g.lineTo(-len * 0.2, -len * (k + 0.1)); }
  g.stroke();
  g.restore();
}

function firefly(g, x, y, r, pal) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, css(pal.glow, 0.9)); gr.addColorStop(0.2, css(pal.glow, 0.5)); gr.addColorStop(1, css(pal.glow, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.beginPath(); g.arc(x, y, r * 0.14, 0, TAU); g.fillStyle = '#fffbe0'; g.fill();
}

function glowBlob(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, css(col, a)); gr.addColorStop(1, css(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}

function forestFloor(g, pal, rng, fx, fy, fw, fh) {
  g.fillStyle = css(pal.floor); g.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < 9; i++) glowBlob(g, rng.range(fx, fx + fw), rng.range(fy, fy + fh), rng.range(60, 120), pal.floor2, 0.8);
  // мох
  for (let i = 0; i < 14; i++) {
    const x = rng.range(fx, fx + fw), y = rng.range(fy, fy + fh), n = rng.int(5, 9), r0 = rng.range(10, 20);
    for (let k = 0; k < n; k++) {
      g.beginPath(); g.arc(x + rng.range(-r0, r0), y + rng.range(-r0 * 0.6, r0 * 0.6), rng.range(4, 9), 0, TAU);
      g.fillStyle = css(rng.chance(0.5) ? pal.moss : darken(pal.moss, 0.2), 0.45); g.fill();
    }
  }
  // иголки и крапинки
  g.lineCap = 'round'; g.lineWidth = 1;
  for (let i = 0; i < 160; i++) {
    const x = rng.range(fx, fx + fw), y = rng.range(fy, fy + fh), a = rng.range(0, TAU), l = rng.range(3, 7);
    g.strokeStyle = css(rng.chance(0.5) ? lighten(pal.floor2, 0.25) : darken(pal.floor, 0.4), 0.55);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // опавшие листья
  for (let i = 0; i < 26; i++) {
    const c = rng.pick([pal.leaf1, pal.leaf2, pal.leaf3]);
    leaf(g, rng.range(fx, fx + fw), rng.range(fy, fy + fh), rng.range(12, 22), rng.range(0, TAU), mix(c, pal.floor, 0.35));
  }
}

function border(g, pal, rng) {
  g.fillStyle = css(pal.border); g.fillRect(0, 0, CW, CH);
  for (let y = 8; y < CH; y += 10) for (let x = 8 + ((y / 10) % 2) * 5; x < CW; x += 10) {
    if (x < 46 || x > CW - 46 || y < 46 || y > CH - 46) { g.beginPath(); g.arc(x, y, 1, 0, TAU); g.fillStyle = css(pal.moss, 0.25); g.fill(); }
  }
  const line = (o, w, c, a = 1) => { g.strokeStyle = css(c, a); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); };
  line(9, 2.2, pal.line); line(12.5, 1, pal.moss, 0.8); line(39.5, 1, pal.moss, 0.8); line(43, 2.2, pal.line);
  const c0 = 26, W = CW - 2 * c0, H = CH - 2 * c0, per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [c0 + t, c0, 0, 0, 1];
    t -= W; if (t < H) return [c0 + W, c0 + t, 1, -1, 0];
    t -= H; if (t < W) return [c0 + W - t, c0 + H, 2, 0, -1];
    t -= W; return [c0, c0 + H - t, 3, 1, 0];
  };
  // стебель-лоза с листьями
  g.strokeStyle = css(pal.fern, 0.9); g.lineWidth = 1.6; g.lineJoin = 'round'; g.beginPath();
  const NN = 700;
  for (let i = 0; i <= NN; i++) {
    const t = (i / NN) * per, [x, y, sd] = pt(t);
    const off = Math.sin((t / 30) * TAU) * 4;
    const nx = sd === 1 ? -1 : sd === 3 ? 1 : 0, ny = sd === 0 ? 1 : sd === 2 ? -1 : 0;
    const px = x + nx * off, py = y + ny * off;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.stroke();
  const sides = [[W, 0], [H, W], [W, W + H], [H, 2 * W + H]];
  const lr = rng.fork('bl');
  for (const [len, off0] of sides) {
    const m = 26, n = 2 * Math.round((len - 2 * m) / 56) + 1, step = (len - 2 * m) / (n - 1);
    for (let i = 0; i < n; i++) {
      const [x, y, sd] = pt(off0 + m + i * step);
      g.save(); g.translate(x, y); g.rotate(sd * Math.PI / 2 + Math.PI);
      if (i % 2 === 0) {
        // мини-гриб растёт к полю
        const k = (i / 2) % 3;
        g.translate(0, 12);
        if (k === 0) amanita(g, pal, 0, 0, 24, 0);
        else if (k === 1) chanterelle(g, pal, 0, 0, 22, 0);
        else porcini(g, pal, 0, 0, 22, 0);
      } else {
        g.translate(0, 2);
        for (const sgn of [-1, 1]) leaf(g, sgn * 3, 0, 11, sgn * 1.0 + Math.PI, mix(lr.pick([pal.leaf1, pal.leaf2, pal.leaf3]), pal.border, 0.1));
      }
      g.restore();
    }
  }
  // угловые бляшки: мухомор сверху
  for (const [x, y] of [[c0, c0], [CW - c0, c0], [CW - c0, CH - c0], [c0, CH - c0]]) {
    g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fillStyle = css(pal.floor); g.fill(); g.lineWidth = 2; g.strokeStyle = css(pal.line); g.stroke();
    g.beginPath(); g.arc(x, y, 12, 0, TAU);
    const rg = g.createRadialGradient(x - 4, y - 4, 1, x, y, 13);
    rg.addColorStop(0, css(lighten(pal.cap, 0.3))); rg.addColorStop(0.6, css(pal.cap)); rg.addColorStop(1, css(darken(pal.cap, 0.4)));
    g.fillStyle = rg; g.fill();
    g.fillStyle = css(pal.spot);
    for (const [dx, dy, r] of [[-4, -4, 2.2], [3, -5, 1.8], [5, 2, 2.3], [-5, 3, 1.8], [0, 0, 2], [-1, 7, 1.4]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, TAU); g.fill(); }
  }
  return 46;
}

export default {
  id: 'mushrooms',
  name: 'Грибной',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const pr = rng.fork('mush');
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    const cx = CW / 2, cy = CH / 2;
    const comp = rng.int(0, 2);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    forestFloor(g, pal, pr.fork('fl'), fx, fy, fw, fh);
    const capAlt = [[pal.cap, pal.spot], [mix(pal.cap, pal.chant, 0.5), pal.spot], [pal.cap, pal.spot]];

    if (comp === 0) {
      // полянка: большая семья мухоморов в центре
      glowBlob(g, cx, cy + 20, 150, pal.glow, 0.28);
      // папоротники из углов
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x = cx + sx * (fw / 2 - 2), y = cy + sy * (fh / 2 - 2);
        fern(g, pal, x, y, 120, sy < 0 ? Math.PI + sx * -0.9 + Math.PI * 0 : sx * 0.9, sx * (sy < 0 ? -1 : 1) * 1.0);
      }
      // задний план
      porcini(g, pal, cx - 80, cy - 70, 74, -0.08); porcini(g, pal, cx + 78, cy - 80, 66, 0.1);
      amanita(g, pal, cx - 62, cy + 52, 94, -0.1, pal.cap === null ? null : mix(pal.cap, pal.chant, 0.55));
      amanita(g, pal, cx + 64, cy + 56, 86, 0.1, mix(pal.cap, pal.floor2, 0.2));
      amanita(g, pal, cx, cy + 40, 138, 0);
      // передний план
      for (const [dx, dy, h, t] of [[-30, 98, 40, -0.15], [34, 100, 36, 0.2], [-108, 86, 34, 0.1], [108, 88, 34, -0.1]]) amanita(g, pal, cx + dx, cy + dy, h, t);
      chanterelle(g, pal, cx - 96, fy + fh - 26, 62, -0.1); chanterelle(g, pal, cx + 20, fy + fh - 14, 56, 0.08); chanterelle(g, pal, cx + 92, fy + fh - 30, 60, 0.12);
      snail(g, pal, fx + 56, fy + 88, 52, 1); snail(g, pal, fx + fw - 52, fy + 130, 46, -1);
    } else if (comp === 1) {
      // ведьмино кольцо
      const R = 96, n = 12;
      glowBlob(g, cx, cy, 130, pal.glow, 0.25);
      g.beginPath(); g.arc(cx, cy, R + 14, 0, TAU); g.fillStyle = css(pal.moss, 0.35); g.fill();
      g.setLineDash([2, 6]); g.lineCap = 'round'; g.lineWidth = 2.2; g.strokeStyle = css(pal.glow, 0.7);
      g.beginPath(); g.arc(cx, cy, R - 22, 0, TAU); g.stroke(); g.setLineDash([]);
      const ring = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU - Math.PI / 2; ring.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * 1.06, i]); }
      ring.sort((a, b) => a[1] - b[1]);
      // углы
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        fern(g, pal, cx + sx * (fw / 2 - 2), cy + sy * (fh / 2 - 2), 105, sy < 0 ? Math.PI - sx * 0.8 : sx * 0.8, sx * (sy < 0 ? -1 : 1));
      }
      porcini(g, pal, cx, cy + 34, 92, 0.02);
      chanterelle(g, pal, cx - 38, cy + 40, 48, -0.2); chanterelle(g, pal, cx + 36, cy + 42, 44, 0.2);
      for (const [x, y, i] of ring) {
        if (i % 2) chanterelle(g, pal, x, y + 12, 44, (i - 6) * 0.03); else amanita(g, pal, x, y + 14, 56, (i - 6) * 0.03, capAlt[i % 3][0], capAlt[i % 3][1]);
      }
      for (const sy of [-1, 1]) {
        const yy = cy + sy * (fh / 2 - 30);
        chanterelle(g, pal, cx - 66, yy + 14, 52, -0.1); porcini(g, pal, cx + 66, yy + 14, 50, 0.1); amanita(g, pal, cx, yy + 10, 58, 0);
        snail(g, pal, cx + (sy > 0 ? -66 : 66), cy + sy * 150, 40, sy > 0 ? 1 : -1);
      }
    } else {
      // шахматная россыпь грибов, папоротников и улиток
      const rows = 6, sy = fh / rows, sx = fw / 3;
      let k = pr.int(0, 4);
      for (let r = 0; r < rows; r++) {
        const odd = r % 2, cnt = odd ? 2 : 3;
        for (let c = 0; c < cnt; c++) {
          const x = fx + sx * (c + (odd ? 1 : 0.5)), y = fy + sy * (r + 1) - 8;
          glowBlob(g, x, y - 26, 44, pal.glow, 0.12);
          const t = [0, 1, 2, 3, 0, 4, 2, 1][(k++) % 8];
          if (t === 0) amanita(g, pal, x, y, 70, pr.range(-0.1, 0.1));
          else if (t === 1) chanterelle(g, pal, x, y, 62, pr.range(-0.1, 0.1));
          else if (t === 2) porcini(g, pal, x, y, 66, pr.range(-0.1, 0.1));
          else if (t === 3) fern(g, pal, x - 4, y, 64, pr.range(-0.2, 0.2), pr.chance(0.5) ? 1 : -1);
          else snail(g, pal, x, y - 2, 46, pr.chance(0.5) ? 1 : -1);
        }
      }
    }
    // светлячки
    const ff = pr.fork('ff');
    for (let i = 0; i < 16; i++) firefly(g, ff.range(fx + 8, fx + fw - 8), ff.range(fy + 8, fy + fh - 8), ff.range(7, 14), pal);
    g.restore();
    return { edge: pal.edge, fringe: [226, 214, 176] };
  },
};
