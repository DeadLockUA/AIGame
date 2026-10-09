// Роботы: милые мордочки, шестерёнки, болты, дорожки схем, лампочки. Кайма из заклёпок и плат.
import { CW, CH, css, mix, darken, lighten, pickPalette, mirrorX } from '../kit.js';

import { RNG, hashString } from '../../util.js';

const TAU = Math.PI * 2;

const PALS = [
  { bg: [86, 108, 138], bg2: [66, 86, 114], b1: [52, 64, 86], b2: [190, 202, 218], metal: [172, 186, 206], a1: [255, 172, 44], a2: [60, 232, 204], a3: [255, 92, 124], dark: [20, 26, 42], edge: [30, 38, 58] },
  { bg: [152, 100, 68], bg2: [126, 80, 54], b1: [72, 46, 36], b2: [228, 178, 130], metal: [216, 160, 114], a1: [92, 232, 212], a2: [255, 232, 92], a3: [255, 112, 92], dark: [40, 24, 20], edge: [62, 38, 30] },
  { bg: [88, 152, 136], bg2: [68, 128, 114], b1: [34, 66, 66], b2: [202, 234, 222], metal: [190, 224, 212], a1: [255, 216, 72], a2: [255, 122, 162], a3: [142, 255, 122], dark: [14, 40, 40], edge: [24, 52, 52] },
  { bg: [98, 100, 110], bg2: [78, 80, 92], b1: [44, 46, 58], b2: [202, 206, 214], metal: [192, 196, 206], a1: [255, 132, 42], a2: [255, 212, 62], a3: [92, 202, 255], dark: [18, 18, 28], edge: [30, 30, 40] },
  { bg: [192, 198, 216], bg2: [168, 174, 198], b1: [112, 94, 152], b2: [246, 248, 255], metal: [228, 232, 246], a1: [255, 102, 172], a2: [102, 222, 255], a3: [255, 222, 92], dark: [52, 42, 82], edge: [84, 68, 120] },
  { bg: [36, 46, 86], bg2: [28, 36, 70], b1: [18, 22, 46], b2: [142, 162, 212], metal: [128, 148, 202], a1: [62, 255, 192], a2: [255, 82, 202], a3: [255, 232, 72], dark: [8, 10, 28], edge: [14, 18, 40] },
];

function line(g, col, w, a = 1) { g.lineWidth = w; g.strokeStyle = css(col, a); g.lineJoin = 'round'; g.stroke(); }
function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function metalFill(g, y0, y1, c, k = 0.22) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, css(lighten(c, k))); gr.addColorStop(0.55, css(c)); gr.addColorStop(1, css(darken(c, k * 0.9)));
  return gr;
}

function rivet(g, x, y, r, pal) {
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = css(darken(pal.b2, 0.35)); g.fill();
  g.beginPath(); g.arc(x - r * 0.12, y - r * 0.12, r * 0.78, 0, TAU); g.fillStyle = css(pal.b2); g.fill();
  g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.28, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill();
}

function bolt(g, x, y, r, pal, a = 0.4) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); for (let i = 0; i < 6; i++) { const t = i * TAU / 6; i ? g.lineTo(Math.cos(t) * r, Math.sin(t) * r) : g.moveTo(r, 0); } g.closePath();
  g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, Math.max(0.7, r * 0.18));
  g.beginPath(); g.moveTo(-r * 0.55, 0); g.lineTo(r * 0.55, 0); line(g, pal.dark, Math.max(0.8, r * 0.26));
  g.restore();
}

