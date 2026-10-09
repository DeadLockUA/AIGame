// Японский ковёр: сэйгайха, асаноха, облака кумо, сакура, золотые нити на тёмном индиго/красном; дзен-вариант.
import { CW, CH, css, darken, lighten, mix, pickPalette } from '../kit.js';

const PALS = [
  { bg: [20, 34, 74], bg2: [32, 52, 104], deep: [10, 18, 44], gold: [222, 184, 100], light: [244, 234, 208], accent: [240, 170, 188], leaf: [86, 130, 110], edge: [14, 22, 52] },
  { bg: [112, 22, 30], bg2: [146, 36, 42], deep: [58, 10, 16], gold: [230, 192, 106], light: [246, 234, 206], accent: [248, 196, 206], leaf: [96, 120, 84], edge: [70, 12, 18] },
  { bg: [30, 30, 40], bg2: [48, 50, 66], deep: [14, 14, 22], gold: [212, 176, 104], light: [238, 230, 214], accent: [226, 120, 140], leaf: [110, 140, 120], edge: [18, 18, 26] },
  { bg: [24, 66, 70], bg2: [38, 94, 96], deep: [10, 38, 42], gold: [232, 196, 118], light: [246, 238, 214], accent: [244, 170, 160], leaf: [160, 190, 130], edge: [12, 44, 48] },
  { bg: [60, 36, 84], bg2: [86, 56, 116], deep: [30, 16, 48], gold: [226, 190, 110], light: [244, 234, 220], accent: [246, 186, 200], leaf: [120, 150, 120], edge: [36, 20, 56] },
  { bg: [226, 214, 190], bg2: [208, 192, 160], deep: [38, 46, 92], gold: [176, 124, 48], light: [250, 244, 228], accent: [214, 100, 112], leaf: [84, 114, 90], edge: [120, 36, 40], ink: [34, 40, 76] },
];

const TAU = Math.PI * 2;

function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }

// Сэйгайха: чешуйчатые волны. cols — набор цветов от тёмного к светлому колец.
function seigaiha(g, x0, y0, w, h, r, pal, rng, opt = {}) {
  const rows = Math.ceil(h / (r * 0.5)) + 3;
  const cols = Math.ceil(w / (2 * r)) + 2;
  const rings = [pal.bg, pal.bg2, mix(pal.bg2, pal.light, 0.18), pal.bg2];
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  for (let j = 0; j < rows; j++) {
    const cy = y0 + j * r * 0.5;
    for (let i = -1; i < cols; i++) {
      const cx = x0 + i * 2 * r + (j % 2 ? r : 0);
      const tint = opt.tint ? opt.tint(cx, cy, i, j) : 0;
      circle(g, cx, cy, r); g.fillStyle = css(mix(pal.deep, pal.bg, 0.5 + tint)); g.fill();
      g.lineWidth = Math.max(0.8, r * 0.07); g.strokeStyle = css(pal.gold, opt.goldA ?? 0.9); g.stroke();
      const n = 4;
      for (let k = 1; k < n; k++) {
        const rr = r * (1 - k / n);
        circle(g, cx, cy, rr);
        g.fillStyle = css(mix(rings[k % 2 ? 1 : 0], pal.light, k === 2 ? 0.1 + tint : 0));
        g.fill();
        g.lineWidth = Math.max(0.6, r * 0.045); g.strokeStyle = css(pal.gold, (opt.goldA ?? 0.9) * 0.8); g.stroke();
      }
      circle(g, cx, cy, r * 0.12); g.fillStyle = css(pal.gold, 0.9); g.fill();
    }
  }
  g.restore();
}

