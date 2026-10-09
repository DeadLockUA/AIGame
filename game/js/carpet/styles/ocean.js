// Океанский ковёр: подводный свет, рыбки, ракушки, кораллы, водоросли, пузырьки; кайма из волн (сэйгайха) и ракушек.
import { CW, CH, css, darken, lighten, mix, pickPalette, star, petalPath, RNG } from '../kit.js';

const PALS = [
  { top: [120, 228, 226], bot: [10, 96, 148], w0: [18, 80, 130], w1: [40, 140, 180], w2: [150, 224, 232], sand: [236, 214, 160], edge: [14, 66, 110] },
  { top: [64, 144, 224], bot: [8, 26, 100], w0: [10, 36, 100], w1: [34, 90, 180], w2: [120, 180, 240], sand: [214, 200, 170], edge: [10, 30, 90] },
  { top: [130, 232, 184], bot: [8, 92, 102], w0: [10, 74, 84], w1: [30, 140, 130], w2: [140, 226, 196], sand: [240, 222, 168], edge: [10, 70, 78] },
  { top: [160, 156, 244], bot: [40, 18, 104], w0: [34, 18, 90], w1: [90, 70, 180], w2: [180, 170, 250], sand: [226, 196, 190], edge: [30, 14, 80] },
  { top: [190, 244, 232], bot: [36, 168, 190], w0: [20, 120, 150], w1: [70, 190, 206], w2: [200, 246, 240], sand: [248, 230, 180], edge: [20, 110, 136] },
];
const FISH = [[255, 140, 50], [255, 210, 60], [255, 120, 160], [240, 84, 70], [168, 116, 236], [158, 222, 84], [255, 168, 190], [250, 250, 240]];
const CORAL = [[255, 110, 120], [255, 150, 70], [236, 90, 170], [255, 200, 90], [180, 110, 230]];

const C = (c, a) => css(c, a);
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };

/* ---------- существа и предметы ---------- */
function fish(g, s, col, kind = 0, col2 = null) {
  const c2 = col2 || mix(col, [255, 255, 255], 0.55);
  const dark = darken(col, 0.45);
  const hh = [0.5, 0.9, 0.62][kind] * s;
  g.save();
  g.lineJoin = 'round';
  // хвост
  g.beginPath(); g.moveTo(-s * 0.55, 0);
  g.bezierCurveTo(-s * 1.0, -hh * 0.2, -s * 1.3, -hh * 0.8, -s * 1.5, -hh * 0.95);
  g.quadraticCurveTo(-s * 1.2, 0, -s * 1.5, hh * 0.95);
  g.bezierCurveTo(-s * 1.3, hh * 0.8, -s * 1.0, hh * 0.2, -s * 0.55, 0); g.closePath();
  g.fillStyle = C(mix(col, c2, 0.2)); g.fill(); g.lineWidth = Math.max(0.8, s * 0.06); g.strokeStyle = C(dark); g.stroke();
  // плавники
  g.beginPath(); g.moveTo(s * 0.4, -hh * 0.82); g.quadraticCurveTo(0, -hh * (kind === 1 ? 1.9 : 1.5), -s * 0.7, -hh * 0.6); g.closePath();
  g.fillStyle = C(mix(col, c2, 0.2)); g.fill(); g.stroke();
  if (kind === 1) { g.beginPath(); g.moveTo(s * 0.2, hh * 0.85); g.quadraticCurveTo(-s * 0.1, hh * 1.8, -s * 0.6, hh * 0.65); g.closePath(); g.fill(); g.stroke(); }
  // тело
  g.beginPath(); g.moveTo(s, 0);
  g.bezierCurveTo(s * 0.7, -hh * 1.15, -s * 0.3, -hh * 1.05, -s * 0.7, -hh * 0.12);
  g.lineTo(-s * 0.7, hh * 0.12);
  g.bezierCurveTo(-s * 0.3, hh * 1.05, s * 0.7, hh * 1.15, s, 0); g.closePath();
  const gr = g.createLinearGradient(0, -hh, 0, hh);
  gr.addColorStop(0, C(lighten(col, 0.2))); gr.addColorStop(0.55, C(col)); gr.addColorStop(1, C(mix(col, c2, 0.55)));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  if (kind === 2) {
    g.fillStyle = C([255, 255, 255], 0.9);
    for (const x of [0.35, -0.15]) g.fillRect(s * x - s * 0.1, -hh * 1.3, s * 0.2, hh * 2.6);
    g.strokeStyle = C(dark, 0.7); g.lineWidth = 1;
    for (const x of [0.35, -0.15]) { g.strokeRect(s * x - s * 0.1, -hh * 1.3, s * 0.2, hh * 2.6); }
  } else if (kind === 1) {
    g.strokeStyle = C(dark, 0.55); g.lineWidth = Math.max(0.8, s * 0.07);
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(s * 0.1 * i, -hh * 1.2); g.quadraticCurveTo(s * 0.3 + s * 0.1 * i, 0, s * 0.1 * i, hh * 1.2); g.stroke(); }
  } else {
    g.strokeStyle = C(dark, 0.35); g.lineWidth = Math.max(0.6, s * 0.04);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-s * 0.45 + i * s * 0.32 + (r % 2) * s * 0.16, (r - 1) * hh * 0.5, s * 0.17, -1.2, 1.2); g.stroke(); }
  }
  g.fillStyle = C([255, 255, 255], 0.28); g.beginPath(); g.ellipse(s * 0.05, -hh * 0.55, s * 0.5, hh * 0.18, 0, 0, 6.3); g.fill();
  g.restore();
  g.beginPath(); g.moveTo(s, 0);
  g.bezierCurveTo(s * 0.7, -hh * 1.15, -s * 0.3, -hh * 1.05, -s * 0.7, -hh * 0.12);
  g.lineTo(-s * 0.7, hh * 0.12);
  g.bezierCurveTo(-s * 0.3, hh * 1.05, s * 0.7, hh * 1.15, s, 0); g.closePath();
  g.lineWidth = Math.max(0.9, s * 0.07); g.strokeStyle = C(dark); g.stroke();
  // жабры, глаз, рот
  g.beginPath(); g.arc(s * 0.35, 0, hh * 0.65, 1.9, 4.4); g.lineWidth = Math.max(0.7, s * 0.05); g.strokeStyle = C(dark, 0.6); g.stroke();
  circ(g, s * 0.58, -hh * 0.2, s * 0.15); g.fillStyle = C([255, 255, 255]); g.fill(); g.lineWidth = 0.8; g.strokeStyle = C(dark); g.stroke();
  circ(g, s * 0.62, -hh * 0.2, s * 0.08); g.fillStyle = C([20, 20, 40]); g.fill();
  g.restore();
}

