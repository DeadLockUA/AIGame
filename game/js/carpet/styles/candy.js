// Сладости: леденцы-спирали, полосатые трости, посыпка, пряники, глазурь. Кайма-«гирлянда» из конфет.
import { CW, CH, css, mix, darken, lighten, pickPalette, petalPath, mirrorX, quad } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { bg: [252, 210, 224], bg2: [246, 186, 208], b1: [238, 112, 158], b2: [255, 242, 247], c0: [255, 90, 130], c1: [96, 200, 188], c2: [255, 205, 80], c3: [150, 110, 222], dark: [120, 40, 72], cream: [255, 246, 240], dough: [214, 150, 96], edge: [150, 50, 90] },
  { bg: [198, 238, 222], bg2: [168, 224, 204], b1: [64, 178, 158], b2: [255, 255, 255], c0: [255, 120, 108], c1: [255, 200, 90], c2: [240, 120, 190], c3: [100, 160, 232], dark: [30, 92, 82], cream: [255, 252, 240], dough: [208, 148, 96], edge: [34, 120, 108] },
  { bg: [236, 226, 255], bg2: [214, 202, 248], b1: [146, 116, 228], b2: [255, 246, 204], c0: [255, 170, 60], c1: [255, 100, 150], c2: [90, 200, 200], c3: [255, 230, 90], dark: [70, 48, 124], cream: [255, 250, 240], dough: [212, 150, 100], edge: [96, 70, 170] },
  { bg: [255, 244, 230], bg2: [247, 224, 206], b1: [214, 46, 62], b2: [255, 255, 255], c0: [214, 46, 62], c1: [60, 160, 112], c2: [250, 190, 60], c3: [240, 130, 152], dark: [112, 30, 42], cream: [255, 250, 240], dough: [208, 146, 92], edge: [150, 30, 44] },
  { bg: [255, 218, 188], bg2: [250, 196, 164], b1: [58, 188, 206], b2: [255, 255, 255], c0: [255, 100, 90], c1: [58, 188, 206], c2: [255, 216, 80], c3: [172, 120, 222], dark: [122, 58, 48], cream: [255, 248, 236], dough: [200, 138, 84], edge: [30, 120, 140] },
  { bg: [112, 72, 60], bg2: [92, 56, 46], b1: [120, 214, 190], b2: [255, 248, 236], c0: [255, 140, 170], c1: [120, 214, 190], c2: [255, 214, 100], c3: [255, 190, 224], dark: [44, 22, 18], cream: [255, 246, 232], dough: [226, 166, 104], edge: [60, 100, 90] },
];

function line(g, col, w) { g.lineWidth = w; g.strokeStyle = css(col); g.lineJoin = 'round'; g.stroke(); }

/** Леденец-спираль (мятный круг с закрученными секторами). */
function swirl(g, R, c1, c2, dark, N = 8, k = 1.7) {
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = css(c1); g.fill();
  const steps = 12;
  for (let i = 0; i < N; i++) {
    const a0 = i * TAU / N, a1 = a0 + TAU / N * 0.5;
    g.beginPath(); g.moveTo(0, 0);
    for (let s = 1; s <= steps; s++) { const t = s / steps, a = a0 + k * t; g.lineTo(Math.cos(a) * R * t, Math.sin(a) * R * t); }
    for (let j = 1; j <= 5; j++) { const a = a0 + k + (a1 - a0) * j / 5; g.lineTo(Math.cos(a) * R, Math.sin(a) * R); }
    for (let s = steps; s >= 0; s--) { const t = s / steps, a = a1 + k * t; g.lineTo(Math.cos(a) * R * t, Math.sin(a) * R * t); }
    g.closePath(); g.fillStyle = css(c2); g.fill();
  }
  g.beginPath(); g.arc(0, 0, R, 0, TAU); line(g, dark, Math.max(1, R * 0.07));
  g.beginPath(); g.arc(0, 0, R * 0.82, Math.PI * 1.05, Math.PI * 1.45); g.lineCap = 'round'; line(g, [255, 255, 255], Math.max(1, R * 0.07));
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.stroke();
}