// Асаноха: узор конопляного листа на треугольной сетке.
function asanoha(g, x0, y0, w, h, s, pal, fillA = 1, lineA = 0.85) {
  const hh = (s * Math.sqrt(3)) / 2;
  const rows = Math.ceil(h / hh) + 2, cols = Math.ceil(w / s) + 2;
  const P = (i, j) => [x0 + i * s + (j & 1 ? s / 2 : 0) - s, y0 + j * hh - hh];
  const tris = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (j % 2 === 0) {
      tris.push([P(i, j), P(i + 1, j), P(i, j + 1)], [P(i, j + 1), P(i + 1, j + 1), P(i + 1, j)]);
    } else {
      tris.push([P(i, j), P(i + 1, j), P(i + 1, j + 1)], [P(i, j + 1), P(i + 1, j + 1), P(i, j)]);
    }
  }
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  tris.forEach((t, n) => {
    const c = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
    // грани листа: три подтреугольника с разным тоном
    for (let k = 0; k < 3; k++) {
      const a = t[k], b = t[(k + 1) % 3];
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath();
      g.fillStyle = css(mix(pal.bg, pal.bg2, ((k + n) % 3) / 2.2), fillA); g.fill();
    }
  });
  g.lineWidth = Math.max(0.7, s * 0.03); g.strokeStyle = css(pal.gold, lineA); g.lineJoin = 'round';
  tris.forEach((t) => {
    const c = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
    g.beginPath();
    g.moveTo(t[0][0], t[0][1]); g.lineTo(t[1][0], t[1][1]); g.lineTo(t[2][0], t[2][1]); g.closePath();
    for (const p of t) { g.moveTo(p[0], p[1]); g.lineTo(c[0], c[1]); }
    g.stroke();
  });
  g.restore();
}

// Цветок сакуры (центр 0,0), 5 лепестков с вырезом.
function sakura(g, x, y, r, rot, pal, deepC) {
  g.save(); g.translate(x, y); g.rotate(rot);
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate((i * TAU) / 5);
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(-r * 0.75, -r * 0.2, -r * 0.62, -r * 0.95, -r * 0.16, -r * 0.98);
    g.lineTo(0, -r * 0.84);
    g.lineTo(r * 0.16, -r * 0.98);
    g.bezierCurveTo(r * 0.62, -r * 0.95, r * 0.75, -r * 0.2, 0, 0);
    g.closePath();
    g.fillStyle = css(mix(pal.accent, pal.light, 0.35)); g.fill();
    g.lineWidth = Math.max(0.5, r * 0.05); g.strokeStyle = css(deepC || pal.gold, 0.9); g.stroke();
    // прожилка
    g.strokeStyle = css(pal.accent, 0.9); g.lineWidth = Math.max(0.4, r * 0.03);
    g.beginPath(); g.moveTo(0, -r * 0.1); g.lineTo(0, -r * 0.5); g.stroke();
    g.restore();
  }
  circle(g, 0, 0, r * 0.2); g.fillStyle = css(pal.gold); g.fill();
  g.strokeStyle = css(pal.deep, 0.8); g.lineWidth = Math.max(0.4, r * 0.03);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    g.beginPath(); g.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    g.lineTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42); g.stroke();
    circle(g, Math.cos(a) * r * 0.44, Math.sin(a) * r * 0.44, r * 0.04); g.fillStyle = css(pal.deep); g.fill();
  }
  g.restore();
}

function petal(g, x, y, r, rot, pal, a = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(-r * 0.8, -r * 0.2, -r * 0.6, -r * 1.0, -r * 0.15, -r);
  g.lineTo(0, -r * 0.85); g.lineTo(r * 0.15, -r);
  g.bezierCurveTo(r * 0.6, -r * 1.0, r * 0.8, -r * 0.2, 0, 0);
  g.fillStyle = css(mix(pal.accent, pal.light, 0.3), a); g.fill();
  g.lineWidth = 0.6; g.strokeStyle = css(pal.deep, 0.5 * a); g.stroke();
  g.restore();
}