function shell(g, s, col) {
  // гребешок, веер вверх
  g.save();
  const n = 7;
  g.beginPath(); g.moveTo(-s * 0.3, s * 0.85); g.lineTo(s * 0.3, s * 0.85); g.lineTo(s * 0.4, s * 0.55); g.lineTo(-s * 0.4, s * 0.55); g.closePath();
  g.fillStyle = C(darken(col, 0.15)); g.fill();
  g.beginPath(); g.moveTo(0, s * 0.6);
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 0.95 + (i / n) * Math.PI * 0.9 + 0.0;
    const a2 = a + (Math.PI * 0.9) / n / 2;
    g.lineTo(Math.cos(a) * s * 1.05, s * 0.6 + Math.sin(a) * s * 1.35);
    g.quadraticCurveTo(Math.cos(a + (Math.PI * 0.9) / n / 2) * s * 1.2, s * 0.6 + Math.sin(a2) * s * 1.5, Math.cos(a + (Math.PI * 0.9) / n) * s * 1.05, s * 0.6 + Math.sin(a + (Math.PI * 0.9) / n) * s * 1.35);
  }
  g.closePath();
  const gr = g.createRadialGradient(0, s * 0.6, 0, 0, s * 0.6, s * 1.4);
  gr.addColorStop(0, C(lighten(col, 0.5))); gr.addColorStop(1, C(col));
  g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(0.8, s * 0.06); g.strokeStyle = C(darken(col, 0.5)); g.stroke();
  g.strokeStyle = C(darken(col, 0.4), 0.8);
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 0.95 + (i / n) * Math.PI * 0.9 + (Math.PI * 0.9) / n / 2;
    g.beginPath(); g.moveTo(0, s * 0.6); g.lineTo(Math.cos(a) * s * 1.15, s * 0.6 + Math.sin(a) * s * 1.4); g.stroke();
  }
  g.restore();
}