function lamp(g, x, y, r, col, pal, on = true) {
  if (on) { const gl = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2.4); gl.addColorStop(0, css(col, 0.55)); gl.addColorStop(1, css(col, 0)); g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 2.4, 0, TAU); g.fill(); }
  g.beginPath(); g.arc(x, y, r * 1.15, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = css(on ? col : darken(col, 0.5)); g.fill();
  g.beginPath(); g.arc(x - r * 0.3, y - r * 0.32, r * 0.35, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fill();
}

function gear(g, R, teeth, c, pal, holes = 0, spokes = 0) {
  const ro = R, ri = R * 0.82, w = TAU / teeth;
  g.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = i * w;
    g.lineTo(Math.cos(a - w * 0.28) * ri, Math.sin(a - w * 0.28) * ri);
    g.lineTo(Math.cos(a - w * 0.16) * ro, Math.sin(a - w * 0.16) * ro);
    g.lineTo(Math.cos(a + w * 0.16) * ro, Math.sin(a + w * 0.16) * ro);
    g.lineTo(Math.cos(a + w * 0.28) * ri, Math.sin(a + w * 0.28) * ri);
  }
  g.closePath();
  const gr = g.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, css(lighten(c, 0.25))); gr.addColorStop(1, css(darken(c, 0.2)));
  g.fillStyle = gr; g.fill(); line(g, pal.dark, Math.max(1, R * 0.045));
  g.beginPath(); g.arc(0, 0, R * 0.66, 0, TAU); line(g, darken(c, 0.35), Math.max(0.8, R * 0.04));
  if (spokes) {
    g.beginPath(); g.arc(0, 0, R * 0.66, 0, TAU); g.arc(0, 0, R * 0.2, 0, TAU, true); g.fillStyle = css(pal.dark, 0.35); g.fill('evenodd');
    for (let i = 0; i < spokes; i++) { g.save(); g.rotate(i * TAU / spokes); rr(g, -R * 0.09, R * 0.1, R * 0.18, R * 0.58, R * 0.05); g.fillStyle = css(lighten(c, 0.1)); g.fill(); line(g, pal.dark, Math.max(0.7, R * 0.03)); g.restore(); }
  }
  for (let i = 0; i < holes; i++) { const a = i * TAU / holes; g.beginPath(); g.arc(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.1, 0, TAU); g.fillStyle = css(pal.dark, 0.8); g.fill(); }
  g.beginPath(); g.arc(0, 0, R * 0.2, 0, TAU); g.fillStyle = css(darken(c, 0.2)); g.fill(); line(g, pal.dark, Math.max(0.8, R * 0.04));
  g.beginPath(); g.arc(0, 0, R * 0.08, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
}

/** Дорожка схемы: ломаная с углами 45/90 и контактной площадкой на конце. */
function trace(g, rng, x, y, steps, col, w, alpha = 1, grid = 12) {
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let d = rng.int(0, 7);
  g.beginPath(); g.moveTo(x, y);
  for (let i = 0; i < steps; i++) {
    d = (d + rng.pick([-1, 0, 0, 1]) + 8) % 8;
    const L = grid * rng.int(1, 3);
    x += dirs[d][0] * L; y += dirs[d][1] * L; g.lineTo(x, y);
  }
  g.lineCap = 'round'; line(g, col, w, alpha);
  g.beginPath(); g.arc(x, y, w * 1.9, 0, TAU); g.strokeStyle = css(col, alpha); g.lineWidth = w * 0.9; g.stroke();
}

function eye(g, kind, x, y, r, col, pal) {
  if (kind === 0) { // светящаяся точка
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = css(col); g.fill();
    g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.34, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill();
  } else if (kind === 1) { // весёлая дуга
    g.beginPath(); g.arc(x, y + r * 0.5, r, Math.PI * 1.1, Math.PI * 1.9); g.lineCap = 'round'; line(g, col, r * 0.5);
  } else if (kind === 2) { // квадратный пиксель
    rr(g, x - r, y - r, r * 2, r * 2, r * 0.3); g.fillStyle = css(col); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x - r * 0.6, y - r * 0.6, r * 0.5, r * 0.5);
  } else { // большой глаз со зрачком
    g.beginPath(); g.arc(x, y, r * 1.1, 0, TAU); g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, r * 0.2);
    g.beginPath(); g.arc(x + r * 0.15, y, r * 0.6, 0, TAU); g.fillStyle = css(col); g.fill();
    g.beginPath(); g.arc(x + r * 0.15, y, r * 0.28, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
    g.beginPath(); g.arc(x - r * 0.15, y - r * 0.3, r * 0.2, 0, TAU); g.fillStyle = '#fff'; g.fill();
  }
}