// Ветка сакуры вдоль кривой Безье: points = [p0, c1, c2, p3].
function branch(g, pts, pal, rng, lw, blossoms) {
  const [p0, c1, c2, p3] = pts;
  const at = (t) => {
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]];
  };
  g.lineCap = 'round';
  g.strokeStyle = css(pal.deep, 1); g.lineWidth = lw + 3;
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p3[0], p3[1]); g.stroke();
  g.strokeStyle = css(mix(pal.gold, pal.deep, 0.45)); g.lineWidth = lw;
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p3[0], p3[1]); g.stroke();
  g.strokeStyle = css(pal.gold, 0.7); g.lineWidth = Math.max(0.6, lw * 0.25);
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p3[0], p3[1]); g.stroke();
  const twigs = [];
  for (let i = 0; i < blossoms; i++) {
    const t = 0.18 + (i / blossoms) * 0.8;
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(1, t + 0.02));
    const ang = Math.atan2(y2 - y, x2 - x) + (i % 2 ? 1 : -1) * rng.range(0.7, 1.2);
    const L = rng.range(18, 34);
    twigs.push([x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L, ang]);
  }
  for (const [x, y, ex, ey] of twigs) {
    g.strokeStyle = css(mix(pal.gold, pal.deep, 0.45)); g.lineWidth = lw * 0.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
  }
  twigs.forEach(([x, y, ex, ey, ang], i) => {
    const r = rng.range(11, 16);
    if (i % 4 === 3) { circle(g, ex, ey, r * 0.38); g.fillStyle = css(pal.accent); g.fill(); g.strokeStyle = css(pal.gold); g.lineWidth = 0.8; g.stroke(); }
    else sakura(g, ex, ey, r, rng.range(0, TAU), pal);
  });
  const [ex, ey] = at(1);
  sakura(g, ex, ey, 15, rng.range(0, TAU), pal);
}

// Облако кумо: контур из золотой нити, заливка в цвет подложки.
function kumo(g, cx, cy, w, pal, fill, rng) {
  const base = [];
  const n = Math.max(3, Math.round(w / 26));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const rr = 11 + Math.sin(t * Math.PI) * 11 + rng.range(-1.5, 1.5);
    base.push([cx - w / 2 + t * w, cy - Math.sin(t * Math.PI) * 8, rr]);
  }
  const lw = 1.8;
  for (const [x, y, r] of base) { circle(g, x, y, r + lw); g.fillStyle = css(pal.gold); g.fill(); }
  g.fillRect(cx - w / 2, cy, w, 0);
  g.beginPath(); g.rect(cx - w / 2 - 8, cy - 1, w + 16, 14 + lw); g.fill();
  for (const [x, y, r] of base) { circle(g, x, y, r); g.fillStyle = css(fill); g.fill(); }
  g.fillStyle = css(fill); g.fillRect(cx - w / 2 - 8, cy, w + 16, 13);
  // хвост: золотая линия снизу и завитки
  g.strokeStyle = css(pal.gold); g.lineWidth = lw;
  g.beginPath(); g.moveTo(cx - w / 2 - 8, cy + 13); g.lineTo(cx + w / 2 + 8, cy + 13); g.stroke();
  for (const [x, y, r] of base) {
    g.lineWidth = 1.1; g.strokeStyle = css(pal.gold, 0.85);
    g.beginPath(); g.arc(x, y + 1, r * 0.55, Math.PI * 1.1, Math.PI * 1.95); g.stroke();
    g.beginPath(); g.arc(x, y + 1, r * 0.28, Math.PI * 1.1, Math.PI * 1.95); g.stroke();
  }
  // кончики-завитки по бокам
  for (const s of [-1, 1]) {
    const ex = cx + s * (w / 2 + 8);
    g.lineWidth = lw; g.strokeStyle = css(pal.gold);
    g.beginPath(); g.arc(ex, cy + 7, 6, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI : 0, s < 0 ? false : false); g.stroke();
  }
}

function cloudBand(g, y, x0, x1, pal, fill, rng, step = 70) {
  for (let x = x0 + 34; x < x1; x += step) kumo(g, x + rng.range(-6, 6), y + rng.range(-3, 3), rng.range(44, 58), pal, fill, rng);
}

function goldFrame(g, x, y, w, h, pal, lw = 1.4) {
  g.strokeStyle = css(pal.gold); g.lineWidth = lw; g.strokeRect(x, y, w, h);
}