function conch(g, s, col) {
  g.save();
  g.beginPath(); g.moveTo(-s, s * 0.4);
  g.bezierCurveTo(-s * 0.9, -s * 0.9, s * 0.8, -s * 1.1, s * 1.0, s * 0.1);
  g.bezierCurveTo(s * 1.1, s * 0.8, s * 0.2, s * 0.9, -s * 0.3, s * 0.7);
  g.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.9, s * 0.5, -s, s * 0.4); g.closePath();
  const gr = g.createLinearGradient(-s, -s, s, s); gr.addColorStop(0, C(lighten(col, 0.4))); gr.addColorStop(1, C(darken(col, 0.1)));
  g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(0.8, s * 0.06); g.strokeStyle = C(darken(col, 0.5)); g.stroke();
  g.beginPath(); for (let a = 0; a < 11; a += 0.15) { const r = s * 0.12 * a * 0.6 + 1; const x = s * 0.15 + Math.cos(a) * r * 1.1, y = -s * 0.05 + Math.sin(a) * r * 0.8; a ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.strokeStyle = C(darken(col, 0.45), 0.8); g.lineWidth = Math.max(0.7, s * 0.05); g.stroke();
  g.beginPath(); g.ellipse(s * 0.7, s * 0.45, s * 0.3, s * 0.2, 0.2, 0, 6.3); g.fillStyle = C([255, 190, 190]); g.fill(); g.stroke();
  g.restore();
}

function starfish(g, s, col) {
  star(g, 0, 0, s, s * 0.45, 5, -Math.PI / 2);
  g.fillStyle = C(col); g.fill(); g.lineJoin = 'round'; g.lineWidth = Math.max(1, s * 0.12); g.strokeStyle = C(col); g.stroke();
  g.lineWidth = Math.max(0.7, s * 0.06); g.strokeStyle = C(darken(col, 0.4)); star(g, 0, 0, s * 1.05, s * 0.4, 5, -Math.PI / 2); g.stroke();
  g.fillStyle = C(lighten(col, 0.5), 0.9);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * Math.PI * 2) / 5; for (const d of [0.35, 0.62, 0.84]) { circ(g, Math.cos(a) * s * d, Math.sin(a) * s * d, s * 0.05); g.fill(); } }
}

function branchCoral(g, rng, len, col) {
  const rec = (x, y, ang, l, w, d) => {
    const x2 = x + Math.cos(ang) * l, y2 = y + Math.sin(ang) * l;
    g.lineCap = 'round'; g.lineWidth = w; g.strokeStyle = C(col);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    if (d === 0) { circ(g, x2, y2, w * 0.7); g.fillStyle = C(lighten(col, 0.4)); g.fill(); return; }
    const k = rng.int(2, 3);
    for (let i = 0; i < k; i++) rec(x2, y2, ang + (i - (k - 1) / 2) * rng.range(0.5, 0.8) + rng.range(-0.15, 0.15), l * rng.range(0.62, 0.78), w * 0.72, d - 1);
  };
  g.save();
  g.strokeStyle = C(darken(col, 0.35)); // подложка-тень
  rec(0, 0, -Math.PI / 2, len * 0.45, len * 0.14, 3);
  g.restore();
}

function fanCoral(g, s, col) {
  g.save();
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * s, Math.sin(a) * s);
    g.lineWidth = s * 0.1; g.lineCap = 'round'; g.strokeStyle = C(col); g.stroke();
  }
  g.beginPath(); g.arc(0, 0, s * 0.5, -Math.PI * 0.9, -Math.PI * 0.1); g.lineWidth = s * 0.07; g.strokeStyle = C(lighten(col, 0.3)); g.stroke();
  g.beginPath(); g.arc(0, 0, s * 0.8, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke();
  g.restore();
}

function tubeCoral(g, s, col) {
  for (let i = -2; i <= 2; i++) {
    const h = s * (1.1 - Math.abs(i) * 0.22), x = i * s * 0.3;
    g.beginPath(); g.roundRect(x - s * 0.14, -h, s * 0.28, h, s * 0.14);
    g.fillStyle = C(mix(col, [255, 255, 255], 0.05 * (i + 2))); g.fill(); g.lineWidth = 1; g.strokeStyle = C(darken(col, 0.4)); g.stroke();
    g.beginPath(); g.ellipse(x, -h, s * 0.14, s * 0.07, 0, 0, 6.3); g.fillStyle = C(darken(col, 0.45)); g.fill();
  }
}