function mouth(g, kind, x, y, w, col, pal) {
  g.lineCap = 'round';
  if (kind === 0) { g.beginPath(); g.arc(x, y - w * 0.15, w * 0.45, 0.25, Math.PI - 0.25); line(g, col, w * 0.14); }
  else if (kind === 1) { // решётка
    rr(g, x - w / 2, y - w * 0.18, w, w * 0.36, w * 0.1); g.fillStyle = css(pal.dark); g.fill();
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x - w / 2 + (w * i) / 5, y - w * 0.18); g.lineTo(x - w / 2 + (w * i) / 5, y + w * 0.18); line(g, col, w * 0.06); }
  } else if (kind === 2) { // зигзаг
    g.beginPath(); for (let i = 0; i <= 6; i++) { const px = x - w / 2 + (w * i) / 6, py = y + (i % 2 ? w * 0.1 : -w * 0.1); i ? g.lineTo(px, py) : g.moveTo(px, py); } line(g, col, w * 0.1);
  } else { // открытая улыбка
    g.beginPath(); g.moveTo(x - w * 0.4, y - w * 0.1); g.quadraticCurveTo(x, y + w * 0.5, x + w * 0.4, y - w * 0.1); g.closePath(); g.fillStyle = css(pal.dark); g.fill(); line(g, col, w * 0.08);
  }
}

/** Мордочка робота. kind 0 квадрат, 1 круг, 2 телевизор, 3 высокий. s — ширина. */
function robot(g, s, kind, c, glow, pal, rng, opt = {}) {
  const lw = Math.max(1, s * 0.035);
  const ek = opt.eye ?? rng.int(0, 3), mk = opt.mouth ?? rng.int(0, 3);
  const tint = opt.tint || pal.a3;
  g.save(); g.lineJoin = 'round';
  // антенна
  const ant = () => {
    if (kind === 0) { g.beginPath(); g.moveTo(0, -s * 0.4); g.lineTo(0, -s * 0.56); line(g, pal.dark, lw * 1.6); lamp(g, 0, -s * 0.6, s * 0.06, glow, pal); }
    else if (kind === 1) {
      for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * s * 0.12, -s * 0.46); for (let i = 1; i <= 5; i++) g.lineTo(sx * (s * 0.12 + (i % 2 ? s * 0.05 : -s * 0.01) + i * s * 0.025), -s * 0.46 - i * s * 0.035); line(g, pal.dark, lw * 1.2); lamp(g, sx * s * 0.3, -s * 0.66, s * 0.055, sx > 0 ? glow : tint, pal); }
    } else if (kind === 2) { for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * s * 0.08, -s * 0.4); g.lineTo(sx * s * 0.28, -s * 0.66); line(g, pal.dark, lw * 1.5); g.beginPath(); g.arc(sx * s * 0.28, -s * 0.66, s * 0.035, 0, TAU); g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, lw * 0.8); } }
    else { g.beginPath(); g.moveTo(-s * 0.1, -s * 0.5); g.arc(0, -s * 0.5, s * 0.1, Math.PI, 0); g.closePath(); g.fillStyle = css(tint); g.fill(); line(g, pal.dark, lw); rr(g, -s * 0.14, -s * 0.52, s * 0.28, s * 0.05, s * 0.02); g.fillStyle = css(pal.dark); g.fill(); }
  };
  ant();
  // уши
  const earY = kind === 3 ? -s * 0.1 : 0;
  for (const sx of [-1, 1]) {
    const ex = sx * (kind === 1 ? s * 0.52 : kind === 2 ? s * 0.58 : s * 0.46);
    rr(g, ex - s * 0.07, earY - s * 0.14, s * 0.14, s * 0.28, s * 0.05); g.fillStyle = css(darken(c, 0.25)); g.fill(); line(g, pal.dark, lw);
    g.beginPath(); g.arc(ex, earY, s * 0.03, 0, TAU); g.fillStyle = css(glow); g.fill();
  }
  // голова
  const hw = kind === 2 ? s * 1.1 : kind === 3 ? s * 0.8 : s, hh = kind === 2 ? s * 0.8 : kind === 3 ? s * 1.0 : s * 0.8;
  if (kind === 1) { g.beginPath(); g.arc(0, 0, s * 0.5, 0, TAU); } else rr(g, -hw / 2, -hh / 2, hw, hh, s * (kind === 2 ? 0.14 : 0.16));
  g.fillStyle = metalFill(g, -hh / 2, hh / 2, c); g.fill(); line(g, pal.dark, lw * 1.6);
  // блик
  g.beginPath(); g.moveTo(-hw * 0.38, -hh * 0.3); g.quadraticCurveTo(-hw * 0.42, -hh * 0.42, -hw * 0.22, -hh * 0.44); line(g, [255, 255, 255], lw * 1.2, 0.6);
  // шов
  g.beginPath(); g.moveTo(-hw / 2 + s * 0.02, hh * 0.3); g.lineTo(hw / 2 - s * 0.02, hh * 0.3); line(g, pal.dark, lw * 0.6, 0.35);
  // экран-лицо
  const fw = kind === 2 ? hw * 0.84 : kind === 3 ? hw * 0.74 : hw * 0.8, fh = kind === 2 ? hh * 0.66 : kind === 3 ? hh * 0.34 : hh * 0.48;
  const fy = kind === 3 ? -hh * 0.28 : kind === 2 ? -hh * 0.12 : -hh * 0.22;
  if (kind === 1) { g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.4, s * 0.3, 0, 0, TAU); } else rr(g, -fw / 2, fy - fh / 2, fw, fh, s * 0.1);
  g.fillStyle = css(darken(pal.dark, 0)); g.fill(); line(g, darken(c, 0.35), lw * 1.2);
  g.save(); if (kind === 1) { g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.4, s * 0.3, 0, 0, TAU); g.clip(); } else { rr(g, -fw / 2, fy - fh / 2, fw, fh, s * 0.1); g.clip(); }
  g.fillStyle = css(glow, 0.09); for (let yy = -hh; yy < hh; yy += s * 0.06) g.fillRect(-hw, yy, hw * 2, s * 0.025);
  g.restore();
  const ey = kind === 1 ? -s * 0.08 : fy - fh * 0.05;
  if (kind === 1 && ek === 3) eye(g, 3, 0, ey, s * 0.16, glow, pal);
  else if (kind === 3) { for (const sx of [-1, 1]) eye(g, ek === 3 ? 0 : ek, sx * fw * 0.24, fy, s * 0.085, glow, pal); }
  else for (const sx of [-1, 1]) eye(g, ek, sx * fw * (kind === 1 ? 0.24 : 0.24), ey, s * (kind === 2 ? 0.1 : 0.085), glow, pal);
  // щёчки
  if (kind !== 3) for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * fw * 0.36, ey + s * 0.12, s * 0.05, s * 0.032, 0, 0, TAU); g.fillStyle = css(tint, 0.85); g.fill(); }
  // рот
  if (kind === 0 || kind === 3) mouth(g, mk, 0, kind === 3 ? hh * 0.22 : hh * 0.28, s * (kind === 3 ? 0.44 : 0.4), glow, pal);
  else if (kind === 1) mouth(g, mk, 0, hh * 0.27, s * 0.36, glow, pal);
  else { mouth(g, mk, 0, fy + fh * 0.24, s * 0.32, glow, pal); for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(-hw * 0.3 + i * s * 0.12, hh * 0.38, s * 0.032, 0, TAU); g.fillStyle = css([pal.a1, pal.a3][i]); g.fill(); line(g, pal.dark, lw * 0.7); } for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hw * 0.2 + i * s * 0.06, hh * 0.3); g.lineTo(hw * 0.2 + i * s * 0.06, hh * 0.44); line(g, pal.dark, lw * 0.9); } }
  // заклёпки по углам
  if (kind !== 1) for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rivet(g, sx * (hw / 2 - s * 0.06), sy * (hh / 2 - s * 0.06), s * 0.022, pal);
  g.restore();
}

