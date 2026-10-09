// Ковёр с котами: кайма из отпечатков лап, коты в разных позах, клубки, рыбьи косточки, мышки.
import { CW, CH, css, darken, lighten, mix, pickPalette, star, polar, RNG } from '../kit.js';

const PALS = [
  { field: [196, 98, 64], field2: [214, 120, 84], border: [96, 40, 34], accent: [250, 226, 190], ink: [58, 28, 24], edge: [84, 34, 28], yarn: [250, 226, 190] },
  { field: [228, 172, 62], field2: [240, 192, 92], border: [122, 62, 30], accent: [255, 242, 206], ink: [70, 36, 20], edge: [104, 52, 24], yarn: [190, 60, 70] },
  { field: [212, 106, 120], field2: [228, 132, 142], border: [112, 30, 52], accent: [255, 232, 226], ink: [66, 20, 34], edge: [96, 24, 44], yarn: [255, 226, 160] },
  { field: [244, 226, 196], field2: [234, 208, 170], border: [178, 84, 60], accent: [128, 60, 40], ink: [74, 40, 30], edge: [150, 68, 48], yarn: [200, 80, 70] },
  { field: [150, 98, 62], field2: [170, 118, 78], border: [70, 40, 28], accent: [244, 204, 144], ink: [40, 22, 16], edge: [58, 32, 22], yarn: [244, 190, 90] },
  { field: [250, 172, 132], field2: [255, 192, 152], border: [150, 60, 70], accent: [255, 238, 214], ink: [86, 34, 40], edge: [128, 50, 60], yarn: [160, 80, 150] },
];
const CATC = [[236, 138, 58], [50, 44, 56], [160, 160, 172], [250, 246, 238], [242, 212, 164], [150, 100, 64], [214, 124, 96], [96, 90, 108]];
const EYES = [[96, 206, 96], [252, 204, 56], [104, 176, 244], [244, 156, 44]];
const YARN = [[230, 70, 80], [90, 170, 230], [250, 210, 80], [120, 200, 120], [200, 120, 230], [250, 250, 245]];

const C = (c, a) => css(c, a);
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/* ---------- коты ---------- */
function ears(g, s, col, ink, y0 = 0) {
  for (const sx of [-1, 1]) {
    g.save(); g.scale(sx, 1);
    g.beginPath(); g.moveTo(0.95 * s, y0 - 0.2 * s); g.lineTo(0.85 * s, y0 - 1.38 * s); g.lineTo(0.05 * s, y0 - 0.78 * s); g.closePath();
    g.fillStyle = C(col); g.fill(); g.lineJoin = 'round'; g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
    g.beginPath(); g.moveTo(0.78 * s, y0 - 0.44 * s); g.lineTo(0.76 * s, y0 - 1.0 * s); g.lineTo(0.36 * s, y0 - 0.72 * s); g.closePath();
    g.fillStyle = C([246, 150, 160]); g.fill();
    g.restore();
  }
}

function face(g, s, col, o) {
  const ink = o.ink;
  ears(g, s, col, ink);
  const gr = g.createRadialGradient(-s * 0.3, -s * 0.4, s * 0.1, 0, 0, s * 1.3);
  gr.addColorStop(0, C(lighten(col, 0.15))); gr.addColorStop(1, C(darken(col, 0.08)));
  g.beginPath(); g.ellipse(0, 0, 1.12 * s, 0.9 * s, 0, 0, 6.3); g.fillStyle = gr; g.fill();
  g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  if (o.tabby) {
    g.strokeStyle = C(darken(col, 0.45), 0.8); g.lineWidth = s * 0.09; g.lineCap = 'round';
    for (const dx of [-0.28, 0, 0.28]) { g.beginPath(); g.moveTo(dx * s, -0.88 * s); g.lineTo(dx * s * 0.8, -0.5 * s); g.stroke(); }
    for (const sx of [-1, 1]) for (const dy of [0.0, 0.2]) { g.beginPath(); g.moveTo(sx * 1.08 * s, dy * s); g.lineTo(sx * 0.78 * s, (dy + 0.04) * s); g.stroke(); }
  }
  g.beginPath(); g.ellipse(0, 0.32 * s, 0.5 * s, 0.34 * s, 0, 0, 6.3); g.fillStyle = C(lighten(col, 0.55), 0.85); g.fill();
  // глаза
  for (const sx of [-1, 1]) {
    g.save(); g.translate(sx * 0.46 * s, -0.08 * s);
    if (o.sleep) { g.beginPath(); g.arc(0, 0, 0.22 * s, 0.15, Math.PI - 0.15); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke(); }
    else {
      g.beginPath(); g.ellipse(0, 0, 0.25 * s, 0.31 * s, 0, 0, 6.3); g.fillStyle = C(o.eye); g.fill(); g.lineWidth = s * 0.06; g.strokeStyle = C(ink); g.stroke();
      g.beginPath(); g.ellipse(0, 0, 0.08 * s, 0.25 * s, 0, 0, 6.3); g.fillStyle = C([16, 12, 20]); g.fill();
      circ(g, -0.07 * s, -0.1 * s, 0.07 * s); g.fillStyle = '#fff'; g.fill();
    }
    g.restore();
  }
  // нос и рот
  g.beginPath(); g.moveTo(-0.13 * s, 0.2 * s); g.lineTo(0.13 * s, 0.2 * s); g.lineTo(0, 0.34 * s); g.closePath(); g.fillStyle = C([240, 120, 140]); g.fill();
  g.lineWidth = s * 0.05; g.strokeStyle = C(ink); g.stroke();
  g.beginPath(); g.moveTo(0, 0.34 * s); g.lineTo(0, 0.44 * s);
  g.moveTo(0, 0.44 * s); g.quadraticCurveTo(-0.14 * s, 0.6 * s, -0.3 * s, 0.46 * s);
  g.moveTo(0, 0.44 * s); g.quadraticCurveTo(0.14 * s, 0.6 * s, 0.3 * s, 0.46 * s); g.stroke();
  // усы
  g.strokeStyle = C(o.whisk || [255, 255, 255], 0.9); g.lineWidth = s * 0.035;
  for (const sx of [-1, 1]) for (const [dy, ey] of [[0.3, 0.18], [0.4, 0.4], [0.5, 0.62]]) {
    g.beginPath(); g.moveTo(sx * 0.55 * s, dy * s); g.lineTo(sx * 1.55 * s, ey * s - 0.08 * s); g.stroke();
  }
  if (o.blush) for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 0.72 * s, 0.34 * s, 0.17 * s, 0.1 * s, 0, 0, 6.3); g.fillStyle = C([255, 130, 140], 0.45); g.fill(); }
}