function brainCoral(g, s, col) {
  g.beginPath(); g.arc(0, 0, s, Math.PI, Math.PI * 2); g.closePath();
  g.fillStyle = C(col); g.fill(); g.lineWidth = 1; g.strokeStyle = C(darken(col, 0.4)); g.stroke();
  g.save(); g.clip();
  g.strokeStyle = C(darken(col, 0.35), 0.85); g.lineWidth = Math.max(0.8, s * 0.07);
  for (let r = 0.2; r < 1; r += 0.2) for (let a = 0; a < 6; a++) { g.beginPath(); g.arc(0, 0, s * r, Math.PI + a * 0.55, Math.PI + a * 0.55 + 0.35); g.stroke(); }
  g.restore();
}

function kelp(g, rng, h, w, col) {
  const ph = rng.range(0, 6), f = rng.range(0.025, 0.04), amp = rng.range(6, 12);
  const pts = [];
  for (let y = 0; y <= h; y += 4) pts.push([Math.sin(y * f + ph) * amp * (y / h + 0.2), -y, w * (1 - (y / h) * 0.75)]);
  g.beginPath();
  pts.forEach(([x, y, ww], i) => (i ? g.lineTo(x - ww, y) : g.moveTo(x - ww, y)));
  for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2], pts[i][1]);
  g.closePath();
  const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, C(darken(col, 0.2))); gr.addColorStop(0.5, C(lighten(col, 0.12))); gr.addColorStop(1, C(darken(col, 0.3)));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1; g.strokeStyle = C(darken(col, 0.5)); g.stroke();
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = C(lighten(col, 0.4), 0.6); g.lineWidth = 1; g.stroke();
}

function jelly(g, s, col) {
  g.save();
  for (let i = -3; i <= 3; i++) {
    g.beginPath(); g.moveTo(i * s * 0.25, 0);
    for (let k = 1; k <= 8; k++) g.lineTo(i * s * 0.25 + Math.sin(k * 0.9 + i) * s * 0.12, k * s * 0.2);
    g.strokeStyle = C(col, 0.8); g.lineWidth = Math.max(1, s * 0.07); g.lineCap = 'round'; g.stroke();
  }
  g.beginPath(); g.moveTo(-s, 0); g.bezierCurveTo(-s, -s * 1.3, s, -s * 1.3, s, 0);
  g.quadraticCurveTo(s * 0.5, s * 0.2, 0, 0); g.quadraticCurveTo(-s * 0.5, s * 0.2, -s, 0); g.closePath();
  const gr = g.createRadialGradient(0, -s * 0.5, 0, 0, -s * 0.3, s * 1.2); gr.addColorStop(0, C(lighten(col, 0.6), 0.95)); gr.addColorStop(1, C(col, 0.85));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1; g.strokeStyle = C(darken(col, 0.3), 0.8); g.stroke();
  g.strokeStyle = C(lighten(col, 0.5), 0.7);
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * s * 0.25, 0); g.quadraticCurveTo(i * s * 0.45, -s * 0.7, i * s * 0.2, -s * 1.0); g.stroke(); }
  g.restore();
}