function dial(g, R, pal, glow, needle) {
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = css(pal.metal); g.fill(); line(g, pal.dark, R * 0.06);
  g.beginPath(); g.arc(0, 0, R * 0.82, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.8 + (i / 10) * Math.PI * 1.4; g.beginPath(); g.moveTo(Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62); g.lineTo(Math.cos(a) * R * 0.76, Math.sin(a) * R * 0.76); line(g, i > 7 ? pal.a3 : glow, R * 0.05); }
  g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(needle) * R * 0.6, Math.sin(needle) * R * 0.6); g.lineCap = 'round'; line(g, pal.a3, R * 0.07);
  g.beginPath(); g.arc(0, 0, R * 0.1, 0, TAU); g.fillStyle = css(pal.b2); g.fill();
}

function plate(g, x, y, w, h, pal, c) {
  rr(g, x, y, w, h, 7); g.fillStyle = metalFill(g, y, y + h, c, 0.12); g.fill(); line(g, pal.dark, 1.8);
  rr(g, x + 3, y + 3, w - 6, h - 6, 5); line(g, [255, 255, 255], 1, 0.25);
  for (const [px, py] of [[x + 8, y + 8], [x + w - 8, y + 8], [x + 8, y + h - 8], [x + w - 8, y + h - 8]]) rivet(g, px, py, 2.6, pal);
}