function tailStroke(g, pts, w, col, ink) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.bezierCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
  g.lineWidth = w * 1.25; g.strokeStyle = C(ink); g.stroke();
  g.lineWidth = w; g.strokeStyle = C(col); g.stroke();
}

function catSit(g, s, col, o) {
  const ink = o.ink;
  // хвост
  tailStroke(g, [[1.15 * s, 2.0 * s], [2.4 * s, 2.1 * s], [2.4 * s, 0.5 * s], [1.75 * s, 0.35 * s]], 0.5 * s, col, ink);
  if (o.tabby) { g.strokeStyle = C(darken(col, 0.45), 0.8); g.lineWidth = s * 0.1; g.lineCap = 'butt'; for (const [x, y] of [[2.02, 1.45], [2.1, 1.0], [1.95, 0.6]]) { g.beginPath(); g.moveTo((x - 0.22) * s, y * s); g.lineTo((x + 0.22) * s, y * s); g.stroke(); } }
  // тело
  g.beginPath(); g.moveTo(0, -0.5 * s); g.bezierCurveTo(1.0 * s, -0.5 * s, 1.55 * s, 0.9 * s, 1.3 * s, 2.25 * s);
  g.lineTo(-1.3 * s, 2.25 * s); g.bezierCurveTo(-1.55 * s, 0.9 * s, -1.0 * s, -0.5 * s, 0, -0.5 * s); g.closePath();
  const gr = g.createLinearGradient(-1.4 * s, 0, 1.4 * s, 0); gr.addColorStop(0, C(darken(col, 0.1))); gr.addColorStop(0.4, C(lighten(col, 0.12))); gr.addColorStop(1, C(darken(col, 0.18)));
  g.fillStyle = gr; g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  g.beginPath(); g.ellipse(0, 1.25 * s, 0.6 * s, 0.95 * s, 0, 0, 6.3); g.fillStyle = C(lighten(col, 0.5), 0.8); g.fill();
  if (o.tabby) { g.strokeStyle = C(darken(col, 0.45), 0.7); g.lineWidth = s * 0.09; g.lineCap = 'round'; for (const sx of [-1, 1]) for (const y of [0.5, 1.0, 1.5]) { g.beginPath(); g.moveTo(sx * 1.38 * s - sx * 0.1 * s, y * s); g.lineTo(sx * 0.95 * s, (y + 0.08) * s); g.stroke(); } }
  // лапы
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 0.48 * s, 2.2 * s, 0.42 * s, 0.26 * s, 0, 0, 6.3); g.fillStyle = C(lighten(col, 0.2)); g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = C(ink); g.stroke(); }
  g.save(); g.translate(0, -0.95 * s); face(g, s, col, o); g.restore();
}