function octopus(g, s, col) {
  g.save();
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * (0.12 + (i / 7) * 0.76);
    const dir = i < 4 ? -1 : 1;
    g.beginPath();
    let x = Math.cos(a) * s * 0.55, y = s * 0.45;
    g.moveTo(x, y);
    const pts = [];
    for (let k = 1; k <= 14; k++) {
      const t = k / 14;
      x = Math.cos(a) * s * (0.55 + 1.15 * t) + Math.sin(t * 7 + i) * s * 0.18 * t;
      y = s * 0.45 + Math.sin(a) * s * 1.15 * t + t * t * s * 0.3;
      pts.push([x, y]); g.lineTo(x, y);
    }
    g.lineWidth = s * 0.3; g.strokeStyle = C(darken(col, 0.3)); g.stroke();
    g.lineWidth = s * 0.24; g.strokeStyle = C(col); g.stroke();
    g.fillStyle = C(lighten(col, 0.5), 0.9);
    pts.forEach(([px, py], k) => { if (k % 2 === 1 && k < 12) { circ(g, px, py, s * 0.05 * (1 - k / 16)); g.fill(); } });
  }
  const gr = g.createRadialGradient(-s * 0.3, -s * 0.5, 0, 0, -s * 0.2, s * 1.1);
  gr.addColorStop(0, C(lighten(col, 0.3))); gr.addColorStop(1, C(col));
  g.beginPath(); g.ellipse(0, -s * 0.2, s * 0.85, s * 0.95, 0, 0, 6.3); g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(1, s * 0.05); g.strokeStyle = C(darken(col, 0.4)); g.stroke();
  g.fillStyle = C(lighten(col, 0.4), 0.7); for (const [x, y, r] of [[-0.3, -0.75, 0.1], [0.2, -0.9, 0.07], [0.4, -0.55, 0.08]]) { circ(g, x * s, y * s, r * s); g.fill(); }
  for (const sx of [-1, 1]) {
    g.beginPath(); g.ellipse(sx * s * 0.32, -s * 0.05, s * 0.22, s * 0.26, 0, 0, 6.3); g.fillStyle = C([255, 255, 255]); g.fill(); g.lineWidth = 1; g.strokeStyle = C(darken(col, 0.5)); g.stroke();
    circ(g, sx * s * 0.3, -s * 0.0, s * 0.11); g.fillStyle = C([20, 20, 40]); g.fill();
    circ(g, sx * s * 0.27, -s * 0.05, s * 0.04); g.fillStyle = C([255, 255, 255]); g.fill();
  }
  g.beginPath(); g.arc(0, s * 0.18, s * 0.16, 0.2, Math.PI - 0.2); g.strokeStyle = C(darken(col, 0.5)); g.lineWidth = Math.max(1, s * 0.05); g.stroke();
  g.restore();
}

function bubble(g, x, y, r) {
  circ(g, x, y, r);
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0.06)');
  g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(0.7, r * 0.12); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.38, r * 0.2, r * 0.12, -0.7, 0, 6.3); g.fill();
}

/* ---------- кайма: сэйгайха ---------- */
function border(g, pal, rng) {
  const dk = pal.w0, md = pal.w1, lt = pal.w2;
  g.fillStyle = C(dk); g.fillRect(0, 0, CW, CH);
  g.save();
  g.beginPath(); g.rect(0, 0, CW, CH); g.rect(37, 37, CW - 74, CH - 74); g.clip('evenodd');
  const R = 13;
  for (let row = -1; row * R * 0.55 < CH + R; row++) {
    for (let col = -1; col * R * 2 < CW + R * 2; col++) {
      const cx = col * R * 2 + (row % 2 ? R : 0), cy = row * R * 0.55 + R * 0.6;
      const cols = [mix(dk, md, 0.3), md, lt, md, mix(md, lt, 0.5)];
      for (let k = 0; k < 5; k++) {
        circ(g, cx, cy, R * (1 - k * 0.19));
        g.fillStyle = C(k % 2 ? mix(cols[k], lt, 0.25) : cols[k]); g.fill();
        g.lineWidth = 0.7; g.strokeStyle = C(dk, 0.75); g.stroke();
      }
    }
  }
  g.restore();
  g.lineWidth = 3; g.strokeStyle = C(pal.sand); g.strokeRect(36.5, 36.5, CW - 73, CH - 73);
  g.lineWidth = 1; g.strokeStyle = C(dk); g.strokeRect(34.5, 34.5, CW - 69, CH - 69); g.strokeRect(38.5, 38.5, CW - 77, CH - 77);
  g.lineWidth = 1.2; g.strokeStyle = C(pal.sand, 0.9); g.strokeRect(5, 5, CW - 10, CH - 10);
  // ракушки по углам
  const sh = rng.pick(CORAL);
  for (const [x, y, r] of [[19, 19, 0], [CW - 19, 19, 0], [19, CH - 19, Math.PI], [CW - 19, CH - 19, Math.PI]]) {
    circ(g, x, y, 15); g.fillStyle = C(dk); g.fill(); g.lineWidth = 1.5; g.strokeStyle = C(pal.sand); g.stroke();
    g.save(); g.translate(x, y + (r ? 3 : 4)); g.rotate(r); g.scale(0.9, 0.9); shell(g, 10, sh); g.restore();
  }
  // ракушки/звёзды посередине сторон
  for (const [x, y] of [[CW / 2, 19], [CW / 2, CH - 19], [19, CH / 2], [CW - 19, CH / 2]]) {
    circ(g, x, y, 11); g.fillStyle = C(dk); g.fill(); g.lineWidth = 1.2; g.strokeStyle = C(pal.sand); g.stroke();
    g.save(); g.translate(x, y + 0.5); starfish(g, 7.5, rng.pick(CORAL)); g.restore();
  }
  return 41;
}