// Кайма: тёмная лента с мелкими сэйгайха/шиппо, золотые рамки, угловые цветы.
function border(g, pal, rng, kind) {
  const band = 36, x0 = 6;
  g.fillStyle = css(pal.deep); g.fillRect(0, 0, CW, CH);
  // лента
  g.save();
  g.beginPath(); g.rect(x0 + 2, x0 + 2, CW - 2 * x0 - 4, CH - 2 * x0 - 4);
  g.rect(x0 + band, x0 + band, CW - 2 * (x0 + band), CH - 2 * (x0 + band));
  g.clip('evenodd');
  if (kind === 0) {
    seigaiha(g, 0, 0, CW, CH, 9, { ...pal, bg: mix(pal.deep, pal.bg, 0.6), bg2: pal.bg }, rng, { goldA: 0.75 });
  } else if (kind === 1) {
    g.fillStyle = css(mix(pal.deep, pal.bg, 0.55)); g.fillRect(0, 0, CW, CH);
    // шиппо: переплетённые круги
    const s = 14;
    g.strokeStyle = css(pal.gold, 0.8); g.lineWidth = 1;
    for (let y = -s; y < CH + s; y += s) for (let x = -s; x < CW + s; x += s) {
      circle(g, x + ((y / s) % 2 ? s / 2 : 0), y, s * 0.72); g.stroke();
    }
    for (let y = -s; y < CH + s; y += s) for (let x = -s; x < CW + s; x += s) {
      circle(g, x + ((y / s) % 2 ? s / 2 : 0), y, 1.6); g.fillStyle = css(pal.accent, 0.8); g.fill();
    }
  } else {
    g.fillStyle = css(mix(pal.deep, pal.bg, 0.6)); g.fillRect(0, 0, CW, CH);
    // тонкие вертикальные/горизонтальные нити
    g.strokeStyle = css(pal.gold, 0.28); g.lineWidth = 0.8;
    for (let i = 0; i < CW; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, CH); g.stroke(); }
    for (let i = 0; i < CH; i += 4) { g.beginPath(); g.moveTo(0, i); g.lineTo(CW, i); g.stroke(); }
  }
  g.restore();
  // цветы по ленте (асимметричный ритм)
  const mid = x0 + band / 2 + 1;
  const W = CW - 2 * mid, H = CH - 2 * mid;
  const per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [mid + t, mid];
    t -= W; if (t < H) return [mid + W, mid + t];
    t -= H; if (t < W) return [mid + W - t, mid + H];
    t -= W; return [mid, mid + H - t];
  };
  const N = 32;
  for (let i = 0; i < N; i++) {
    const [x, y] = pt(((i + 0.5) / N) * per);
    circle(g, x, y, 6.6); g.fillStyle = css(pal.deep, 0.95); g.fill();
    g.lineWidth = 1; g.strokeStyle = css(pal.gold); g.stroke();
    if (i % 2 === 0) sakura(g, x, y, 5.4, i, pal); else { star4(g, x, y, 4.4, pal.gold); }
  }
  goldFrame(g, x0 + 2, x0 + 2, CW - 2 * x0 - 4, CH - 2 * x0 - 4, pal, 1.8);
  goldFrame(g, x0 + 5, x0 + 5, CW - 2 * x0 - 10, CH - 2 * x0 - 10, pal, 0.8);
  goldFrame(g, x0 + band, x0 + band, CW - 2 * (x0 + band), CH - 2 * (x0 + band), pal, 1.8);
  goldFrame(g, x0 + band - 3, x0 + band - 3, CW - 2 * (x0 + band) + 6, CH - 2 * (x0 + band) + 6, pal, 0.8);
  // угловые крупные цветы
  for (const [x, y] of [[mid, mid], [CW - mid, mid], [mid, CH - mid], [CW - mid, CH - mid]]) {
    circle(g, x, y, 13); g.fillStyle = css(pal.deep); g.fill(); g.lineWidth = 1.6; g.strokeStyle = css(pal.gold); g.stroke();
    sakura(g, x, y, 10.5, 0, pal);
  }
  return x0 + band + 4;
}

function star4(g, x, y, r, c) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath(); g.fillStyle = css(c); g.fill();
}

// Подвесной медальон (круг) с асаноха внутри.
function disc(g, x, y, R, pal, rng, withSakura = true) {
  g.save(); g.translate(x, y);
  circle(g, 0, 0, R + 5); g.fillStyle = css(pal.deep, 0.5); g.fill();
  circle(g, 0, 0, R + 2.5); g.fillStyle = css(pal.gold); g.fill();
  circle(g, 0, 0, R); g.fillStyle = css(pal.deep); g.fill();
  g.save(); circle(g, 0, 0, R - 3); g.clip();
  asanoha(g, -R, -R, 2 * R, 2 * R, R * 0.36, { ...pal, bg: mix(pal.bg, pal.deep, 0.3), bg2: pal.bg2 });
  g.restore();
  circle(g, 0, 0, R - 3); g.strokeStyle = css(pal.gold); g.lineWidth = 1.2; g.stroke();
  if (withSakura) {
    circle(g, 0, 0, R * 0.46); g.fillStyle = css(pal.deep); g.fill(); g.lineWidth = 1.4; g.strokeStyle = css(pal.gold); g.stroke();
    sakura(g, 0, 0, R * 0.4, rng.range(0, 1), pal);
  }
  g.restore();
}