function circuitBg(g, rng, B, pal, n) {
  for (let i = 0; i < n; i++) trace(g, rng, B.x + rng.int(0, Math.floor(B.w / 12)) * 12 + 6, B.y + rng.int(0, Math.floor(B.h / 12)) * 12 + 6, rng.int(3, 7), mix(pal.bg2, pal.dark, 0.35), 2, 0.8);
  // сетка мелких винтов
  for (let y = B.y + 14; y < B.y + B.h; y += 24) for (let x = B.x + 14 + ((y - B.y) / 24 % 2) * 12; x < B.x + B.w; x += 24) { g.beginPath(); g.arc(x, y, 1.4, 0, TAU); g.fillStyle = css(pal.dark, 0.3); g.fill(); }
}

function walk(step, margin, fn) {
  const o = 24, W = CW - 2 * o, H = CH - 2 * o;
  const sides = [[o, o, 1, 0, W, 0], [o + W, o, 0, 1, H, Math.PI / 2], [o + W, o + H, -1, 0, W, Math.PI], [o, o + H, 0, -1, H, -Math.PI / 2]];
  let idx = 0;
  for (const [sx, sy, dx, dy, len, ang] of sides) {
    const n = Math.max(1, Math.round((len - 2 * margin) / step));
    for (let i = 0; i < n; i++) { const t = margin + ((i + 0.5) / n) * (len - 2 * margin); fn(sx + dx * t, sy + dy * t, ang, idx++); }
  }
}

function border(g, pal, rng, variant) {
  const x0 = 6, band = 36;
  g.fillStyle = css(pal.b1); g.fillRect(0, 0, CW, CH);
  // перфорация / шестигранная сетка в кайме
  g.save(); g.beginPath(); g.rect(0, 0, CW, CH); g.rect(x0 + 3, x0 + 3, CW - 2 * x0 - 6, CH - 2 * x0 - 6); g.clip('evenodd');
  g.strokeStyle = css(lighten(pal.b1, 0.14), 0.7); g.lineWidth = 1;
  for (let y = 0; y < CH; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(CW, y); g.stroke(); }
  g.restore();
  for (const [o, w, c] of [[x0, 2.5, pal.b2], [x0 + 3.5, 1.5, pal.dark], [x0 + band, 1.5, pal.dark], [x0 + band + 3, 2.5, pal.b2]]) { g.strokeStyle = css(c); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); }
  const m = x0 + band / 2 + 2;
  // дорожка схемы по центру каймы
  g.strokeStyle = css(pal.a2, 0.85); g.lineWidth = 2; g.lineJoin = 'round'; g.strokeRect(m, m, CW - 2 * m, CH - 2 * m);
  g.strokeStyle = css(pal.dark, 0.6); g.lineWidth = 0.8; g.strokeRect(m - 2, m - 2, CW - 2 * m + 4, CH - 2 * m + 4);
  walk(26, 31, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    const k = i % 4;
    if (k === 0) { g.rotate(i * 0.7); gear(g, 11, 10, pal.metal, pal, 0, 0); }
    else if (k === 2) { lamp(g, 0, 0, 4.2, [pal.a1, pal.a2, pal.a3][(i >> 2) % 3], pal); }
    else if (variant === 1 && k === 1) { rr(g, -9, -6, 18, 12, 3); g.fillStyle = css(pal.dark); g.fill(); line(g, pal.b2, 1); for (let j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(j * 4, -3); g.lineTo(j * 4, 3); line(g, pal.a2, 1.4); } }
    else bolt(g, 0, 0, 5.2, pal, i);
    g.restore();
  });
  const cc = x0 + band / 2 + 2;
  [[cc, cc], [CW - cc, cc], [cc, CH - cc], [CW - cc, CH - cc]].forEach(([x, y], i) => {
    g.save(); g.translate(x, y); g.rotate(i * 0.4);
    gear(g, 18, 12, pal.metal, pal, 6, 0); g.restore();
    lamp(g, x, y, 4, pal.a1, pal);
  });
  return x0 + band + 7;
}

// ---- Композиции ----

