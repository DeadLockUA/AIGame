// Марокканский: бени-уарейн (кремовая шерсть, ромбовая решётка тонких линий, берберские знаки)
// и цветной вариант «зеллидж» (мозаика из восьмиконечных звёзд).
import { CW, CH, css, mix, lighten, darken, star, ngon, lozenge, pickPalette } from '../kit.js';

const BENI = [
  { field: [238, 230, 210], ink: [48, 42, 40], acc: [150, 92, 52], shade: [214, 202, 176] },
  { field: [244, 238, 224], ink: [76, 52, 40], acc: [170, 118, 62], shade: [222, 210, 186] },
  { field: [214, 206, 190], ink: [40, 38, 40], acc: [120, 74, 48], shade: [190, 180, 160] },
  { field: [62, 58, 58], ink: [236, 228, 210], acc: [200, 152, 84], shade: [44, 40, 40] },
  { field: [232, 220, 196], ink: [38, 52, 86], acc: [172, 92, 62], shade: [208, 192, 164] },
  { field: [202, 202, 198], ink: [44, 44, 48], acc: [142, 82, 60], shade: [176, 176, 170] },
];

const ZELL = [
  { a: [30, 84, 146], b: [42, 152, 162], c: [240, 232, 212], d: [44, 124, 84], e: [228, 180, 60], f: [172, 72, 52], dark: [22, 32, 54], grout: [236, 226, 200] },
  { a: [150, 40, 42], b: [240, 230, 208], c: [34, 112, 82], d: [30, 78, 140], e: [226, 176, 58], f: [38, 40, 52], dark: [36, 18, 20], grout: [232, 222, 196] },
  { a: [38, 110, 80], b: [240, 232, 212], c: [30, 40, 56], d: [196, 150, 52], e: [180, 64, 50], f: [50, 140, 150], dark: [18, 30, 24], grout: [236, 226, 200] },
  { a: [60, 44, 110], b: [232, 214, 170], c: [52, 150, 150], d: [196, 66, 60], e: [236, 226, 204], f: [226, 170, 56], dark: [24, 16, 46], grout: [234, 224, 198] },
];

function wline(g, x1, y1, x2, y2, lw, col, rng, amp = 1.2) {
  const mx = (x1 + x2) / 2 + rng.range(-amp, amp), my = (y1 + y2) / 2 + rng.range(-amp, amp);
  g.lineWidth = lw * rng.range(0.85, 1.15);
  g.strokeStyle = css(col); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
}

function wool(g, rng, pal, count) {
  const dk = [], lt = [];
  for (let i = 0; i < count; i++) {
    const x = rng.range(0, CW), y = rng.range(0, CH);
    const a = rng.range(-0.7, 0.7) + Math.PI / 2, l = rng.range(3, 8);
    (i % 2 ? dk : lt).push([x, y, Math.cos(a) * l, Math.sin(a) * l, rng.range(-2, 2)]);
  }
  const dark = pal.field[0] > 120;
  g.lineWidth = 0.9; g.lineCap = 'round';
  for (const [arr, col] of [[dk, dark ? 'rgba(90,70,40,0.20)' : 'rgba(230,230,220,0.28)'], [lt, dark ? 'rgba(255,250,235,0.35)' : 'rgba(30,26,22,0.14)']]) {
    g.strokeStyle = col; g.beginPath();
    for (const [x, y, dx, dy, c] of arr) { g.moveTo(x, y); g.quadraticCurveTo(x + dx / 2 + c, y + dy / 2, x + dx, y + dy); }
    g.stroke();
  }
}