function lollipop(g, R, c1, c2, dark, stickLen, bow, N = 8, k = 1.7) {
  g.beginPath(); g.moveTo(0, R * 0.9); g.lineTo(0, R + stickLen); g.lineCap = 'round'; line(g, dark, R * 0.2);
  g.beginPath(); g.moveTo(0, R * 0.9); g.lineTo(0, R + stickLen); line(g, [255, 250, 240], R * 0.12);
  swirl(g, R, c1, c2, dark, N, k);
  if (bow) {
    g.save(); g.translate(0, R + R * 0.15);
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * R * 0.4, -R * 0.35, s * R * 0.5, 0); g.quadraticCurveTo(s * R * 0.4, R * 0.35, 0, 0);
      g.fillStyle = css(bow); g.fill(); line(g, dark, Math.max(1, R * 0.05));
    }
    g.beginPath(); g.arc(0, 0, R * 0.12, 0, TAU); g.fillStyle = css(bow); g.fill(); line(g, dark, Math.max(1, R * 0.05));
    g.restore();
  }
}

/** Конфета в обёртке: тело-овал с полосками и хвостики-«веера». */
function wrapped(g, len, c1, c2, dark, wrapC) {
  const h = len * 0.32, lw = Math.max(0.8, len * 0.05);
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * len * 0.3, 0); g.lineTo(s * len * 0.62, -h * 0.95); g.quadraticCurveTo(s * len * 0.55, 0, s * len * 0.62, h * 0.95); g.closePath();
    g.fillStyle = css(wrapC); g.fill(); line(g, dark, lw);
    g.beginPath(); g.moveTo(s * len * 0.3, 0); g.lineTo(s * len * 0.6, -h * 0.3); g.moveTo(s * len * 0.3, 0); g.lineTo(s * len * 0.6, h * 0.3);
    g.strokeStyle = css(dark, 0.6); g.lineWidth = lw * 0.7; g.stroke();
  }
  g.beginPath(); g.ellipse(0, 0, len * 0.34, h, 0, 0, TAU); g.fillStyle = css(c1); g.fill();
  g.save(); g.clip();
  g.strokeStyle = css(c2); g.lineWidth = len * 0.1;
  for (let x = -len * 0.5; x < len * 0.5; x += len * 0.2) { g.beginPath(); g.moveTo(x - h, h); g.lineTo(x + h, -h); g.stroke(); }
  g.restore();
  g.beginPath(); g.ellipse(0, 0, len * 0.34, h, 0, 0, TAU); line(g, dark, lw);
  g.beginPath(); g.ellipse(-len * 0.1, -h * 0.4, len * 0.1, h * 0.18, -0.3, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
}

function gumdrop(g, r, c, dark) {
  g.beginPath(); g.moveTo(-r, 0); g.bezierCurveTo(-r, -r * 1.25, r, -r * 1.25, r, 0); g.lineTo(r * 1.05, r * 0.3); g.quadraticCurveTo(0, r * 0.5, -r * 1.05, r * 0.3); g.closePath();
  const gr = g.createLinearGradient(0, -r, 0, r * 0.4); gr.addColorStop(0, css(lighten(c, 0.2))); gr.addColorStop(1, css(darken(c, 0.08)));
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = (0.2 + (i % 4) * 0.2) * r; g.beginPath(); g.arc(Math.cos(a) * rr, -r * 0.35 + Math.sin(a) * rr * 0.6, r * 0.07, 0, TAU); g.fill(); }
  g.restore();
  g.beginPath(); g.moveTo(-r, 0); g.bezierCurveTo(-r, -r * 1.25, r, -r * 1.25, r, 0); g.lineTo(r * 1.05, r * 0.3); g.quadraticCurveTo(0, r * 0.5, -r * 1.05, r * 0.3); g.closePath();
  line(g, dark, Math.max(0.8, r * 0.1));
  g.beginPath(); g.ellipse(-r * 0.4, -r * 0.55, r * 0.15, r * 0.28, 0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
}