function catLoaf(g, s, col, o) {
  const ink = o.ink;
  tailStroke(g, [[1.5 * s, 1.5 * s], [2.4 * s, 1.5 * s], [2.2 * s, 0.4 * s], [1.7 * s, 0.9 * s]], 0.45 * s, col, ink);
  g.beginPath(); g.moveTo(-1.6 * s, 1.7 * s); g.bezierCurveTo(-1.9 * s, 0.1 * s, -0.8 * s, -0.5 * s, 0, -0.5 * s); g.bezierCurveTo(0.8 * s, -0.5 * s, 1.9 * s, 0.1 * s, 1.6 * s, 1.7 * s); g.closePath();
  const gr = g.createLinearGradient(0, -0.5 * s, 0, 1.7 * s); gr.addColorStop(0, C(lighten(col, 0.1))); gr.addColorStop(1, C(darken(col, 0.15)));
  g.fillStyle = gr; g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  if (o.tabby) { g.strokeStyle = C(darken(col, 0.45), 0.7); g.lineWidth = s * 0.09; g.lineCap = 'round'; for (const sx of [-1, 1]) for (const y of [0.1, 0.6, 1.1]) { g.beginPath(); g.moveTo(sx * 1.65 * s, (y + 0.3) * s); g.lineTo(sx * 1.2 * s, (y + 0.35) * s); g.stroke(); } }
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 0.62 * s, 1.55 * s, 0.45 * s, 0.26 * s, 0, 0, 6.3); g.fillStyle = C(lighten(col, 0.3)); g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = C(ink); g.stroke(); }
  g.save(); g.translate(0, 0.1 * s); face(g, s * 0.95, col, o); g.restore();
}

function catSleep(g, s, col, o) {
  const ink = o.ink;
  // тело-бублик
  g.beginPath(); g.ellipse(0.2 * s, 0.3 * s, 1.9 * s, 1.3 * s, 0, 0, 6.3);
  const gr = g.createRadialGradient(0, -0.4 * s, 0, 0.2 * s, 0.3 * s, 2 * s); gr.addColorStop(0, C(lighten(col, 0.15))); gr.addColorStop(1, C(darken(col, 0.12)));
  g.fillStyle = gr; g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  if (o.tabby) { g.strokeStyle = C(darken(col, 0.45), 0.7); g.lineWidth = s * 0.1; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -1.3 + i * 0.42; g.beginPath(); g.moveTo(0.2 * s + Math.cos(a) * 1.9 * s, 0.3 * s + Math.sin(a) * 1.3 * s); g.lineTo(0.2 * s + Math.cos(a) * 1.35 * s, 0.3 * s + Math.sin(a) * 0.92 * s); g.stroke(); } }
  // хвост по краю
  g.beginPath(); g.ellipse(0.2 * s, 0.3 * s, 1.95 * s, 1.35 * s, 0, 0.1, 2.3);
  g.lineCap = 'round'; g.lineWidth = s * 0.62; g.strokeStyle = C(ink); g.stroke(); g.lineWidth = s * 0.5; g.strokeStyle = C(lighten(col, 0.08)); g.stroke();
  // голова
  g.save(); g.translate(-1.0 * s, 0.55 * s); g.rotate(-0.3); face(g, s * 0.78, col, { ...o, sleep: true }); g.restore();
  // лапка
  g.beginPath(); g.ellipse(-0.2 * s, 1.05 * s, 0.4 * s, 0.24 * s, 0.2, 0, 6.3); g.fillStyle = C(lighten(col, 0.3)); g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = C(ink); g.stroke();
  // Z-z-z
  if (o.noz) return;
  g.strokeStyle = C(o.zcol || [255, 255, 255], 0.95); g.lineWidth = s * 0.12; g.lineJoin = 'round'; g.lineCap = 'round';
  [[1.5, -1.5, 0.22], [2.0, -2.05, 0.3], [2.5, -2.7, 0.4]].forEach(([x, y, k]) => { g.beginPath(); g.moveTo((x - k) * s, (y - k) * s); g.lineTo((x + k) * s, (y - k) * s); g.lineTo((x - k) * s, (y + k) * s); g.lineTo((x + k) * s, (y + k) * s); g.stroke(); });
}