function blotches(g, rng, pal, n) {
  for (let i = 0; i < n; i++) {
    const x = rng.range(0, CW), y = rng.range(0, CH), r = rng.range(50, 130);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const c = rng.chance(0.5) ? pal.shade : lighten(pal.field, 0.25);
    gr.addColorStop(0, css(c, 0.5)); gr.addColorStop(1, css(c, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// ---- берберские знаки ----
function sign(g, kind, x, y, s, col, lw, rng) {
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  const w = (a, b, c, d) => wline(g, x + a, y + b, x + c, y + d, lw, col, rng, 0.6);
  switch (kind) {
    case 0: w(-s, -s, s, s); w(-s, s, s, -s); break; // X
    case 1: w(-s, 0, s, 0); w(0, -s, 0, s); break; // +
    case 2: // три точки
      g.fillStyle = css(col);
      for (const dx of [-s * 0.9, 0, s * 0.9]) { g.beginPath(); g.arc(x + dx, y, lw * 0.9, 0, 7); g.fill(); }
      break;
    case 3: { // ромб с точкой
      g.strokeStyle = css(col); g.lineWidth = lw;
      lozenge(g, x, y, s * 0.9, s * 1.2); g.stroke();
      g.fillStyle = css(col); g.beginPath(); g.arc(x, y, lw * 0.9, 0, 7); g.fill();
      break;
    }
    case 4: // зигзаг
      for (let i = 0; i < 4; i++) w(-s * 1.2 + i * s * 0.6, i % 2 ? s * 0.6 : -s * 0.6, -s * 1.2 + (i + 1) * s * 0.6, i % 2 ? -s * 0.6 : s * 0.6);
      break;
    case 5: w(-s, -s * 0.6, s, -s * 0.6); w(-s, 0, s, 0); w(-s, s * 0.6, s, s * 0.6); break; // три линии
    case 6: { // вложенные ромбы
      g.strokeStyle = css(col); g.lineWidth = lw * 0.9;
      lozenge(g, x, y, s * 1.1, s * 1.5); g.stroke();
      lozenge(g, x, y, s * 0.55, s * 0.8); g.stroke();
      break;
    }
    case 7: { // «глаз»: две дуги и точка
      g.strokeStyle = css(col); g.lineWidth = lw;
      g.beginPath(); g.moveTo(x - s * 1.2, y); g.quadraticCurveTo(x, y - s * 1.3, x + s * 1.2, y); g.quadraticCurveTo(x, y + s * 1.3, x - s * 1.2, y); g.stroke();
      g.fillStyle = css(col); g.beginPath(); g.arc(x, y, lw * 1.1, 0, 7); g.fill();
      break;
    }
    case 8: // гребень
      w(-s, s * 0.8, s, s * 0.8);
      for (let i = -2; i <= 2; i++) w(i * s * 0.45, s * 0.8, i * s * 0.45, -s * 0.5);
      break;
    default: g.fillStyle = css(col); lozenge(g, x, y, s * 0.7, s * 0.95); g.fill();
  }
  g.restore();
}

// ---- бени-уарейн ----
function beni(g, rng, pal, variant) {
  g.fillStyle = css(pal.field); g.fillRect(0, 0, CW, CH);
  blotches(g, rng, pal, 14);
  const ink = pal.ink;
  const mx = 20, my = 20;
  const lw = variant === 1 ? 3.4 : 2.7;
  g.lineCap = 'round'; g.lineJoin = 'round';

  if (variant === 2) { beniChevrons(g, rng, pal); wool(g, rng, pal, 2200); return; }

  const cols = variant === 1 ? rng.pick([2, 3]) : rng.pick([3, 3, 4]);
  const W = CW - 2 * mx, H = CH - 2 * my;
  const w = W / cols;
  const rows = Math.max(2, Math.round(H / (w * rng.range(1.35, 1.7))));
  const h = H / rows;
  const node = (i, j) => [mx + (i * w) / 2 + nj(i, j, 0), my + (j * h) / 2 + nj(i, j, 1)];
  const jt = new Map();
  const nj = (i, j, k) => {
    const key = i * 1000 + j * 2 + k;
    if (!jt.has(key)) jt.set(key, rng.range(-2.2, 2.2));
    const edge = i === 0 || i === cols * 2 || j === 0 || j === rows * 2;
    return edge ? 0 : jt.get(key);
  };
  // заливка редких ромбов
  const fills = [];
  const centers = [];
  for (let j = 1; j < rows * 2; j++) for (let i = 1; i < cols * 2; i++) if ((i + j) % 2 === 1) centers.push([i, j]);
  if (variant === 1 || rng.chance(0.4)) {
    const cnt = variant === 1 ? rng.int(2, 4) : rng.int(1, 3);
    for (const [i, j] of rng.shuffle(centers)) {
      if (fills.length >= cnt) break;
      if (fills.every(([a, b]) => Math.abs(a - i) > 1 || Math.abs(b - j) > 1)) fills.push([i, j]);
    }
  }
  for (const [i, j] of fills) {
    const p = [node(i - 1, j), node(i, j - 1), node(i + 1, j), node(i, j + 1)];
    g.beginPath(); g.moveTo(...p[0]); for (let k = 1; k < 4; k++) g.lineTo(...p[k]); g.closePath();
    g.fillStyle = css(rng.chance(0.55) ? ink : pal.acc, 0.88); g.fill();
    // светлый ромбик внутри
    const [cx, cy] = [mx + (i * w) / 2, my + (j * h) / 2];
    g.strokeStyle = css(pal.field, 0.9); g.lineWidth = 1.6;
    lozenge(g, cx, cy, w * 0.2, h * 0.2); g.stroke();
  }
  // линии решётки
  g.strokeStyle = css(ink);
  for (let j = 0; j < rows * 2; j++) for (let i = 0; i <= cols * 2; i++) {
    if ((i + j) % 2) continue;
    for (const di of [-1, 1]) {
      const i2 = i + di, j2 = j + 1;
      if (i2 < 0 || i2 > cols * 2) continue;
      if (rng.chance(0.035) && j > 0 && j < rows * 2 - 1) continue; // случайный пропуск
      const [x1, y1] = node(i, j), [x2, y2] = node(i2, j2);
      wline(g, x1, y1, x2, y2, lw, ink, rng, 1.6);
      if (variant === 1) {
        // вторая тонкая линия рядом
        const nx = (y2 - y1), ny = -(x2 - x1); const l = Math.hypot(nx, ny);
        const o = 5.5;
        wline(g, x1 + (nx / l) * o * di, y1 + (ny / l) * o * di, x2 + (nx / l) * o * di, y2 + (ny / l) * o * di, lw * 0.45, ink, rng, 1);
      }
    }
  }
  // знаки
  const kinds = rng.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, rng.int(3, 5));
  const fillSet = new Set(fills.map((f) => f[0] * 1000 + f[1]));
  for (const [i, j] of centers) {
    const key = i * 1000 + j;
    const [cx, cy] = [mx + (i * w) / 2, my + (j * h) / 2];
    const s = Math.min(w, h) * (variant === 1 ? 0.13 : 0.1);
    if (fillSet.has(key)) continue;
    if (variant === 1) {
      if (rng.chance(0.55)) sign(g, 6, cx, cy, Math.min(w, h) * 0.22, ink, lw * 0.8, rng);
      else sign(g, rng.pick(kinds), cx, cy, s, rng.chance(0.2) ? pal.acc : ink, lw * 0.8, rng);
    } else if (rng.chance(0.38)) {
      sign(g, rng.pick(kinds), cx, cy, s, rng.chance(0.18) ? pal.acc : ink, lw * 0.75, rng);
    } else if (rng.chance(0.2)) {
      sign(g, 3, cx, cy, s, ink, lw * 0.7, rng);
    }
  }
  // рамка (двойная линия) и торцевые полосы
  g.strokeStyle = css(ink);
  for (const [o, k] of [[mx - 8, 1], [mx - 13, 0.55]]) {
    g.lineWidth = lw * k;
    g.beginPath(); g.rect(o, o, CW - 2 * o, CH - 2 * o); g.stroke();
  }
  // короткие торцевые полоски
  for (const y of [28, 36]) {
    // нет: оставляем поле чистым
  }
  wool(g, rng, pal, 2400);
}

// Полосы-«шевроны» (азилаль)
function beniChevrons(g, rng, pal) {
  const ink = pal.ink;
  const mx = 20;
  let y = 24;
  const amp = [10, 16, 22];
  let idx = 0;
  g.lineJoin = 'round';
  while (y < CH - 40) {
    const bandH = rng.pick([46, 62, 78]);
    const a = rng.pick(amp);
    const p = rng.pick([30, 40, 52]);
    const nZ = Math.round((CW - 2 * mx) / p);
    const pp = (CW - 2 * mx) / nZ;
    // заливка полосы тоном
    if (idx % 2 === 0) {
      g.fillStyle = css(pal.shade, 0.9);
      g.beginPath(); g.moveTo(mx, y);
      for (let k = 0; k <= nZ; k++) g.lineTo(mx + k * pp, y + (k % 2 ? a : 0));
      for (let k = nZ; k >= 0; k--) g.lineTo(mx + k * pp, y + bandH + (k % 2 ? a : 0));
      g.closePath(); g.fill();
    }
    for (const dy of [0, bandH]) {
      g.strokeStyle = css(ink); g.lineWidth = 2.6; g.lineCap = 'round';
      g.beginPath();
      for (let k = 0; k <= nZ; k++) {
        const px = mx + k * pp, py = y + dy + (k % 2 ? a : 0) + rng.range(-1, 1);
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
    }
    g.strokeStyle = css(ink, 0.75); g.lineWidth = 1.3;
    g.beginPath();
    for (let k = 0; k <= nZ; k++) {
      const px = mx + k * pp, py = y + bandH * 0.5 - a * 0.5 + (k % 2 ? a : 0);
      if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
    // знаки в зубцах
    for (let k = 0; k < nZ; k++) {
      if (rng.chance(0.5)) sign(g, rng.pick([0, 2, 3, 6, 7, 9]), mx + (k + 0.5) * pp, y + bandH * 0.25 + a * 0.25, 5, rng.chance(0.2) ? pal.acc : ink, 2, rng);
      if (rng.chance(0.4)) sign(g, rng.pick([0, 3, 7, 9]), mx + (k + 0.5) * pp, y + bandH * 0.75 + a * 0.25, 5, rng.chance(0.2) ? pal.acc : ink, 2, rng);
    }
    y += bandH + a + rng.pick([8, 14]);
    idx++;
  }
  g.strokeStyle = css(ink); g.lineWidth = 2;
  g.strokeRect(12, 12, CW - 24, CH - 24);
}

// ---- зеллидж ----
function tileStar(g, x, y, r, c1, c2, c3, grout) {
  star(g, x, y, r, r * 0.62, 8, -Math.PI / 8);
  g.fillStyle = css(c1); g.fill();
  g.lineWidth = 1.4; g.strokeStyle = css(grout); g.stroke();
  star(g, x, y, r * 0.55, r * 0.34, 8, 0);
  g.fillStyle = css(c2); g.fill();
  g.lineWidth = 1; g.strokeStyle = css(grout, 0.9); g.stroke();
  ngon(g, x, y, r * 0.2, 8, -Math.PI / 8);
  g.fillStyle = css(c3); g.fill();
}

function zellij(g, rng, pal, variant) {
  g.fillStyle = css(pal.dark); g.fillRect(0, 0, CW, CH);
  const colors = [pal.a, pal.b, pal.c, pal.d, pal.e, pal.f];
  // рамка
  const B = 40;
  g.fillStyle = css(pal.a); g.fillRect(8, 8, CW - 16, CH - 16);
  const bgBorder = rng.pick([pal.d, pal.a, pal.f]);
  g.fillStyle = css(bgBorder); g.fillRect(8, 8, CW - 16, CH - 16);
  const strips = [
    [8 + B / 2 + 0, 8 + B / 2, CW - 16 - B, CH - 16 - B],
  ];
  const sc = rng.pick([pal.b, pal.e, pal.c]);
  const starC = rng.pick([pal.e, pal.c]);
  // зигзаг-плитки вдоль каймы
  const run = (tx, ty, ang, len) => {
    g.save(); g.translate(tx, ty); g.rotate(ang);
    const cnt = Math.round(len / 26);
    const tw = len / cnt;
    for (let i = 0; i < cnt; i++) {
      const x = (i + 0.5) * tw;
      // два треугольника зубцами
      g.beginPath(); g.moveTo(x - tw / 2, 0); g.lineTo(x + tw / 2, 0); g.lineTo(x, 13); g.closePath();
      g.fillStyle = css(i % 2 ? pal.c : sc); g.fill(); g.strokeStyle = css(pal.grout); g.lineWidth = 1; g.stroke();
      g.beginPath(); g.moveTo(x - tw / 2, 28); g.lineTo(x + tw / 2, 28); g.lineTo(x, 15); g.closePath();
      g.fillStyle = css(i % 2 ? sc : pal.c); g.fill(); g.stroke();
      // звезда-плитка
    }
    for (let i = 0; i <= cnt; i++) {
      // ромбы на стыках
      lozenge(g, i * tw, 14, 5, 7); g.fillStyle = css(starC); g.fill(); g.strokeStyle = css(pal.dark, 0.6); g.lineWidth = 0.8; g.stroke();
    }
    g.restore();
  };
  const L = CW - 16 - 2 * 6, H = CH - 16 - 2 * 6;
  g.save(); g.beginPath(); g.rect(8, 8, CW - 16, CH - 16); g.clip();
  run(14, 12, 0, CW - 28);
  run(CW - 12, 14, Math.PI / 2, CH - 28);
  run(CW - 14, CH - 12, Math.PI, CW - 28);
  run(12, CH - 14, -Math.PI / 2, CH - 28);
  g.restore();
  // линии рамки
  g.strokeStyle = css(pal.grout); g.lineWidth = 3; g.strokeRect(8 + B - 3, 8 + B - 3, CW - 2 * (8 + B - 3), CH - 2 * (8 + B - 3));
  g.strokeStyle = css(pal.dark); g.lineWidth = 1.5; g.strokeRect(8 + B - 6, 8 + B - 6, CW - 2 * (8 + B - 6), CH - 2 * (8 + B - 6));
  g.strokeStyle = css(pal.grout); g.lineWidth = 2; g.strokeRect(9, 9, CW - 18, CH - 18);

  const fx = 8 + B, fy = 8 + B, fw = CW - 2 * fx, fh = CH - 2 * fy;
  const cols = rng.pick([3, 4]);
  const px = fw / cols;
  const rows = Math.round(fh / px);
  const py = fh / rows;
  g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
  const bgA = rng.pick([pal.a, pal.c, pal.b]);
  let bgB = rng.pick([pal.d, pal.f, pal.b]);
  if (bgB === bgA) bgB = pal.dark;
  const chess = rng.chance(0.6);
  const sc1 = rng.pick([pal.e, pal.c, pal.b]);
  const sc2 = rng.pick([pal.f, pal.d, pal.a]);
  // фон плиток
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    g.fillStyle = css(chess && (i + j) % 2 ? bgB : bgA);
    g.fillRect(fx + i * px, fy + j * py, px + 0.5, py + 0.5);
  }
  g.strokeStyle = css(pal.dark, 0.16); g.lineWidth = 1;
  g.beginPath();
  for (let d = -fh; d < fw + fh; d += 9) { g.moveTo(fx + d, fy); g.lineTo(fx + d + fh, fy + fh); g.moveTo(fx + d, fy + fh); g.lineTo(fx + d + fh, fy); }
  g.stroke();
  // мелкие вставки в узлах решётки
  g.save(); g.translate(0, 0);
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const x = fx + i * px, y = fy + j * py;
    g.save(); g.translate(x, y); g.scale(1, py / px);
    star(g, 0, 0, px * 0.24, px * 0.08, 4, 0);
    g.fillStyle = css(rng.pick([pal.e, pal.f, pal.d])); g.fill();
    g.lineWidth = 1; g.strokeStyle = css(pal.grout); g.stroke();
    g.restore();
  }
  g.restore();
  // звёзды
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = fx + (i + 0.5) * px, y = fy + (j + 0.5) * py;
    g.save(); g.translate(x, y); g.scale(1, py / px);
    const alt = (i + j) % 2;
    // четырёхугольные розетки-лучи: подложка
    star(g, 0, 0, px * 0.5, px * 0.4, 8, -Math.PI / 8);
    g.fillStyle = css(alt && chess ? sc2 : sc1, 0.0); g.fill();
    tileStar(g, 0, 0, px * 0.46, alt ? sc2 : sc1, alt ? sc1 : sc2, rng.pick([pal.dark, pal.e, pal.f]), pal.grout);
    g.restore();
  }
  // центральный медальон (вариант 1)
  if (variant === 1) {
    const cx = CW / 2, cy = CH / 2;
    const R = Math.min(fw * 0.46, 120);
    g.save(); g.translate(cx, cy);
    g.beginPath(); g.arc(0, 0, R * 0.7, 0, 7); g.fillStyle = css(pal.dark); g.fill();
    star(g, 0, 0, R, R * 0.64, 16, 0); g.fillStyle = css(pal.b); g.fill(); g.lineWidth = 2; g.strokeStyle = css(pal.grout); g.stroke();
    star(g, 0, 0, R * 0.78, R * 0.46, 8, 0); g.fillStyle = css(pal.a); g.fill(); g.stroke();
    star(g, 0, 0, R * 0.56, R * 0.34, 8, Math.PI / 8); g.fillStyle = css(pal.e); g.fill(); g.lineWidth = 1.4; g.stroke();
    star(g, 0, 0, R * 0.34, R * 0.2, 8, 0); g.fillStyle = css(pal.f); g.fill(); g.stroke();
    ngon(g, 0, 0, R * 0.13, 8); g.fillStyle = css(pal.c); g.fill();
    g.restore();
  }
  g.restore();
  // сетка швов
  g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
  g.strokeStyle = css(pal.grout, 0.85); g.lineWidth = 1.2;
  for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(fx + i * px, fy); g.lineTo(fx + i * px, fy + fh); g.stroke(); }
  for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(fx, fy + j * py); g.lineTo(fx + fw, fy + j * py); g.stroke(); }
  g.restore();
}

export default {
  id: 'moroccan',
  name: 'Марокканский',
  paint(g, rng) {
    const zel = rng.chance(0.38);
    if (zel) {
      const pal = pickPalette(rng, ZELL);
      zellij(g, rng.fork('z'), pal, rng.int(0, 1));
      return { edge: mix(pal.dark, pal.a, 0.4), fringe: [236, 226, 200] };
    }
    const pal = pickPalette(rng, BENI);
    const variant = rng.pick([0, 0, 0, 1, 1, 2]);
    beni(g, rng.fork('b'), pal, variant);
    const dark = pal.field[0] < 120;
    return { edge: dark ? [34, 30, 30] : mix(pal.ink, pal.field, 0.35), fringe: dark ? [210, 202, 184] : [244, 238, 222] };
  },
};