/** Леденцовая трость, стоит вертикально, крюк справа. */
function cane(g, L, w, c1, c2, dark) {
  const r = w * 1.9;
  const pts = [];
  for (let y = 0; y >= -L; y -= 4) pts.push([0, y]);
  for (let i = 1; i <= 24; i++) { const th = Math.PI + (i / 24) * Math.PI * 1.5; pts.push([r + r * Math.cos(th), -L + r * Math.sin(th)]); }
  const left = [], right = [];
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
    const a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), nx = -Math.sin(a), ny = Math.cos(a);
    left.push([pts[i][0] + nx * w / 2, pts[i][1] + ny * w / 2]); right.push([pts[i][0] - nx * w / 2, pts[i][1] - ny * w / 2]);
  }
  const poly = () => {
    g.beginPath(); left.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    const e = pts[pts.length - 1];
    right.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath();
  };
  poly(); g.fillStyle = css(c2); g.fill();
  g.save(); poly(); g.clip();
  g.strokeStyle = css(c1); g.lineWidth = w * 0.46; g.lineCap = 'butt';
  let acc = 0, first = true;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc >= w * 1.05 || first) {
      first = false; acc = 0;
      const [x1, y1] = pts[i];
      const a = Math.atan2(y1 - pts[i - 1][1], x1 - pts[i - 1][0]), nx = -Math.sin(a), ny = Math.cos(a), tx = Math.cos(a), ty = Math.sin(a);
      g.beginPath(); g.moveTo(x1 + nx * w - tx * w * 0.8, y1 + ny * w - ty * w * 0.8); g.lineTo(x1 - nx * w + tx * w * 0.8, y1 - ny * w + ty * w * 0.8); g.stroke();
    }
  }
  // блик
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = w * 0.12;
  g.beginPath(); right.forEach(([x, y], i) => { const k = left[i]; const px = k[0] * 0.75 + x * 0.25, py = k[1] * 0.75 + y * 0.25; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
  g.restore();
  const e = pts[pts.length - 1];
  g.beginPath(); g.arc(e[0], e[1], w / 2, 0, TAU); g.fillStyle = css(c1); g.fill();
  poly(); g.lineJoin = 'round'; g.lineWidth = Math.max(1.4, w * 0.16); g.strokeStyle = css(dark); g.stroke();
  g.beginPath(); g.arc(e[0], e[1], w / 2, 0, TAU); g.stroke();
}

function sprinkle(g, x, y, a, len, c) {
  g.beginPath(); g.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2); g.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2);
  g.lineCap = 'round'; g.lineWidth = len * 0.38; g.strokeStyle = css(c); g.stroke();
}

function sprinkles(g, rng, pal, x, y, w, h, n, len = 7) {
  for (let i = 0; i < n; i++) sprinkle(g, rng.range(x, x + w), rng.range(y, y + h), rng.range(0, Math.PI), len * rng.range(0.8, 1.15), rng.pick(pal.cs));
}

function donut(g, R, icing, dough, dark, rng, pal) {
  const lw = Math.max(1, R * 0.06);
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = css(dough); g.fill(); line(g, dark, lw);
  // глазурь с волнистым краем
  g.beginPath();
  for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, r = R * (0.88 + 0.07 * Math.sin(a * 7 + 1) + 0.03 * Math.sin(a * 13)); i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); }
  g.closePath(); g.fillStyle = css(icing); g.fill(); line(g, darken(icing, 0.3), lw * 0.7);
  g.beginPath(); g.arc(-R * 0.25, -R * 0.3, R * 0.3, Math.PI * 1.05, Math.PI * 1.55); g.lineCap = 'round'; g.lineWidth = lw * 1.4; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke();
  for (let i = 0; i < 20; i++) {
    const a = rng.range(0, TAU), r = R * rng.range(0.42, 0.82);
    sprinkle(g, Math.cos(a) * r, Math.sin(a) * r, rng.range(0, Math.PI), R * 0.16, rng.pick(pal.cs.concat([pal.cream])));
  }
  g.beginPath(); g.arc(0, 0, R * 0.3, 0, TAU); g.fillStyle = css(pal.hole || darken(pal.bg2, 0.3)); g.fill(); line(g, dark, lw);
}