// Дзен: энсо-кольцо кистью.
function enso(g, x, y, R, pal, rng) {
  const start = rng.range(0.4, 1.0) * Math.PI;
  const sweep = TAU * 0.92;
  const steps = 90;
  g.save(); g.translate(x, y);
  for (let pass = 0; pass < 2; pass++) {
    g.beginPath();
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = start + t * sweep;
      const rr = R * (1 + 0.025 * Math.sin(t * 9 + 1) + 0.05 * (t - 0.5));
      const wd = (pass ? 0.4 : 1) * (2 + 8 * Math.pow(Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.95 + 0.15), 0.6) * (1 - t * 0.7));
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr, a, wd]);
    }
    for (let i = 0; i <= steps; i++) {
      const [px, py, a, wd] = pts[i];
      const X = px + Math.cos(a) * wd / 2, Y = py + Math.sin(a) * wd / 2;
      if (i === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
    }
    for (let i = steps; i >= 0; i--) {
      const [px, py, a, wd] = pts[i];
      g.lineTo(px - Math.cos(a) * wd / 2, py - Math.sin(a) * wd / 2);
    }
    g.closePath();
    g.fillStyle = css(pass ? pal.light : pal.gold, pass ? 0.35 : 0.95); g.fill();
  }
  g.restore();
}

function composeSeigaiha(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2, cy = CH / 2;
  seigaiha(g, fx, fy, fw, fh, 24, pal, rng, { tint: (x, y) => 0.06 * Math.sin(y / 38) });
  // облака верх/низ
  const fill = pal.deep;
  for (const y of [fy + 34, fy + fh - 34]) {
    g.fillStyle = css(pal.deep, 0.78); g.fillRect(fx, y - 26, fw, 52);
    g.strokeStyle = css(pal.gold, 0.7); g.lineWidth = 1;
    g.beginPath(); g.moveTo(fx, y - 26); g.lineTo(fx + fw, y - 26); g.moveTo(fx, y + 26); g.lineTo(fx + fw, y + 26); g.stroke();
    cloudBand(g, y, fx, fx + fw, pal, fill, rng, 74);
  }
  disc(g, cx, cy, 78, pal, rng, true);
  // лепестки, падающие вокруг
  for (let i = 0; i < 16; i++) {
    const a = rng.range(0, TAU), rr = rng.range(95, 110);
    petal(g, cx + Math.cos(a) * rr * 0.9, cy + Math.sin(a) * rr * 1.25, rng.range(5, 8), rng.range(0, TAU), pal);
  }
}

function composeAsanoha(g, pal, rng, fx, fy, fw, fh) {
  asanoha(g, fx, fy, fw, fh, 36, pal);
  // два облачных пояса
  const fill = pal.deep;
  for (const y of [fy + fh * 0.30, fy + fh * 0.72]) {
    g.fillStyle = css(pal.deep, 0.9); g.fillRect(fx, y - 22, fw, 44);
    g.strokeStyle = css(pal.gold); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(fx, y - 22); g.lineTo(fx + fw, y - 22); g.moveTo(fx, y + 22); g.lineTo(fx + fw, y + 22); g.stroke();
    cloudBand(g, y + 2, fx, fx + fw, pal, fill, rng, 66);
  }
  // ветка сакуры по диагонали
  const flip = rng.chance(0.5) ? -1 : 1;
  const X = (x) => (flip > 0 ? x : CW - x);
  g.save();
  branch(g, [[X(fx - 4), fy + 24], [X(fx + 70), fy + 40], [X(fx + 30), fy + 120], [X(fx + 60), fy + fh * 0.2 + 30]], pal, rng, 5, 7);
  branch(g, [[X(fx + fw + 4), fy + fh - 24], [X(fx + fw - 60), fy + fh - 40], [X(fx + fw - 30), fy + fh - 120], [X(fx + fw - 70), fy + fh * 0.8 - 40]], pal, rng, 5, 7);
  g.restore();
  disc(g, CW / 2, CH / 2, 42, pal, rng, true);
}