function catWalk(g, s, col, o) {
  const ink = o.ink;
  tailStroke(g, [[-1.4 * s, -0.2 * s], [-2.4 * s, -0.4 * s], [-1.6 * s, -1.6 * s], [-2.1 * s, -2.0 * s]], 0.36 * s, col, ink);
  // дальние ноги
  g.lineCap = 'round';
  for (const [x, dx] of [[-1.0, -0.15], [0.9, 0.15]]) { g.beginPath(); g.moveTo(x * s, 0.4 * s); g.lineTo((x + dx) * s, 1.4 * s); g.lineWidth = 0.46 * s; g.strokeStyle = C(ink); g.stroke(); g.lineWidth = 0.36 * s; g.strokeStyle = C(darken(col, 0.2)); g.stroke(); }
  g.beginPath(); g.ellipse(0, 0, 1.6 * s, 0.85 * s, 0, 0, 6.3);
  const gr = g.createLinearGradient(0, -0.9 * s, 0, 0.9 * s); gr.addColorStop(0, C(lighten(col, 0.1))); gr.addColorStop(1, C(darken(col, 0.1)));
  g.fillStyle = gr; g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  if (o.tabby) { g.strokeStyle = C(darken(col, 0.45), 0.7); g.lineWidth = s * 0.1; for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) { g.beginPath(); g.moveTo(x * s, -0.85 * s * Math.sqrt(1 - (x / 1.6) ** 2)); g.lineTo((x + 0.05) * s, -0.35 * s); g.stroke(); } }
  for (const [x, dx] of [[-0.5, 0.15], [1.4, -0.15]]) { g.beginPath(); g.moveTo(x * s, 0.4 * s); g.lineTo((x + dx) * s, 1.5 * s); g.lineWidth = 0.48 * s; g.strokeStyle = C(ink); g.stroke(); g.lineWidth = 0.38 * s; g.strokeStyle = C(col); g.stroke(); circ(g, (x + dx) * s, 1.5 * s, 0.22 * s); g.fillStyle = C(lighten(col, 0.4)); g.fill(); }
  // голова (профиль)
  g.save(); g.translate(1.8 * s, -0.7 * s);
  ears(g, s * 0.55, col, ink, -0.1 * s);
  g.beginPath(); g.ellipse(0, 0, 0.72 * s, 0.62 * s, 0, 0, 6.3); g.fillStyle = C(lighten(col, 0.08)); g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = C(ink); g.stroke();
  g.beginPath(); g.ellipse(0.12 * s, 0.05 * s, 0.22 * s, 0.28 * s, 0, 0, 6.3); g.fillStyle = C(o.eye); g.fill(); g.lineWidth = s * 0.05; g.stroke();
  g.beginPath(); g.ellipse(0.14 * s, 0.05 * s, 0.07 * s, 0.22 * s, 0, 0, 6.3); g.fillStyle = C([16, 12, 20]); g.fill();
  circ(g, 0.7 * s, 0.2 * s, 0.1 * s); g.fillStyle = C([240, 120, 140]); g.fill();
  g.strokeStyle = C(o.whisk || [255, 255, 255], 0.9); g.lineWidth = s * 0.035;
  for (const dy of [0.12, 0.26]) { g.beginPath(); g.moveTo(0.6 * s, dy * s + 0.1 * s); g.lineTo(1.3 * s, (dy - 0.14) * s + 0.1 * s); g.stroke(); }
  g.restore();
}

const POSES = [
  { f: catSit, w: 4.6, h: 4.8 }, { f: catLoaf, w: 4.4, h: 3.0 }, { f: catSleep, w: 5.4, h: 4.0 }, { f: catWalk, w: 6.0, h: 4.4 },
];

/* ---------- предметы ---------- */
function paw(g, s, col, a = 1) {
  g.fillStyle = C(col, a);
  g.beginPath(); g.moveTo(0, -0.05 * s);
  g.bezierCurveTo(0.7 * s, -0.05 * s, 0.85 * s, 0.7 * s, 0.5 * s, 0.88 * s);
  g.bezierCurveTo(0.25 * s, 1.0 * s, 0.12 * s, 0.82 * s, 0, 0.82 * s);
  g.bezierCurveTo(-0.12 * s, 0.82 * s, -0.25 * s, 1.0 * s, -0.5 * s, 0.88 * s);
  g.bezierCurveTo(-0.85 * s, 0.7 * s, -0.7 * s, -0.05 * s, 0, -0.05 * s); g.fill();
  for (const [x, y, r] of [[-0.78, -0.4, -0.35], [-0.28, -0.82, -0.1], [0.28, -0.82, 0.1], [0.78, -0.4, 0.35]]) {
    g.beginPath(); g.ellipse(x * s, y * s, 0.22 * s, 0.3 * s, r, 0, 6.3); g.fill();
  }
}

function yarn(g, r, col, ink) {
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  gr.addColorStop(0, C(lighten(col, 0.4))); gr.addColorStop(1, C(darken(col, 0.15)));
  circ(g, 0, 0, r); g.fillStyle = gr; g.fill();
  g.save(); circ(g, 0, 0, r); g.clip();
  g.strokeStyle = C(darken(col, 0.35), 0.75); g.lineWidth = Math.max(1, r * 0.07);
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(0, 0, r * (1.0 - Math.abs(i) * 0.04), r * (0.35 + Math.abs(i) * 0.15), i * 0.5 + 0.4, 0, 6.3); g.stroke(); }
  g.strokeStyle = C(lighten(col, 0.45), 0.6); g.lineWidth = Math.max(0.8, r * 0.04);
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(0, 0, r * 0.95, r * (0.25 + Math.abs(i) * 0.18), i * 0.5 + 2.2, 0, 6.3); g.stroke(); }
  g.restore();
  circ(g, 0, 0, r); g.lineWidth = Math.max(1, r * 0.06); g.strokeStyle = C(ink); g.stroke();
}