/* ---------- поле ---------- */
function water(g, pal, rng) {
  const gr = g.createLinearGradient(0, 0, 0, CH);
  gr.addColorStop(0, C(pal.top)); gr.addColorStop(1, C(pal.bot));
  g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
  // лучи света
  g.save(); g.globalCompositeOperation = 'lighter';
  const n = rng.int(5, 7);
  for (let i = 0; i < n; i++) {
    const x = rng.range(-20, CW + 20), w = rng.range(14, 40), sk = rng.range(-90, 40);
    const lg = g.createLinearGradient(0, 0, 0, CH * 0.85);
    lg.addColorStop(0, 'rgba(255,255,230,0.3)'); lg.addColorStop(1, 'rgba(255,255,230,0)');
    g.beginPath(); g.moveTo(x - w * 0.4, 0); g.lineTo(x + w * 0.4, 0); g.lineTo(x + w * 1.5 + sk, CH * 0.85); g.lineTo(x - w * 1.5 + sk, CH * 0.85); g.closePath();
    g.fillStyle = lg; g.fill();
  }
  g.restore();
  // волнистые линии воды
  g.lineWidth = 1;
  for (let y = 10; y < CH; y += 17) {
    g.strokeStyle = `rgba(255,255,255,${0.1 + 0.05 * Math.sin(y)})`; g.beginPath();
    const ph = rng.range(0, 6);
    for (let x = 0; x <= CW; x += 6) { const yy = y + Math.sin(x * 0.045 + ph + y * 0.2) * 2.4; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
  // муть
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${rng.range(0.1, 0.4)})`; circ(g, rng.range(0, CW), rng.range(0, CH), rng.range(0.4, 1.2)); g.fill(); }
}

function sandFloor(g, pal, rng, top) {
  g.beginPath(); g.moveTo(0, top + 6);
  for (let x = 0; x <= CW; x += 8) g.lineTo(x, top + Math.sin(x * 0.03 + 1) * 6 + Math.sin(x * 0.09) * 2);
  g.lineTo(CW, CH); g.lineTo(0, CH); g.closePath();
  const gr = g.createLinearGradient(0, top, 0, CH); gr.addColorStop(0, C(lighten(pal.sand, 0.1))); gr.addColorStop(1, C(darken(pal.sand, 0.25)));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  for (let i = 0; i < 90; i++) { g.fillStyle = C(darken(pal.sand, rng.range(0.1, 0.35)), 0.6); circ(g, rng.range(0, CW), rng.range(top, CH), rng.range(0.6, 2)); g.fill(); }
  for (let y = top + 14; y < CH; y += 12) { g.strokeStyle = C(darken(pal.sand, 0.2), 0.4); g.beginPath(); for (let x = 0; x <= CW; x += 6) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 1.8); g.stroke(); }
  g.restore();
}

function place(g, x, y, rot, sc, fn) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, 1); g.shadowColor = 'rgba(0,30,60,0.25)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5; fn(); g.restore(); }

function bubbles(g, rng, n, area, avoid = []) {
  const [x0, y0, x1, y1] = area;
  for (let i = 0; i < n; i++) {
    const x = rng.range(x0, x1), y = rng.range(y0, y1), r = rng.range(2, 7);
    if (avoid.some((a) => Math.hypot(a.x - x, a.y - y) < a.r + r)) continue;
    bubble(g, x, y, r);
  }
}

/* ---------- композиции ---------- */
function compReef(g, pal, rng) {
  const fc = rng.shuffle(FISH), cc = rng.shuffle(CORAL);
  const floor = 372;
  sandFloor(g, pal, rng, floor);
  // водоросли
  for (let i = 0; i < 7; i++) { g.save(); g.translate(rng.range(50, 310), rng.range(floor + 30, 490)); kelp(g, rng, rng.range(70, 150), rng.range(4, 7), [40 + rng.int(0, 40), 150 + rng.int(0, 60), 90 + rng.int(0, 40)]); g.restore(); }
  // кораллы
  const xs = [58, 112, 170, 226, 284];
  xs.forEach((x, i) => {
    const y = floor + 40 + rng.range(0, 40);
    g.save(); g.translate(x + rng.range(-12, 12), y);
    g.shadowColor = 'rgba(0,30,60,0.3)'; g.shadowBlur = 3;
    const t = (i + rng.int(0, 3)) % 4;
    if (t === 0) branchCoral(g, rng, 70, cc[i % 5]); else if (t === 1) fanCoral(g, 48, cc[i % 5]); else if (t === 2) tubeCoral(g, 34, cc[i % 5]); else brainCoral(g, 30, cc[i % 5]);
    g.restore();
  });
  // ракушки на песке
  for (let i = 0; i < 4; i++) { const x = 60 + i * 78 + rng.range(-12, 12), y = rng.range(floor + 90, 478); place(g, x, y, rng.range(-0.3, 0.3), 1, () => (i % 2 ? conch(g, 15, [250, 200, 170]) : shell(g, 13, rng.pick(CORAL)))); }
  for (let i = 0; i < 2; i++) place(g, rng.range(70, 290), rng.range(floor + 60, 470), rng.range(0, 6), 1, () => starfish(g, 14, rng.pick(CORAL)));
  // косяки
  const rows = [[110, 1], [170, -1], [235, 1], [300, -1]];
  rows.forEach(([y, dir], ri) => {
    const n = ri % 2 ? 3 : 4;
    for (let i = 0; i < n; i++) {
      const x = 70 + (i + 0.5) * (240 / n) + rng.range(-8, 8), yy = y + Math.sin(i * 1.7 + ri) * 10;
      place(g, x, yy, Math.sin(i + ri) * 0.15, dir, () => fish(g, 16 + (ri % 2) * 5 - i % 2 * 2, fc[(i + ri) % fc.length], (i + ri) % 3));
    }
  });
  g.save(); g.translate(rng.range(80, 280), 62); jelly(g, 15, [255, 170, 220]); g.restore();
  bubbles(g, rng, 24, [50, 50, 320, 380]);
}

function compRing(g, pal, rng) {
  const cx = CW / 2, cy = CH / 2 - 6;
  const fc = rng.shuffle(FISH), cc = rng.shuffle(CORAL);
  // круги-течение
  for (const [r, a] of [[128, 0.35], [84, 0.3], [44, 0.35]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.3; g.setLineDash([6, 5]); circ(g, cx, cy, r); g.stroke(); g.setLineDash([]); }
  // медальон: ракушка-звезда
  circ(g, cx, cy, 36); g.fillStyle = C(darken(pal.bot, 0.1), 0.5); g.fill();
  g.lineWidth = 2; g.strokeStyle = C(pal.sand); g.stroke();
  g.save(); g.translate(cx, cy); g.rotate(rng.range(0, 6)); starfish(g, 30, cc[0]); g.restore();
  circ(g, cx, cy, 10); g.fillStyle = C(lighten(cc[0], 0.6)); g.fill();
  // внешнее кольцо рыб по часовой стрелке
  const n1 = 8;
  for (let i = 0; i < n1; i++) {
    const a = (i / n1) * Math.PI * 2 + 0.2;
    place(g, cx + Math.cos(a) * 108, cy + Math.sin(a) * 108, a + Math.PI / 2, 1, () => fish(g, 19, fc[i % fc.length], i % 3));
  }
  const n2 = 5;
  for (let i = 0; i < n2; i++) {
    const a = (i / n2) * Math.PI * 2 + 0.5;
    place(g, cx + Math.cos(a) * 68, cy + Math.sin(a) * 68, a - Math.PI / 2, 1, () => fish(g, 13, fc[(i + 3) % fc.length], (i + 1) % 3));
  }
  // углы
  const corners = [[62, 62, 0.5], [CW - 62, 62, -0.5], [62, CH - 66, -0.5], [CW - 62, CH - 66, 0.5]];
  corners.forEach(([x, y, r], i) => {
    g.save(); g.translate(x, y + (i > 1 ? 24 : -4));
    g.shadowColor = 'rgba(0,30,60,0.3)'; g.shadowBlur = 3;
    if (i > 1) { if (i === 2) branchCoral(g, rng, 56, cc[1]); else fanCoral(g, 42, cc[2]); }
    else { g.translate(0, 4); if (i === 0) jelly(g, 14, [255, 170, 220]); else jelly(g, 12, [190, 170, 255]); }
    g.restore();
  });
  for (let i = 0; i < 4; i++) {
    const x = [180, 180, 56, 304][i], y = [52, CH - 52, 270, 270][i];
    place(g, x, y, 0, 1, () => (i < 2 ? shell(g, 12, cc[(i + 2) % 5]) : conch(g, 12, [250, 200, 170])));
  }
  bubbles(g, rng, 26, [50, 50, 320, 490], [{ x: cx, y: cy, r: 140 }]);
}

function compRows(g, pal, rng) {
  const fc = rng.shuffle(FISH), cc = rng.shuffle(CORAL);
  const rows = 6, y0 = 80, dy = 74;
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * dy;
    // волна-разделитель
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.beginPath();
    for (let x = 40; x <= CW - 40; x += 4) { const yy = y - 38 + Math.sin(x * 0.12 + r) * 3.5; x === 40 ? g.moveTo(x, yy) : g.lineTo(x, yy); }
    g.stroke();
    const dir = r % 2 ? -1 : 1;
    const n = 3;
    for (let i = 0; i < n; i++) {
      const x = 80 + i * 100 + (r % 2 ? 0 : 0);
      place(g, x, y + Math.sin(i) * 3, 0, dir, () => fish(g, 20 - (r % 3) * 2, fc[(r + i) % fc.length], (r + i) % 3));
    }
    // мелочь между ними
    for (let i = 0; i < 2; i++) { const x = 130 + i * 100; const k = (r + i) % 3; place(g, x, y + 14, 0, 1, () => (k === 0 ? starfish(g, 7, cc[(r + i) % 5]) : k === 1 ? shell(g, 6, cc[(r + i) % 5]) : bubble(g, 0, 0, 5))); }
    bubbles(g, rng, 3, [50, y - 30, 320, y + 30]);
  }
}

function compOcto(g, pal, rng) {
  const cx = CW / 2;
  const fc = rng.shuffle(FISH), cc = rng.shuffle(CORAL);
  sandFloor(g, pal, rng, 430);
  const sd = rng.int(1, 1e9);
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx, 0); g.scale(sx, 1);
    const r = new RNG(sd);
    for (let i = 0; i < 3; i++) { g.save(); g.translate(112 - i * 4 + r.range(-6, 6), 480 - i * 8); kelp(g, r, 190 - i * 38, 6, [44 + i * 8, 160 + i * 14, 96]); g.restore(); }
    g.save(); g.translate(118, 478); branchCoral(g, r, 70, cc[0]); g.restore();
    place(g, 80, 468, 0, 1, () => fanCoral(g, 40, cc[1]));
    place(g, 112, 90, 0.2, 1, () => fish(g, 15, fc[0], 1));
    place(g, 82, 150, -0.1, 1, () => fish(g, 12, fc[1], 0));
    place(g, 100, 335, 0.1, 1, () => fish(g, 13, fc[2], 2));
    place(g, 60, 240, 0.3, 1, () => jelly(g, 12, [255, 180, 224]));
    g.restore();
  }
  // осьминог
  g.save(); g.translate(cx, 250); octopus(g, 62, rng.pick([[236, 100, 130], [160, 110, 230], [255, 140, 70], [90, 180, 220]])); g.restore();
  place(g, cx, 470, 0, 1, () => shell(g, 16, cc[2]));
  place(g, cx - 54, 478, 0.3, 1, () => starfish(g, 14, cc[3]));
  place(g, cx + 56, 480, -0.2, 1, () => conch(g, 14, [250, 200, 170]));
  place(g, cx, 80, 0, 1, () => jelly(g, 18, [255, 170, 220]));
  bubbles(g, rng, 24, [52, 50, 320, 420], [{ x: cx, y: 260, r: 85 }]);
}

export default {
  id: 'ocean',
  name: 'Океан',
  paint(g, rng) {
    const pal = pickPalette(rng.fork('pal'), PALS);
    const inset = border(g, pal, rng.fork('b'));
    g.save(); g.beginPath(); g.rect(inset, inset, CW - 2 * inset, CH - 2 * inset); g.clip();
    water(g, pal, rng.fork('w'));
    const v = rng.fork('v').int(0, 3), r = rng.fork('c');
    if (v === 0) compReef(g, pal, r); else if (v === 1) compRing(g, pal, r); else if (v === 2) compRows(g, pal, r); else compOcto(g, pal, r);
    g.restore();
    return { edge: pal.edge, fringe: [226, 240, 236] };
  },
};