function compFace(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2 - 30;
  circuitBg(g, rng.fork('c'), B, pal, 30);
  // большая шестерня позади головы
  if (rng.chance(0.5)) { g.save(); g.translate(cx, cy); g.rotate(rng.range(0, 1)); g.globalAlpha = 0.55; gear(g, 128, 22, mix(pal.bg2, pal.b1, 0.3), pal, 0, 0); g.globalAlpha = 1; g.restore(); }
  else { g.save(); g.translate(cx, cy); for (let i = 0; i < 28; i++) { g.rotate(TAU / 28); g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -330); g.lineTo(9, -330); g.closePath(); g.fillStyle = css(i % 2 ? pal.bg2 : pal.b1, 0.35); g.fill(); } g.beginPath(); g.arc(0, 0, 118, 0, TAU); g.fillStyle = css(pal.dark, 0.35); g.fill(); line(g, pal.b2, 3, 0.8); g.restore(); }
  // шестерни в верхних углах
  for (const sx of [-1, 1]) { g.save(); g.translate(cx + sx * 96, B.y + 44); g.rotate(rng.range(0, 1)); gear(g, 38, 14, sx > 0 ? pal.metal : pal.b2, pal, 5, 0); g.restore(); }
  for (let i = 0; i < 4; i++) lamp(g, cx + (i - 1.5) * 24, B.y + 30, 6, [pal.a1, pal.a2, pal.a3][i % 3], pal, rng.chance(0.8));
  // корпус
  const cyH = cy + 22;
  const chestTop = B.y + B.h - 78 - 50;
  rr(g, cx - 20, cyH + 30, 40, chestTop - cyH - 28, 5); g.fillStyle = metalFill(g, cyH, chestTop, darken(pal.metal, 0.3), 0.15); g.fill(); line(g, pal.dark, 2);
  for (let yy = cyH + 62; yy < chestTop - 4; yy += 9) { g.beginPath(); g.moveTo(cx - 20, yy); g.lineTo(cx + 20, yy); line(g, pal.dark, 1.2, 0.6); }
  g.save(); g.translate(cx, B.y + B.h - 78);
  for (const sx of [-1, 1]) { g.save(); g.translate(sx * 104, -26); g.rotate(rng.range(0, 1)); gear(g, 22, 10, pal.metal, pal, 0, 6); g.restore(); }
  rr(g, -86, -50, 172, 118, 16); g.fillStyle = metalFill(g, -50, 68, pal.b2, 0.12); g.fill(); line(g, pal.dark, 2.4);
  rr(g, -78, -42, 156, 102, 11); line(g, [255, 255, 255], 1, 0.3);
  for (const [px, py] of [[-72, -36], [72, -36], [-72, 54], [72, 54]]) rivet(g, px, py, 3, pal);
  g.save(); g.translate(-38, 6); dial(g, 30, pal, pal.a2, rng.range(-0.2, 1.2)); g.restore();
  for (let i = 0; i < 3; i++) lamp(g, 18 + i * 20, -16, 5.5, [pal.a1, pal.a2, pal.a3][(i + rng.int(0, 2)) % 3], pal, rng.chance(0.85));
  rr(g, 8, 4, 64, 36, 5); g.fillStyle = css(pal.dark); g.fill();
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(16 + i * 12, 9); g.lineTo(16 + i * 12, 35); line(g, pal.a2, 2.4, 0.9); }
  g.restore();
  // голова
  g.save(); g.translate(cx, cyH);
  const kind = rng.int(0, 3);
  robot(g, 150, kind, pal.metal, rng.pick([pal.a1, pal.a2, pal.a3]), pal, rng, {});
  g.restore();
}

function compGrid(g, rng, pal, B) {
  circuitBg(g, rng.fork('c'), B, pal, 14);
  const cols = 2, rows = 3, gap = 8;
  const cw = (B.w - gap * 3) / cols, ch = (B.h - gap * 4) / rows;
  const colors = [pal.metal, lighten(pal.metal, 0.2), mix(pal.metal, pal.a1, 0.35), mix(pal.metal, pal.a2, 0.35), mix(pal.metal, pal.a3, 0.3), mix(pal.metal, pal.b2, 0.4)];
  const kinds = rng.shuffle([0, 1, 2, 3, 0, 1, 2, 3]).slice(0, 6);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = B.x + gap + c * (cw + gap), y = B.y + gap + r * (ch + gap), i = r * cols + c;
    plate(g, x, y, cw, ch, pal, mix(pal.bg, pal.b1, 0.35));
    g.save(); rr(g, x + 10, y + 10, cw - 20, ch - 20, 6); g.clip();
    g.fillStyle = css(mix(pal.bg2, pal.dark, 0.25)); g.fillRect(x, y, cw, ch);
    g.fillStyle = css(pal.dark, 0.2); for (let k = 0; k < 14; k++) g.fillRect(x + 10, y + 10 + k * 12, cw, 1.5);
    g.restore();
    g.save(); g.translate(x + cw / 2, y + ch / 2 + 6); robot(g, Math.min(cw * 0.66, ch * 0.6), kinds[i], colors[(i + rng.int(0, 2)) % 6], [pal.a1, pal.a2, pal.a3][(i + r) % 3], pal, rng.fork('r' + i), {}); g.restore();
    // подпись-лампочки
    for (let k = 0; k < 3; k++) lamp(g, x + cw / 2 + (k - 1) * 12, y + ch - 14, 2.6, [pal.a1, pal.a2, pal.a3][k], pal, true);
  }
}