function thread(g, pts, w, col, ink) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  if (ink) { g.lineWidth = w + 1.6; g.strokeStyle = C(ink, 0.6); g.stroke(); }
  g.lineWidth = w; g.strokeStyle = C(col); g.stroke();
}

function fishbone(g, s, col, ink) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const draw = (w, c) => {
    g.lineWidth = w; g.strokeStyle = C(c);
    g.beginPath(); g.moveTo(-1.5 * s, 0); g.lineTo(1.2 * s, 0);
    for (let i = -3; i <= 2; i++) { const x = i * 0.36 * s; g.moveTo(x, 0); g.lineTo(x + 0.3 * s, -0.55 * s); g.moveTo(x, 0); g.lineTo(x + 0.3 * s, 0.55 * s); }
    g.moveTo(-1.5 * s, 0); g.lineTo(-2.1 * s, -0.5 * s); g.moveTo(-1.5 * s, 0); g.lineTo(-2.1 * s, 0.5 * s);
    g.stroke();
  };
  draw(s * 0.3, ink); draw(s * 0.18, col);
  g.beginPath(); g.ellipse(1.6 * s, 0, 0.55 * s, 0.45 * s, 0, 0, 6.3); g.fillStyle = C(col); g.fill(); g.lineWidth = s * 0.1; g.strokeStyle = C(ink); g.stroke();
  circ(g, 1.7 * s, -0.08 * s, 0.14 * s); g.fillStyle = C(ink); g.fill();
}

function mouse(g, s, col, ink) {
  g.beginPath(); g.moveTo(-1.0 * s, 0.1 * s); g.bezierCurveTo(-2.0 * s, 0.4 * s, -2.2 * s, -0.7 * s, -2.9 * s, -0.5 * s);
  g.lineCap = 'round'; g.lineWidth = s * 0.16; g.strokeStyle = C([240, 150, 160]); g.stroke();
  g.beginPath(); g.moveTo(1.3 * s, 0.1 * s); g.bezierCurveTo(1.2 * s, -0.9 * s, -0.8 * s, -0.95 * s, -1.1 * s, 0.1 * s); g.lineTo(-1.0 * s, 0.6 * s); g.lineTo(1.1 * s, 0.6 * s); g.closePath();
  g.fillStyle = C(col); g.fill(); g.lineWidth = s * 0.1; g.strokeStyle = C(ink); g.stroke();
  for (const dx of [0.1, 0.55]) { g.beginPath(); g.arc(dx * s, -0.7 * s, 0.34 * s, 0, 6.3); g.fillStyle = C(lighten(col, 0.3)); g.fill(); g.stroke(); circ(g, dx * s, -0.7 * s, 0.17 * s); g.fillStyle = C([246, 160, 170]); g.fill(); }
  circ(g, 0.85 * s, -0.1 * s, 0.1 * s); g.fillStyle = C(ink); g.fill();
  circ(g, 1.28 * s, 0.1 * s, 0.13 * s); g.fillStyle = C([246, 120, 140]); g.fill();
}

function heart(g, s, col) {
  g.beginPath(); g.moveTo(0, s * 0.9); g.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.6, -s * 1.1, 0, -s * 0.35); g.bezierCurveTo(s * 0.6, -s * 1.1, s * 1.4, -s * 0.1, 0, s * 0.9);
  g.fillStyle = C(col); g.fill();
}

function catFish(g, s, col, ink) {
  g.beginPath(); g.moveTo(1.2 * s, 0); g.bezierCurveTo(0.5 * s, -0.9 * s, -0.6 * s, -0.8 * s, -1.0 * s, 0); g.bezierCurveTo(-0.6 * s, 0.8 * s, 0.5 * s, 0.9 * s, 1.2 * s, 0);
  g.fillStyle = C(col); g.fill();
  g.beginPath(); g.moveTo(-0.9 * s, 0); g.lineTo(-1.7 * s, -0.7 * s); g.lineTo(-1.5 * s, 0); g.lineTo(-1.7 * s, 0.7 * s); g.closePath(); g.fill();
  g.lineWidth = s * 0.09; g.strokeStyle = C(ink); g.lineJoin = 'round'; g.stroke();
  circ(g, 0.7 * s, -0.12 * s, 0.1 * s); g.fillStyle = C(ink); g.fill();
}