function cupcake(g, s, wrapC, cream, cherry, dark, pal, rng) {
  const lw = Math.max(0.8, s * 0.04);
  // обёртка
  g.beginPath(); g.moveTo(-s * 0.45, 0); g.lineTo(-s * 0.34, s * 0.55); g.lineTo(s * 0.34, s * 0.55); g.lineTo(s * 0.45, 0); g.closePath();
  g.fillStyle = css(wrapC); g.fill(); g.save(); g.clip();
  g.strokeStyle = css(darken(wrapC, 0.2), 0.7); g.lineWidth = s * 0.04;
  for (let x = -s * 0.5; x <= s * 0.5; x += s * 0.1) { g.beginPath(); g.moveTo(x * 0.8, 0); g.lineTo(x, s * 0.56); g.stroke(); }
  g.restore();
  g.beginPath(); g.moveTo(-s * 0.45, 0); g.lineTo(-s * 0.34, s * 0.55); g.lineTo(s * 0.34, s * 0.55); g.lineTo(s * 0.45, 0); g.closePath(); line(g, dark, lw);
  // крем слоями
  for (let i = 0; i < 3; i++) {
    const w = s * (0.52 - i * 0.12), y = -s * (0.08 + i * 0.2);
    g.beginPath(); g.ellipse(0, y, w, s * 0.16, 0, 0, TAU); g.fillStyle = css(mix(cream, [255, 255, 255], i * 0.15)); g.fill(); line(g, dark, lw);
  }
  g.beginPath(); g.arc(0, -s * 0.66, s * 0.1, 0, TAU); g.fillStyle = css(cherry); g.fill(); line(g, dark, lw);
  for (let i = 0; i < 8; i++) sprinkle(g, rng.range(-s * 0.35, s * 0.35), rng.range(-s * 0.5, -s * 0.05), rng.range(0, 3), s * 0.1, rng.pick(pal.cs));
}

function gingerbread(g, s, dough, icing, dark, btn) {
  const lw = Math.max(1, s * 0.05);
  const limbs = [[-0.1, -0.3, -0.62, -0.5, 0.2], [0.1, -0.3, 0.62, -0.5, 0.2], [-0.1, 0.1, -0.34, 0.66, 0.23], [0.1, 0.1, 0.34, 0.66, 0.23], [0, -0.36, 0, 0.14, 0.52]];
  const draw = (extra, col) => {
    g.lineCap = 'round'; g.strokeStyle = css(col);
    for (const [x0, y0, x1, y1, w] of limbs) { g.beginPath(); g.moveTo(x0 * s, y0 * s); g.lineTo(x1 * s, y1 * s); g.lineWidth = w * s + extra; g.stroke(); }
    g.beginPath(); g.arc(0, -s * 0.66, s * 0.27 + extra / 2, 0, TAU); g.fillStyle = css(col); g.fill();
  };
  draw(lw * 2, darken(dough, 0.5));
  draw(0, dough);
  // свет
  g.save(); g.globalCompositeOperation = 'source-atop'; g.restore();
  g.beginPath(); g.ellipse(-s * 0.08, -s * 0.05, s * 0.16, s * 0.3, 0.1, 0, TAU); g.fillStyle = css(lighten(dough, 0.18), 0.6); g.fill();
  // манжеты из глазури
  g.strokeStyle = css(icing); g.lineWidth = lw * 1.5; g.lineCap = 'round';
  for (const [x0, y0, x1, y1, w] of limbs.slice(0, 4)) {
    for (const t of [0.62, 0.8]) {
      const px = (x0 + (x1 - x0) * t) * s, py = (y0 + (y1 - y0) * t) * s;
      const a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2, hw = w * s * 0.36;
      g.beginPath(); g.moveTo(px - Math.cos(a) * hw, py - Math.sin(a) * hw); g.lineTo(px + Math.cos(a) * hw, py + Math.sin(a) * hw); g.stroke();
    }
  }
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, -s * 0.28 + i * s * 0.18, s * 0.06, 0, TAU); g.fillStyle = css(btn[i % btn.length]); g.fill(); line(g, dark, lw * 0.6); }
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * s * 0.1, -s * 0.7, s * 0.035, 0, TAU); g.fillStyle = css(dark); g.fill(); g.beginPath(); g.arc(sx * s * 0.17, -s * 0.6, s * 0.045, 0, TAU); g.fillStyle = css(btn[0], 0.6); g.fill(); }
  g.beginPath(); g.arc(0, -s * 0.62, s * 0.12, 0.25, Math.PI - 0.25); g.lineWidth = lw * 0.9; g.strokeStyle = css(dark); g.stroke();
}