const wyTop = (fy, fh) => fh * 0.66;
function composeZen(g, pal, rng, fx, fy, fw, fh) {
  // тихое поле: полотно с тончайшими нитями и приглушённой волной в нижней трети
  g.fillStyle = css(mix(pal.bg, pal.deep, 0.35)); g.fillRect(fx, fy, fw, fh);
  asanoha(g, fx, fy, fw, wyTop(fy, fh), 44, { ...pal, bg: mix(pal.bg, pal.deep, 0.35), bg2: mix(pal.bg, pal.bg2, 0.5) }, 1, 0.2);
  g.strokeStyle = css(pal.gold, 0.12); g.lineWidth = 0.8;
  for (let x = fx + 3; x < fx + fw; x += 5) { g.beginPath(); g.moveTo(x, fy); g.lineTo(x, fy + fh); g.stroke(); }
  // мазки тумана
  for (let i = 0; i < 5; i++) {
    const y = fy + 40 + i * (fh * 0.17) + rng.range(-10, 10);
    const grad = g.createLinearGradient(fx, y, fx + fw, y);
    grad.addColorStop(0, css(pal.bg2, 0)); grad.addColorStop(0.5, css(pal.bg2, 0.5)); grad.addColorStop(1, css(pal.bg2, 0));
    g.fillStyle = grad; g.fillRect(fx, y - 7, fw, 14);
  }
  const wy = fy + fh * 0.66;
  seigaiha(g, fx, wy, fw, fy + fh - wy, 20, { ...pal, bg: mix(pal.deep, pal.bg, 0.7), bg2: mix(pal.bg, pal.bg2, 0.8) }, rng, { goldA: 0.55, tint: (x, y) => 0.1 * (y - wy) / (fh * 0.34) });
  g.strokeStyle = css(pal.gold, 0.9); g.lineWidth = 1.2; g.beginPath(); g.moveTo(fx, wy); g.lineTo(fx + fw, wy); g.stroke();
  // солнце-диск и энсо
  const cx = CW / 2 + rng.range(-20, 20), cy = fy + fh * 0.32;
  circle(g, cx, cy, 62); g.fillStyle = css(pal.accent, 0.16); g.fill();
  enso(g, cx, cy, 58, pal, rng);
  // одна ветвь сакуры сбоку
  const left = rng.chance(0.5);
  const X = (x) => (left ? x : CW - x);
  branch(g, [[X(fx - 4), fy + fh * 0.5], [X(fx + 40), fy + fh * 0.46], [X(fx + 70), fy + fh * 0.58], [X(fx + 120), fy + fh * 0.56]], pal, rng, 4, 4);
  // падающие лепестки
  for (let i = 0; i < 18; i++) petal(g, rng.range(fx + 10, fx + fw - 10), rng.range(fy + 20, fy + fh - 20), rng.range(5, 8), rng.range(0, TAU), pal, 0.9);
  // вертикальная золотая нить с узелками
  const tx = left ? fx + fw - 22 : fx + 22;
  g.strokeStyle = css(pal.gold, 0.9); g.lineWidth = 1.2; g.beginPath(); g.moveTo(tx, fy + 10); g.lineTo(tx, fy + fh * 0.62); g.stroke();
  for (let y = fy + 30; y < fy + fh * 0.6; y += 46) { circle(g, tx, y, 3); g.fillStyle = css(pal.gold); g.fill(); }
}

export default {
  id: 'japanese', name: 'Японский',
  paint(g, rng) {
    let pal = pickPalette(rng, PALS);
    const variant = rng.int(0, 2);
    const kind = rng.int(0, 2);
    const inset = border(g, pal, rng.fork('b'), kind);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    g.fillStyle = css(pal.bg); g.fillRect(fx, fy, fw, fh);
    const r = rng.fork('f');
    if (variant === 0) composeSeigaiha(g, pal, r, fx, fy, fw, fh);
    else if (variant === 1) composeAsanoha(g, pal, r, fx, fy, fw, fh);
    else composeZen(g, pal, r, fx, fy, fw, fh);
    // внутренняя золотая рамка поля
    g.restore();
    return { edge: pal.edge, fringe: pal.ink ? [236, 224, 196] : [232, 218, 186] };
  },
};