/* ---------- кайма из лап ---------- */
function border(g, pal, rng, motif) {
  const bg = g.createLinearGradient(0, 0, CW, CH);
  bg.addColorStop(0, C(pal.border)); bg.addColorStop(1, C(darken(pal.border, 0.2)));
  g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
  // тон-в-тон мелкие лапки
  g.save(); g.beginPath(); g.rect(0, 0, CW, CH); g.rect(38, 38, CW - 76, CH - 76); g.clip('evenodd');
  for (let y = 6; y < CH; y += 16) for (let x = 6 + ((y / 16) % 2) * 8; x < CW; x += 16) { g.save(); g.translate(x, y); g.rotate(0.5); paw(g, 3.2, lighten(pal.border, 0.15), 0.55); g.restore(); }
  g.restore();
  g.lineWidth = 1.2; g.strokeStyle = C(pal.accent, 0.9); g.strokeRect(6, 6, CW - 12, CH - 12);
  g.lineWidth = 2.4; g.strokeStyle = C(pal.accent); g.strokeRect(36.5, 36.5, CW - 73, CH - 73);
  g.lineWidth = 0.8; g.strokeStyle = C(pal.accent, 0.8); g.strokeRect(33, 33, CW - 66, CH - 66);
  // след лап по контуру
  const x0 = 20, y0 = 20, W = CW - 40, H = CH - 40;
  const sides = [[x0, y0, 1, 0, W, 0], [x0 + W, y0, 0, 1, H, Math.PI / 2], [x0 + W, y0 + H, -1, 0, W, Math.PI], [x0, y0 + H, 0, -1, H, -Math.PI / 2]];
  let k = 0;
  const cols = [pal.accent, lighten(pal.accent, 0.1)];
  for (const [sx, sy, dx, dy, len, ang] of sides) {
    const n = Math.round(len / 26);
    for (let i = 1; i < n; i++) {
      const t = i / n, x = sx + dx * len * t, y = sy + dy * len * t;
      const side = i % 2 ? 1 : -1;
      const px = x - dy * side * 4.2, py = y + dx * side * 4.2;
      g.save(); g.translate(px, py); g.rotate(ang + Math.PI / 2 + side * 0.1);
      if (motif === 1 && i % 4 === 0) { g.rotate(-Math.PI / 2 - Math.PI / 2 * 0); g.translate(0, 0); fishbone(g, 3.3, pal.accent, pal.ink); }
      else if (motif === 2 && i % 4 === 0) { heart(g, 5.2, pal.yarn); }
      else { paw(g, 8, cols[k % 2]); }
      g.restore(); k++;
    }
  }
  // углы: мордочки в кружках
  const cats = rng.shuffle(CATC);
  [[x0, y0], [x0 + W, y0], [x0 + W, y0 + H], [x0, y0 + H]].forEach(([x, y], i) => {
    circ(g, x, y, 17); g.fillStyle = C(pal.field); g.fill(); g.lineWidth = 2; g.strokeStyle = C(pal.accent); g.stroke();
    g.save(); g.translate(x, y + 2.5); g.beginPath(); g.arc(0, -2.5, 15, 0, 6.3); g.clip();
    face(g, 9, cats[i], { ink: pal.ink, eye: EYES[i % 4], tabby: i % 2 === 0, whisk: [255, 255, 255] });
    g.restore();
  });
  return 41;
}

/* ---------- поле ---------- */
function fieldBase(g, pal, rng) {
  const gr = g.createRadialGradient(CW / 2, CH / 2, 40, CW / 2, CH / 2, 340);
  gr.addColorStop(0, C(lighten(pal.field, 0.08))); gr.addColorStop(1, C(darken(pal.field, 0.1)));
  g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
  const kind = rng.int(0, 2);
  if (kind === 0) { // шахматка лапок
    for (let y = 50; y < CH; y += 30) for (let x = 40 + ((Math.round(y / 30) % 2) * 15); x < CW; x += 30) { g.save(); g.translate(x, y); g.rotate(rng.range(-0.3, 0.3) + 0.3); paw(g, 5.5, pal.field2, 0.7); g.restore(); }
  } else if (kind === 1) { // ромбы
    g.strokeStyle = C(pal.field2, 0.7); g.lineWidth = 1.4;
    for (let k = -CH; k < CW + CH; k += 26) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + CH, CH); g.moveTo(k + CH, 0); g.lineTo(k, CH); g.stroke(); }
    g.fillStyle = C(pal.field2, 0.9); for (let y = 12; y < CH; y += 26) for (let x = 12; x < CW; x += 26) { circ(g, x, y, 1.6); g.fill(); }
  } else { // горох + сердечки
    g.fillStyle = C(pal.field2, 0.8);
    for (let y = 46; y < CH; y += 22) for (let x = 40 + ((Math.round(y / 22) % 2) * 11); x < CW; x += 22) { circ(g, x, y, 3); g.fill(); }
  }
}