function heartPath(g, s) {
  g.beginPath(); g.moveTo(0, s * 0.35); g.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.5, -s * 0.8, 0, -s * 0.35);
  g.bezierCurveTo(s * 0.5, -s * 0.8, s * 0.9, -s * 0.2, 0, s * 0.35); g.closePath();
}

/** Глазурные «потёки» сверху поля. */
function drips(g, rng, x, y, w, depth, col, dark) {
  g.beginPath(); g.moveTo(x, y - 4);
  let cx = x; const pts = [];
  while (cx < x + w) { const ww = rng.range(18, 34); pts.push([cx, ww, rng.range(depth * 0.35, depth)]); cx += ww; }
  g.lineTo(x, y);
  for (const [px, ww, d] of pts) {
    const x1 = Math.min(px + ww, x + w);
    g.lineTo(px, y + depth * 0.3);
    g.bezierCurveTo(px + ww * 0.1, y + depth * 0.3 + d * 0.5, px + ww * 0.1, y + d, px + ww * 0.5, y + d);
    g.bezierCurveTo(px + ww * 0.9, y + d, px + ww * 0.9, y + depth * 0.3 + d * 0.5, x1, y + depth * 0.3);
  }
  g.lineTo(x + w, y - 4); g.closePath();
  g.fillStyle = css(col); g.fill(); line(g, dark, 1.4);
  g.beginPath(); g.moveTo(x + 6, y + 6); g.lineTo(x + w - 6, y + 6); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 2; g.stroke();
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
  // диагональные полоски
  g.save(); g.beginPath(); g.rect(0, 0, CW, CH); g.rect(x0 + 3, x0 + 3, CW - 2 * x0 - 6, CH - 2 * x0 - 6); g.clip('evenodd');
  g.strokeStyle = css(pal.b2, 0.55); g.lineWidth = 6;
  for (let d = -CH; d < CW + CH; d += 16) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + CH, CH); g.stroke(); }
  g.restore();
  for (const [o, w, c] of [[x0, 2.5, pal.b2], [x0 + 3.5, 1.5, pal.dark], [x0 + band, 1.5, pal.dark], [x0 + band + 3, 2.5, pal.b2]]) {
    g.strokeStyle = css(c); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o);
  }
  // нить гирлянды
  const m = x0 + band / 2 + 2;
  g.strokeStyle = css(pal.dark); g.lineWidth = 2.4; g.strokeRect(m, m, CW - 2 * m, CH - 2 * m);
  g.strokeStyle = css(pal.b2); g.lineWidth = 1.2; g.setLineDash([3, 3]); g.strokeRect(m, m, CW - 2 * m, CH - 2 * m); g.setLineDash([]);
  walk(25, 31, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    const c = pal.cs[i % pal.cs.length];
    if (i % 2 === 0) { wrapped(g, 21, c, pal.b2, pal.dark, lighten(c, 0.5)); }
    else if (variant === 1 && i % 4 === 1) { g.rotate(-Math.PI / 2); swirl(g, 8.5, c, pal.b2, pal.dark, 6, 1.4); }
    else { g.translate(0, 3); gumdrop(g, 7, c, pal.dark); }
    g.restore();
  });
  const cc = x0 + band / 2 + 2;
  for (const [x, y] of [[cc, cc], [CW - cc, cc], [cc, CH - cc], [CW - cc, CH - cc]]) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, 1.6);
    swirl(g, 15, pal.cs[0], pal.cream, pal.dark, 8, 1.8);
    g.restore();
  }
  return x0 + band + 7;
}

// ---- Композиции ----