function compMachine(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2;
  circuitBg(g, rng.fork('c'), B, pal, 26);
  // шестерни-цепочка сверху и снизу
  const rot = rng.range(0, 1);
  const chain = [[-76, -178, 40], [4, -178 - 6, 26], [-76 + 0, 176, 36], [58, 190, 30]];
  for (const sy of [-1, 1]) {
    g.save(); g.translate(cx - 60, cy + sy * 178); g.rotate(rot); gear(g, 40, 14, pal.metal, pal, 5, 0); g.restore();
    g.save(); g.translate(cx + 28, cy + sy * 190); g.rotate(-rot * 1.5); gear(g, 26, 10, pal.b2, pal, 0, 6); g.restore();
    g.save(); g.translate(cx + 84, cy + sy * 160); g.rotate(rot * 0.5); gear(g, 22, 9, pal.metal, pal, 0, 0); g.restore();
  }
  // медальон: большая шестерня с головой
  g.save(); g.translate(cx, cy); g.rotate(rot * 0.3);
  gear(g, 112, 24, mix(pal.metal, pal.b1, 0.25), pal, 0, 0);
  g.restore();
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.arc(0, 0, 84, 0, TAU); g.fillStyle = css(pal.dark); g.fill(); line(g, pal.b2, 3);
  for (let i = 0; i < 16; i++) { const a = i * TAU / 16; lamp(g, Math.cos(a) * 94 * 0.9, Math.sin(a) * 94 * 0.9, 3.4, [pal.a1, pal.a2, pal.a3][i % 3], pal, true); }
  g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.fillStyle = css(mix(pal.bg2, pal.dark, 0.3)); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.clip();
  g.fillStyle = css(pal.a2, 0.1); for (let yy = -70; yy < 70; yy += 5) g.fillRect(-70, yy, 140, 2);
  g.restore();
  g.translate(0, 8); robot(g, 96, rng.int(0, 3), pal.metal, rng.pick([pal.a1, pal.a2, pal.a3]), pal, rng, {});
  g.restore();
  // боковые лампы/болты
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const y = cy - 80 + i * 40; if (Math.abs(y - cy) < 12 && false) continue; bolt(g, cx + sx * 120, y, 4.6, pal, i); }
}

export default {
  id: 'robots',
  name: 'Роботы',
  paint(g, rng0) {
    const rng = new RNG(hashString(rng0.s + ':robots'));
    const pal = pickPalette(rng, PALS);
    const variant = rng.int(0, 2);
    const inset = border(g, pal, rng, variant);
    const B = { x: inset, y: inset, w: CW - 2 * inset, h: CH - 2 * inset };
    const gr = g.createLinearGradient(B.x, B.y, B.x + B.w, B.y + B.h); gr.addColorStop(0, css(lighten(pal.bg, 0.1))); gr.addColorStop(1, css(darken(pal.bg, 0.1)));
    g.fillStyle = gr; g.fillRect(B.x, B.y, B.w, B.h);
    g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
    // тонкая «шлифовка» металла
    g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1;
    for (let y = B.y; y < B.y + B.h; y += 3) { g.beginPath(); g.moveTo(B.x, y); g.lineTo(B.x + B.w, y); g.stroke(); }
    [compFace, compGrid, compMachine][variant](g, rng.fork('comp'), pal, B);
    g.restore();
    g.strokeStyle = css(pal.dark); g.lineWidth = 2; g.strokeRect(B.x - 1, B.y - 1, B.w + 2, B.h + 2);
    return { edge: pal.edge, fringe: mix(pal.b2, pal.metal, 0.5) };
  },
};