function placeCell(g, x, y, w, h, pose, col, pal, rng, flip) {
  const ink = pal.ink;
  const o = { ink, eye: rng.pick(EYES), tabby: rng.chance(0.55), blush: true, whisk: [255, 255, 255], zcol: pal.accent, noz: true };
  const sc = Math.min((w * 0.94) / pose.w, (h * 0.94) / pose.h);
  g.save(); g.translate(x, y);
  g.shadowColor = 'rgba(0,0,0,0.28)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5;
  if (flip) g.scale(-1, 1);
  // сдвиг в центр ячейки: нужные поправки по позам
  const dy = pose.f === catSit ? -0.15 : pose.f === catLoaf ? -0.3 : pose.f === catSleep ? -0.1 : 0.05;
  g.translate(0, dy * sc * 2);
  pose.f(g, sc, col, o);
  g.restore();
}

function pickCat(rng, pal, avoid = []) {
  for (let i = 0; i < 20; i++) {
    const c = rng.pick(CATC);
    if (dist(c, pal.field) > 80 && !avoid.includes(c)) return c;
  }
  return [250, 246, 238];
}

/* ---------- композиции ---------- */
function compMedallion(g, pal, rng) {
  const cx = CW / 2, cy = CH / 2;
  const yc = rng.shuffle(YARN);
  // нить, оплетающая поле
  thread(g, [[60, 100], [140, 150], [90, 230], [200, 200], [270, 260], [220, 340], [300, 400], [250, 470]], 2.5, pal.yarn, pal.ink);
  // медальон
  polar(g, cx, cy, 0, (a) => 118 + 5 * Math.cos(a * 22));
  g.fillStyle = C(pal.border); g.fill(); g.lineWidth = 2; g.strokeStyle = C(pal.accent); g.stroke();
  circ(g, cx, cy, 104); g.fillStyle = C(pal.accent); g.fill();
  circ(g, cx, cy, 98); g.fillStyle = C(mix(pal.field, pal.accent, 0.45)); g.fill();
  g.lineWidth = 1.2; g.strokeStyle = C(pal.border); g.stroke();
  // кольцо лап
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.save(); g.translate(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); g.rotate(a + Math.PI / 2); paw(g, 6.5, pal.border, 0.8); g.restore(); }
  g.save(); g.translate(cx, cy + 4); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
  face(g, 46, pickCat(rng, pal), { ink: pal.ink, eye: rng.pick(EYES), tabby: rng.chance(0.6), blush: true });
  g.restore();
  // клубки по углам
  [[88, 92], [CW - 88, 92], [88, CH - 92], [CW - 88, CH - 92]].forEach(([x, y], i) => {
    g.save(); g.translate(x, y); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 2;
    yarn(g, 24, yc[i % yc.length], pal.ink); g.restore();
  });
  // боковые: косточки, мышки
  for (const [x, y, r] of [[56, cy, -Math.PI / 2], [CW - 56, cy, Math.PI / 2]]) { g.save(); g.translate(x, y); g.rotate(r); fishbone(g, 9, pal.accent, pal.ink); g.restore(); }
  for (const [x, y, f] of [[cx - 60, 38 + 20, 1], [cx + 60, CH - 58, -1]]) { g.save(); g.translate(x, y); g.scale(f, 1); mouse(g, 10, [190, 190, 200], pal.ink); g.restore(); }
  for (const [x, y] of [[cx, 56], [cx, CH - 56]]) { g.save(); g.translate(x, y); heart(g, 9, [240, 90, 110]); g.restore(); }
}

function compParade(g, pal, rng) {
  const cols = 3, rows = 5;
  const x0 = 46, y0 = 46, W = CW - 92, H = CH - 92;
  const cw = W / cols, ch = H / rows;
  // нить-змейка между рядами
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * ch;
    g.strokeStyle = C(pal.border, 0.6); g.lineWidth = 2; g.setLineDash([2, 5]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0 + 6, y); g.lineTo(x0 + W - 6, y); g.stroke(); g.setLineDash([]);
  }
  const used = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + (c + 0.5) * cw, y = y0 + (r + 0.5) * ch;
    const pose = POSES[(r * 2 + c + rng.int(0, 1)) % POSES.length];
    const col = pickCat(rng, pal, [used[used.length - 1], used[used.length - cols]]);
    used.push(col);
    placeCell(g, x, y + 4, cw, ch - 10, pose, col, pal, rng, (r + c) % 2 === 1);
  }
  // мелочь на стыках
  for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + (c + 0.5) * cw + (r % 2 ? 0 : 0), y = y0 + (r + 1) * ch;
    g.save(); g.translate(x, y);
    const k = (r + c) % 3;
    if (k === 0) yarn(g, 6, YARN[(r + c) % YARN.length], pal.ink); else if (k === 1) { fishbone(g, 3.2, pal.accent, pal.ink); } else heart(g, 4.4, [240, 90, 110]);
    g.restore();
  }
}