function compLollipop(g, rng, pal, B) {
  const cx = CW / 2, cy = B.y + B.h * 0.4;
  g.save(); g.translate(cx, cy);
  for (let i = 0; i < 24; i++) { g.save(); g.rotate(i * TAU / 24); g.beginPath(); g.moveTo(0, 0); g.lineTo(-16, -320); g.lineTo(16, -320); g.closePath(); g.fillStyle = css(i % 2 ? pal.bg2 : mix(pal.bg, pal.b2, 0.35)); g.fill(); g.restore(); }
  g.restore();
  // трости в углах, крюком к центру
  quad(g, cx, CH / 2, (q) => {
    q.save(); q.translate(B.w / 2 - 20, B.h / 2 - 8); q.scale(-1, 1); cane(q, 86, 16, pal.cs[0], pal.cream, pal.dark); q.restore();
  });
  sprinkles(g, rng.fork('s'), pal, B.x + 6, B.y + 6, B.w - 12, B.h - 12, 80, 7);
  // кольцо конфет вокруг леденца
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.arc(0, 0, 104, 0, TAU); g.fillStyle = css(pal.b2, 0.85); g.fill(); line(g, pal.b1, 2.5);
  const nr = rng.pick([10, 12, 14]), sN = rng.pick([6, 8, 10]), sK = rng.range(1.2, 2.2) * (rng.chance(0.5) ? 1 : -1);
  for (let i = 0; i < nr; i++) {
    g.save(); g.rotate(i * TAU / nr); g.translate(0, -104);
    if (i % 2) swirl(g, 9, pal.cs[(i + sN) % 4], pal.cream, pal.dark, 6, 1.4); else { g.translate(0, 4); gumdrop(g, 8, pal.cs[(i + 1) % 4], pal.dark); }
    g.restore();
  }
  g.rotate(rng.range(-0.12, 0.12));
  g.save(); g.translate(0, -12); lollipop(g, 72, pal.cs[1], pal.cream, pal.dark, 126, pal.cs[0], sN, sK); g.restore();
  g.restore();
  const n = 4;
  for (let i = 0; i < n; i++) {
    g.save(); g.translate(cx + (i - (n - 1) / 2) * 46, B.y + B.h - 26); swirl(g, 17, pal.cs[(i + 1) % 4], pal.cream, pal.dark, 8, 1.5 * (i % 2 ? -1 : 1)); g.restore();
  }
}

function compGinger(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2 + 16;
  // фон: горошек
  for (let y = B.y + 10; y < B.y + B.h; y += 22) for (let x = B.x + ((y / 22) % 2) * 11 + 6; x < B.x + B.w; x += 22) { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fillStyle = css(pal.bg2, 0.9); g.fill(); }
  drips(g, rng, B.x - 2, B.y - 2, B.w + 4, 40, pal.cs[0], pal.dark);
  // трости по бокам
  for (const sx of [-1, 1]) { g.save(); g.translate(cx + sx * 80, B.y + B.h - 62); g.scale(sx, 1); cane(g, 205, 11.5, pal.cs[sx > 0 ? 0 : 1], pal.cream, pal.dark); g.restore(); }
  // пряничный человечек
  g.save(); g.translate(cx, cy - 16); gingerbread(g, 124, pal.dough, pal.cream, pal.dark, pal.cs); g.restore();
  const rr = rng.fork('c');
  const sh = rng.shuffle([0, 1, 2, 3]);
  const top = rng.int(0, 2);
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx + sx * 62, B.y + B.h - 52); cupcake(g, 46, pal.cs[sh[sx > 0 ? 0 : 1]], pal.cs[sh[sx > 0 ? 2 : 3]], pal.cs[0], pal.dark, pal, rr); g.restore();
    g.save(); g.translate(cx + sx * 60, B.y + 96); g.rotate(sx * 0.2);
    if (top === 0) { heartPath(g, 54); g.fillStyle = css(pal.cs[sh[sx > 0 ? 3 : 1]]); g.fill(); line(g, pal.dark, 1.6); g.beginPath(); g.moveTo(-18, -2); g.quadraticCurveTo(0, 14, 18, -2); g.strokeStyle = css(pal.cream); g.lineWidth = 2; g.stroke(); }
    else if (top === 1) swirl(g, 26, pal.cs[sh[sx > 0 ? 3 : 1]], pal.cream, pal.dark, 8, 1.7 * sx);
    else wrapped(g, 56, pal.cs[sh[sx > 0 ? 3 : 1]], pal.cream, pal.dark, lighten(pal.cs[sh[sx > 0 ? 2 : 0]], 0.4));
    g.restore();
  }
  // пончик внизу по центру
  g.save(); g.translate(cx, B.y + B.h - 34); donut(g, 25, pal.cs[2], pal.dough, pal.dark, rr, pal); g.restore();
  // гирлянда карамелек у глазури
  sprinkles(g, rng.fork('sp'), pal, B.x + 6, B.y + 50, B.w - 12, B.h - 56, 40, 7);
}