function compSpiral(g, pal, rng) {
  const cx = CW / 2, cy = CH / 2 + 6;
  const yc = rng.pick(YARN);
  // спираль нити
  const pts = [];
  for (let a = 0; a < Math.PI * 7; a += 0.2) { const r = 78 + a * 6.6; pts.push([cx + Math.cos(a) * r * 1.0, cy + Math.sin(a) * r * 1.02]); }
  g.save(); g.beginPath(); g.rect(41, 41, CW - 82, CH - 82); g.clip();
  g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.lineWidth = 5; g.strokeStyle = C(pal.ink, 0.5); g.stroke(); g.lineWidth = 3.4; g.strokeStyle = C(yc); g.stroke();
  g.strokeStyle = C(lighten(yc, 0.4), 0.7); g.lineWidth = 1; g.setLineDash([3, 6]); g.stroke(); g.setLineDash([]);
  g.restore();
  circ(g, cx, cy, 86); g.fillStyle = C(mix(pal.field, pal.accent, 0.5)); g.fill(); g.lineWidth = 2.4; g.strokeStyle = C(pal.border); g.stroke();
  g.save(); g.translate(cx, cy); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
  const col = pickCat(rng, pal);
  catSleep(g, 34, col, { ink: pal.ink, eye: [0, 0, 0], tabby: rng.chance(0.6), blush: true, zcol: pal.border });
  g.restore();
  // уголки: кости, мышки, клубок
  const decor = [[72, 78], [CW - 72, 78], [72, CH - 78], [CW - 72, CH - 78]];
  decor.forEach(([x, y], i) => {
    g.save(); g.translate(x, y); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 2;
    if (i === 0) { g.rotate(-0.4); fishbone(g, 9, pal.accent, pal.ink); }
    else if (i === 1) { yarn(g, 20, YARN[(rng.int(0, 5))], pal.ink); }
    else if (i === 2) { g.rotate(0.3); mouse(g, 10, [190, 190, 200], pal.ink); }
    else { g.rotate(0.5); catFish(g, 14, [110, 180, 230], pal.ink); }
    g.restore();
  });
  for (const [x, y] of [[cx, 60], [cx, CH - 60], [58, cy], [CW - 58, cy]]) { g.save(); g.translate(x, y); paw(g, 12, pal.border, 0.85); g.restore(); }
}

function compFamily(g, pal, rng) {
  const cx = CW / 2;
  // нить через поле
  thread(g, [[46, 186], [110, 160], [160, 192], [240, 162], [314, 192]], 2.6, pal.yarn, pal.ink);
  const used = [];
  [84, 180, 276].forEach((x, i) => {
    const col = pickCat(rng, pal, used); used.push(col);
    g.save(); g.translate(x, 104); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 2;
    face(g, 28, col, { ink: pal.ink, eye: rng.pick(EYES), tabby: i !== 1, blush: true });
    g.restore();
  });
  const big = pickCat(rng, pal, used);
  const loaf = rng.chance(0.4);
  g.save(); g.translate(cx, loaf ? 330 : 318); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
  (loaf ? catLoaf : catSit)(g, loaf ? 50 : 41, big, { ink: pal.ink, eye: rng.pick(EYES), tabby: rng.chance(0.5), blush: true });
  g.restore();
  const yc = rng.shuffle(YARN);
  [[70, 400, 28], [CW - 70, 400, 28]].forEach(([x, y, r], i) => { g.save(); g.translate(x, y); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 2; yarn(g, r, yc[i], pal.ink); g.restore(); });
  thread(g, [[78, 420], [110, 478], [180, 484], [250, 478], [CW - 78, 420]], 2.4, pal.yarn, pal.ink);
  g.save(); g.translate(76, 232); g.rotate(-0.3); fishbone(g, 8, pal.accent, pal.ink); g.restore();
  g.save(); g.translate(CW - 76, 232); g.scale(-1, 1); mouse(g, 9, [190, 190, 200], pal.ink); g.restore();
  for (const [x, y] of [[64, 470], [CW - 64, 470], [cx - 66, 215], [cx + 66, 215]]) { g.save(); g.translate(x, y); heart(g, 6.5, [240, 90, 110]); g.restore(); }
}

export default {
  id: 'cats',
  name: 'Коты',
  paint(g, rng) {
    const pal = pickPalette(rng.fork('pal'), PALS);
    const inset = border(g, pal, rng.fork('b'), rng.fork('m').int(0, 2));
    g.save(); g.beginPath(); g.rect(inset, inset, CW - 2 * inset, CH - 2 * inset); g.clip();
    fieldBase(g, pal, rng.fork('f'));
    const v = rng.fork('v').int(0, 3), r = rng.fork('c');
    if (v === 0) compMedallion(g, pal, r); else if (v === 1) compParade(g, pal, r); else if (v === 2) compSpiral(g, pal, r); else compFamily(g, pal, r);
    g.restore();
    return { edge: pal.edge, fringe: lighten(pal.accent, 0.1) };
  },
};