function compPeppermint(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2;
  // гексагональная сетка пепперминтов
  const R = 21, dx = R * 2.15, dy = R * 1.86;
  const flip = rng.chance(0.5);
  let row = 0;
  for (let y = B.y + 4; y < B.y + B.h + R; y += dy, row++) {
    for (let x = B.x + (row % 2 ? dx / 2 : 0) - 2; x < B.x + B.w + R; x += dx) {
      const k = (Math.round(x / dx) + row) % 3;
      g.save(); g.translate(x, y);
      swirl(g, R * 0.92, pal.cs[k], k === 2 ? pal.bg : pal.cream, pal.dark, 8, 1.5 * ((row + k) % 2 ? 1 : -1));
      g.restore();
    }
  }
  // медальон со сценой
  g.save(); g.translate(cx, cy);
  g.beginPath(); for (let i = 0; i <= 160; i++) { const a = i / 160 * TAU, r = 108 * (1 + 0.04 * Math.cos(a * 16)); i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.05) : g.moveTo(r, 0); }
  g.closePath(); g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, 2.4);
  g.beginPath(); g.arc(0, 0, 94, 0, TAU); g.fillStyle = css(pal.bg); g.fill(); line(g, pal.b1, 3);
  g.beginPath(); g.arc(0, 0, 86, 0, TAU); g.setLineDash([2, 5]); line(g, pal.dark, 1.4); g.setLineDash([]);
  for (let i = 0; i < 12; i++) { g.save(); g.rotate(i * TAU / 12); g.translate(0, -76); g.rotate(0); gumdrop(g, 6, pal.cs[i % 4], pal.dark); g.restore(); }
  const mid = rng.int(0, 2);
  if (mid === 1) { g.save(); swirl(g, 60, pal.cs[1], pal.cream, pal.dark, rng.pick([6, 8, 10]), rng.range(1.3, 2.2)); g.restore(); }
  else if (mid === 2) { g.save(); g.translate(0, 8); cupcake(g, 120, pal.cs[2], pal.cs[0], pal.cs[1], pal.dark, pal, rng.fork('mc')); g.restore(); }
  else { g.save(); g.translate(0, 2); donut(g, 58, pal.cs[(flip ? 0 : 3)], pal.dough, pal.dark, rng.fork('d'), { ...pal, hole: pal.bg }); g.restore(); }
  g.restore();
  // кексы сверху и снизу
  for (const sy of [-1, 1]) {
    g.save(); g.translate(cx, cy + sy * (B.h / 2 - 40)); g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fillStyle = css(pal.b2); g.fill(); line(g, pal.dark, 2);
    g.scale(1, 1); cupcake(g, 46, pal.cs[(sy + 3) % 4], pal.cs[sy > 0 ? 0 : 2], pal.cs[0], pal.dark, pal, rng.fork('cc' + sy)); g.restore();
  }
}

export default {
  id: 'candy',
  name: 'Сладости',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    pal.cs = [pal.c0, pal.c1, pal.c2, pal.c3];
    const variant = rng.int(0, 2);
    const inset = border(g, pal, rng, variant);
    const B = { x: inset, y: inset, w: CW - 2 * inset, h: CH - 2 * inset };
    g.fillStyle = css(pal.bg); g.fillRect(B.x, B.y, B.w, B.h);
    g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
    [compLollipop, compGinger, compPeppermint][variant](g, rng.fork('comp'), pal, B);
    g.restore();
    g.strokeStyle = css(pal.dark); g.lineWidth = 2; g.strokeRect(B.x - 1, B.y - 1, B.w + 2, B.h + 2);
    return { edge: pal.edge, fringe: mix(pal.cream, pal.b2, 0.5) };
  },
};
