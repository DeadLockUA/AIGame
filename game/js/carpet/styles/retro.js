// Ретро: советский «ковёр на стену» — бордо/изумруд/беж, цветочный венок, оленята, узорная кайма.
import { CW, CH, css, mix, darken, lighten, pickPalette, petalPath, lozenge } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { field: [112, 22, 34], field2: [136, 36, 48], border: [22, 80, 62], cream: [238, 224, 190], rose: [218, 96, 100], leaf: [44, 124, 90], gold: [214, 170, 86], dark: [46, 10, 18] },
  { field: [18, 76, 60], field2: [30, 98, 78], border: [112, 22, 34], cream: [238, 226, 194], rose: [228, 124, 124], leaf: [96, 160, 108], gold: [218, 176, 90], dark: [8, 34, 28] },
  { field: [226, 208, 170], field2: [214, 192, 150], border: [96, 24, 34], cream: [250, 240, 214], rose: [170, 48, 58], leaf: [52, 112, 80], gold: [186, 138, 60], dark: [64, 26, 26] },
  { field: [70, 36, 30], field2: [92, 50, 40], border: [26, 82, 84], cream: [240, 224, 190], rose: [228, 144, 74], leaf: [122, 164, 92], gold: [220, 172, 84], dark: [30, 14, 12] },
  { field: [30, 38, 76], field2: [44, 54, 98], border: [122, 30, 50], cream: [240, 228, 200], rose: [236, 154, 164], leaf: [78, 140, 116], gold: [216, 176, 94], dark: [14, 18, 42] },
  { field: [150, 70, 38], field2: [176, 90, 52], border: [30, 78, 66], cream: [244, 230, 196], rose: [240, 200, 140], leaf: [84, 140, 90], gold: [230, 190, 100], dark: [62, 28, 16] },
];

function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }

function leaf(g, x, y, ang, len, w, pal, col) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  petalPath(g, len, w);
  g.fillStyle = css(col || pal.leaf); g.fill();
  g.lineWidth = Math.max(0.6, len * 0.04); g.strokeStyle = css(darken(col || pal.leaf, 0.45), 0.9); g.stroke();
  g.beginPath(); g.moveTo(0, -len * 0.06); g.lineTo(0, -len * 0.88);
  g.strokeStyle = css(lighten(col || pal.leaf, 0.35), 0.8); g.lineWidth = Math.max(0.5, len * 0.03); g.stroke();
  g.restore();
}

// Роза/пион: слои круглых лепестков, центр.
function flower(g, x, y, r, pal, rng, tone) {
  const base = tone || pal.rose;
  g.save(); g.translate(x, y); g.rotate(rng ? rng.range(0, TAU) : 0);
  const line = darken(base, 0.5);
  const layers = [
    { n: 6, rad: 0.58, pr: 0.46, c: darken(base, 0.18) },
    { n: 6, rad: 0.38, pr: 0.4, c: base, off: 0.5 },
    { n: 5, rad: 0.2, pr: 0.3, c: lighten(base, 0.22), off: 0.2 },
  ];
  // тень
  circle(g, r * 0.06, r * 0.1, r * 1.02); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fill();
  for (const L of layers) {
    for (let i = 0; i < L.n; i++) {
      const a = ((i + (L.off || 0)) / L.n) * TAU;
      circle(g, Math.cos(a) * L.rad * r, Math.sin(a) * L.rad * r, L.pr * r);
      g.fillStyle = css(L.c); g.fill();
      g.lineWidth = Math.max(0.6, r * 0.045); g.strokeStyle = css(line, 0.85); g.stroke();
    }
  }
  circle(g, 0, 0, r * 0.22); g.fillStyle = css(mix(base, pal.gold, 0.5)); g.fill();
  g.strokeStyle = css(line, 0.8); g.lineWidth = Math.max(0.5, r * 0.04); g.stroke();
  g.strokeStyle = css(darken(base, 0.35)); g.lineWidth = Math.max(0.5, r * 0.04);
  g.beginPath(); g.arc(0, 0, r * 0.1, 0.5, 4.8); g.stroke();
  g.restore();
}

function bud(g, x, y, r, ang, pal) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.ellipse(0, -r * 0.6, r * 0.6, r, 0, 0, TAU);
  g.fillStyle = css(pal.rose); g.fill(); g.lineWidth = 0.8; g.strokeStyle = css(darken(pal.rose, 0.5)); g.stroke();
  g.beginPath(); g.moveTo(-r * 0.7, -r * 0.1); g.quadraticCurveTo(0, -r * 0.9, r * 0.7, -r * 0.1); g.lineTo(0, r * 0.4); g.closePath();
  g.fillStyle = css(pal.leaf); g.fill(); g.stroke();
  g.restore();
}

// Оленёнок, смотрит вправо; ноги на y=0, длина тела ~ 90.
function fawn(g, s, body, spot, line) {
  g.save(); g.scale(s, s);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const fillP = (fn) => { g.beginPath(); fn(); g.fillStyle = css(body); g.fill(); };
  // ноги
  g.strokeStyle = css(darken(body, 0.12)); g.lineWidth = 4.2;
  const leg = (x0, y0, x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  leg(-28, -36, -30, -18, -27, 0); leg(-18, -34, -14, -17, -16, 0);
  g.strokeStyle = css(body);
  leg(18, -34, 21, -17, 20, 0); leg(28, -36, 32, -18, 31, 0);
  // копытца
  g.fillStyle = css(darken(body, 0.55));
  for (const [x, y] of [[-27, 0], [-16, 0], [20, 0], [31, 0]]) { g.beginPath(); g.ellipse(x, y, 3.2, 1.8, 0, 0, TAU); g.fill(); }
  // туловище
  fillP(() => g.ellipse(-2, -42, 34, 17, -0.04, 0, TAU));
  // шея
  fillP(() => { g.moveTo(14, -52); g.quadraticCurveTo(28, -64, 33, -78); g.lineTo(44, -74); g.quadraticCurveTo(40, -56, 30, -34); g.closePath(); });
  // голова
  fillP(() => g.ellipse(41, -78, 11, 7, -0.28, 0, TAU));
  fillP(() => g.ellipse(51, -74, 5.5, 4, -0.25, 0, TAU));
  g.beginPath(); g.arc(55, -75, 1.8, 0, TAU); g.fillStyle = css(line); g.fill();
  g.beginPath(); g.arc(44, -80, 1.4, 0, TAU); g.fill();
  // уши
  for (const [ex, ey, a] of [[36, -85, -0.6], [31, -83, -1.5]]) {
    g.save(); g.translate(ex, ey); g.rotate(a); g.beginPath(); g.ellipse(0, -5, 3, 7, 0, 0, TAU);
    g.fillStyle = css(body); g.fill(); g.restore();
  }
  // хвост
  fillP(() => { g.moveTo(-34, -48); g.quadraticCurveTo(-42, -52, -39, -58); g.quadraticCurveTo(-34, -54, -32, -50); g.closePath(); });
  // светлое брюшко/грудь
  g.beginPath(); g.ellipse(0, -31, 24, 6, 0, 0, Math.PI); g.fillStyle = css(lighten(body, 0.3), 0.7); g.fill();
  // пятнышки
  g.fillStyle = css(spot);
  const dots = [[-22, -48], [-12, -52], [-2, -50], [8, -52], [-17, -42], [-7, -43], [3, -42], [13, -44], [-24, -37], [-12, -35], [0, -36], [10, -36], [20, -47]];
  for (const [x, y] of dots) { g.beginPath(); g.ellipse(x, y, 2.3, 1.7, 0, 0, TAU); g.fill(); }
  g.restore();
}

// ---- Венок вдоль эллипса ----
function wreath(g, cx, cy, rx, ry, pal, rng, opts = {}) {
  const n = opts.n || 18;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, a]);
  }
  // стебель
  g.strokeStyle = css(darken(pal.leaf, 0.45)); g.lineWidth = 3;
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.stroke();
  // листья снаружи и внутри
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU + 0.12;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const tang = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx);
    for (const side of [-1, 1]) leaf(g, x, y, tang + side * 0.9 + (i % 2 ? 0.2 : -0.2), opts.leafLen || 24, 7.5, pal, i % 3 === 0 ? lighten(pal.leaf, 0.15) : pal.leaf);
  }
  // цветы
  pts.forEach(([x, y, a], i) => {
    const big = i % 3 === 0;
    const tone = i % 3 === 0 ? pal.rose : i % 3 === 1 ? mix(pal.rose, pal.cream, 0.5) : pal.gold;
    if (big) flower(g, x, y, opts.big || 15, pal, rng, tone);
    else if (i % 3 === 1) flower(g, x, y, (opts.big || 15) * 0.66, pal, rng, tone);
    else { bud(g, x, y, 6, a + Math.PI / 2, pal); }
  });
}

function sprayCorner(g, pal, rng) {
  // угловой букетик, рисуется от (0,0) в сторону +x,+y
  for (let i = 0; i < 7; i++) {
    const a = 0.1 + (i / 6) * 1.35;
    leaf(g, 16 + Math.cos(a) * 6, 16 + Math.sin(a) * 6, a, 40 + (i % 2) * 8, 10, pal, i % 2 ? pal.leaf : lighten(pal.leaf, 0.12));
  }
  flower(g, 24, 24, 20, pal, rng, pal.rose);
  flower(g, 58, 22, 11, pal, rng, mix(pal.rose, pal.cream, 0.5));
  flower(g, 22, 58, 11, pal, rng, mix(pal.rose, pal.cream, 0.5));
  flower(g, 46, 46, 8, pal, rng, pal.gold);
}

// ---- Кайма ----
function border(g, pal, rng, kind) {
  const bw = 46;
  // базовый фон каймы
  g.fillStyle = css(pal.border); g.fillRect(0, 0, CW, CH);
  const lines = (o, w, c) => { g.strokeStyle = css(c); g.lineWidth = w; g.strokeRect(o + w / 2, o + w / 2, CW - 2 * o - w, CH - 2 * o - w); };
  lines(6, 2.4, pal.gold); lines(11, 1.2, pal.cream);
  lines(bw - 6, 1.2, pal.cream); lines(bw - 3, 2.4, pal.gold);
  // ромбики-решётка по ленте
  g.save();
  g.beginPath(); g.rect(14, 14, CW - 28, CH - 28); g.rect(bw - 8, bw - 8, CW - 2 * bw + 16, CH - 2 * bw + 16); g.clip('evenodd');
  g.fillStyle = css(lighten(pal.border, 0.1), 0.55);
  for (let y = 10; y < CH; y += 12) for (let x = 10 + ((y / 12) % 2) * 6; x < CW; x += 12) { lozenge(g, x, y, 3, 4.5); g.fill(); }
  g.restore();
  // мотивы
  const mid = 25;
  const W = CW - 2 * mid, H = CH - 2 * mid;
  const per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [mid + t, mid, 0];
    t -= W; if (t < H) return [mid + W, mid + t, Math.PI / 2];
    t -= H; if (t < W) return [mid + W - t, mid + H, Math.PI];
    t -= W; return [mid, mid + H - t, -Math.PI / 2];
  };
  const N = kind === 0 ? 34 : 30;
  for (let i = 0; i < N; i++) {
    const [x, y, a] = pt(((i + 0.5) / N) * per);
    g.save(); g.translate(x, y); g.rotate(a);
    if (kind === 0) {
      // цветок и пара листьев
      if (i % 2 === 0) flower(g, 0, 0, 9.5, pal, null, i % 4 === 0 ? pal.rose : mix(pal.rose, pal.cream, 0.55));
      else { leaf(g, -2, 0, -Math.PI / 2 - 0.5, 12, 4.5, pal); leaf(g, 2, 0, -Math.PI / 2 + 0.5, 12, 4.5, pal); circle(g, 0, 0, 2.4); g.fillStyle = css(pal.gold); g.fill(); }
    } else {
      // капля-пальметта и ромб
      if (i % 2 === 0) {
        lozenge(g, 0, 0, 8, 10); g.fillStyle = css(pal.cream); g.fill(); g.lineWidth = 1; g.strokeStyle = css(pal.dark); g.stroke();
        lozenge(g, 0, 0, 4, 5.5); g.fillStyle = css(pal.rose); g.fill();
      } else {
        g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-8, 4, -7, -6, 0, -9); g.bezierCurveTo(7, -6, 8, 4, 0, 8); g.fillStyle = css(pal.gold); g.fill();
        g.lineWidth = 0.9; g.strokeStyle = css(pal.dark); g.stroke(); circle(g, 0, 0, 2); g.fillStyle = css(pal.leaf); g.fill();
      }
    }
    g.restore();
  }
  // угловые розетки
  for (const [x, y] of [[mid, mid], [CW - mid, mid], [mid, CH - mid], [CW - mid, CH - mid]]) {
    circle(g, x, y, 17); g.fillStyle = css(pal.dark); g.fill(); g.lineWidth = 2; g.strokeStyle = css(pal.gold); g.stroke();
    flower(g, x, y, 14, pal, null, pal.rose);
  }
  return bw + 1;
}

function fieldTexture(g, pal, x, y, w, h, color2) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  // дамаск: решётка ромбов и точки
  g.strokeStyle = css(color2, 0.5); g.lineWidth = 0.9;
  for (let i = -h; i < w + h; i += 20) {
    g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i + h, y + h); g.stroke();
    g.beginPath(); g.moveTo(x + i + h, y); g.lineTo(x + i, y + h); g.stroke();
  }
  g.fillStyle = css(color2, 0.8);
  for (let yy = y + 10; yy < y + h; yy += 20) for (let xx = x + 10; xx < x + w; xx += 20) { circle(g, xx, yy, 1.8); g.fill(); }
  g.restore();
}

function scatterSmall(g, pal, rng, x, y, w, h, avoid) {
  for (let i = 0; i < 40; i++) {
    const px = rng.range(x + 14, x + w - 14), py = rng.range(y + 14, y + h - 14);
    if (avoid(px, py)) continue;
    const a = rng.range(0, TAU);
    leaf(g, px, py, a, 9, 3.2, pal, mix(pal.leaf, pal.field, 0.35));
  }
}

function compWreath(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2, cy = CH / 2;
  const rx = fw * 0.38, ry = fh * 0.37;
  fieldTexture(g, pal, fx, fy, fw, fh, pal.field2);
  // угловые веточки
  for (const [sx, sy, ox, oy] of [[1, 1, fx, fy], [-1, 1, fx + fw, fy], [1, -1, fx, fy + fh], [-1, -1, fx + fw, fy + fh]]) {
    g.save(); g.translate(ox + sx * 6, oy + sy * 6); g.scale(sx, sy); sprayCorner(g, pal, rng); g.restore();
  }
  // овальный фон
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fillStyle = css(mix(pal.field, pal.dark, 0.25)); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.clip();
  fieldTexture(g, pal, cx - rx, cy - ry, rx * 2, ry * 2, mix(pal.field2, pal.dark, 0.2));
  // букет в центре
  const stems = [[-34, 80, -12, 40], [34, 80, 14, 40], [0, 90, 0, 30], [-60, 60, -30, 30], [60, 60, 30, 30]];
  g.strokeStyle = css(darken(pal.leaf, 0.4)); g.lineWidth = 3; g.lineCap = 'round';
  for (const [x1, y1, x2, y2] of stems) { g.beginPath(); g.moveTo(cx + x1 * 0.2, cy + y1 + 30); g.quadraticCurveTo(cx + x2, cy + y2 + 30, cx + x2, cy + y2 - 10); g.stroke(); }
  for (const [a, x, y, l] of [[-0.9, -42, 36, 40], [0.9, 42, 36, 40], [-1.3, -30, 66, 34], [1.3, 30, 66, 34], [-2, -50, 6, 32], [2, 50, 6, 32], [-1.57, -14, 90, 30], [-1.57, 14, 90, 30]]) {
    leaf(g, cx + x, cy + y + 8, a - Math.PI / 2 + Math.PI / 2, l, 11, pal);
  }
  flower(g, cx, cy - 20, 46, pal, rng, pal.rose);
  flower(g, cx - 48, cy + 14, 24, pal, rng, mix(pal.rose, pal.cream, 0.5));
  flower(g, cx + 48, cy + 14, 24, pal, rng, pal.gold);
  flower(g, cx - 30, cy - 70, 17, pal, rng, pal.gold);
  flower(g, cx + 30, cy - 70, 17, pal, rng, mix(pal.rose, pal.cream, 0.5));
  flower(g, cx, cy + 56, 20, pal, rng, pal.rose);
  g.restore();
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.lineWidth = 2; g.strokeStyle = css(pal.gold); g.stroke();
  wreath(g, cx, cy, rx + 8, ry + 8, pal, rng, { n: 20, big: 15 });
}

function compFawns(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2, cy = CH / 2;
  fieldTexture(g, pal, fx, fy, fw, fh, pal.field2);
  for (const [sx, sy, ox, oy] of [[1, 1, fx, fy], [-1, 1, fx + fw, fy], [1, -1, fx, fy + fh], [-1, -1, fx + fw, fy + fh]]) {
    g.save(); g.translate(ox + sx * 6, oy + sy * 6); g.scale(sx, sy); sprayCorner(g, pal, rng); g.restore();
  }
  const rx = fw * 0.4, ry = fh * 0.38;
  // небо/фон овала
  const grad = g.createLinearGradient(0, cy - ry, 0, cy + ry);
  grad.addColorStop(0, css(mix(pal.border, pal.dark, 0.55))); grad.addColorStop(1, css(mix(pal.border, pal.leaf, 0.4)));
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fillStyle = grad; g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.clip();
  // звёзды и месяц
  g.fillStyle = css(pal.gold, 0.85);
  for (let i = 0; i < 22; i++) { const px = rng.range(cx - rx, cx + rx), py = rng.range(cy - ry, cy - 10); circle(g, px, py, rng.range(0.8, 1.8)); g.fill(); }
  circle(g, cx, cy - ry * 0.55, 30); g.fillStyle = css(pal.cream, 0.95); g.fill();
  circle(g, cx + 10, cy - ry * 0.55 - 4, 26); g.fillStyle = css(mix(pal.border, pal.dark, 0.58)); g.fill();
  // холмы
  const hill = (y0, c) => { g.beginPath(); g.moveTo(cx - rx - 5, y0 + 30); g.bezierCurveTo(cx - rx * 0.5, y0 - 30, cx + rx * 0.2, y0 + 20, cx + rx + 5, y0 - 10); g.lineTo(cx + rx + 5, cy + ry + 5); g.lineTo(cx - rx - 5, cy + ry + 5); g.closePath(); g.fillStyle = css(c); g.fill(); };
  hill(cy + ry * 0.2, mix(pal.leaf, pal.dark, 0.55));
  hill(cy + ry * 0.45, mix(pal.leaf, pal.dark, 0.2));
  // трава-цветочки у земли
  for (let i = 0; i < 26; i++) {
    const px = rng.range(cx - rx + 10, cx + rx - 10), py = cy + ry * rng.range(0.55, 0.92);
    leaf(g, px, py, -Math.PI / 2 + rng.range(-0.5, 0.5), rng.range(10, 16), 3.4, pal, lighten(pal.leaf, 0.1));
  }
  // центральный куст с цветами
  const gy = cy + ry * 0.46;
  g.strokeStyle = css(darken(pal.leaf, 0.4)); g.lineWidth = 3; g.lineCap = 'round';
  for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(cx + dx * 0.3, gy); g.quadraticCurveTo(cx + dx * 1.6, gy - 30, cx + dx, gy - 60 - Math.abs(dx)); g.stroke(); }
  for (const [a, x, y] of [[-0.8, -10, -20], [0.8, 10, -26], [-1.1, -6, -8], [1.1, 6, -10]]) leaf(g, cx + x, gy + y, a - Math.PI / 2, 24, 8, pal);
  flower(g, cx, gy - 72, 20, pal, rng, pal.rose);
  flower(g, cx - 15, gy - 60, 11, pal, rng, pal.gold);
  flower(g, cx + 16, gy - 62, 12, pal, rng, mix(pal.rose, pal.cream, 0.5));
  // оленята
  const body = mix(pal.cream, pal.gold, 0.35);
  const spot = lighten(pal.cream, 0.4);
  g.save(); g.translate(cx - 62, gy + 6); fawn(g, 0.8, body, spot, pal.dark); g.restore();
  g.save(); g.translate(cx + 62, gy + 6); g.scale(-1, 1); fawn(g, 0.8, body, spot, pal.dark); g.restore();
  g.restore();
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.lineWidth = 2.4; g.strokeStyle = css(pal.gold); g.stroke();
  wreath(g, cx, cy, rx + 9, ry + 9, pal, rng, { n: 20, big: 14, leafLen: 22 });
}

function compLattice(g, pal, rng, fx, fy, fw, fh) {
  fieldTexture(g, pal, fx, fy, fw, fh, pal.field2);
  g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
  const sx = 82, sy = 82;
  const cols = Math.ceil(fw / sx) + 1, rows = Math.ceil(fh / sy) + 1;
  const ox = fx + fw / 2 - (cols % 2 ? 0 : sx / 2), oy = fy + fh / 2 - (rows % 2 ? 0 : sy / 2);
  const cells = [];
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
    const x = fx + fw / 2 + i * sx + (j % 2 ? sx / 2 : 0), y = fy + fh / 2 + j * sy * 0.86;
    if (x < fx - 20 || x > fx + fw + 20 || y < fy - 20 || y > fy + fh + 20) continue;
    cells.push([x, y, i, j]);
  }
  // листья и завитки между цветами
  for (const [x, y, i, j] of cells) {
    for (let k = 0; k < 6; k++) leaf(g, x, y, (k / 6) * TAU + 0.4, 36, 9, pal, k % 2 ? pal.leaf : lighten(pal.leaf, 0.12));
  }
  for (const [x, y, i, j] of cells) {
    const tone = (i + j) % 3 === 0 ? pal.rose : (i + j) % 3 === 1 ? mix(pal.rose, pal.cream, 0.5) : pal.gold;
    flower(g, x, y, 22, pal, rng, tone);
  }
  // мелкие цветы-«звёздочки» между
  for (const [x, y, i, j] of cells) {
    const px = x + sx / 2, py = y + sy * 0.43 * 0.86 * 2 / 2;
    flower(g, x + sx / 2, y, 7, pal, rng, pal.cream);
    flower(g, x, y + sy * 0.43, 7, pal, rng, pal.cream);
  }
  g.restore();
  // центральный медальон-овал поверх
  const cx = CW / 2, cy = CH / 2;
  g.beginPath(); g.ellipse(cx, cy, 56, 78, 0, 0, TAU); g.fillStyle = css(pal.dark); g.fill();
  g.lineWidth = 3; g.strokeStyle = css(pal.gold); g.stroke();
  g.beginPath(); g.ellipse(cx, cy, 48, 70, 0, 0, TAU); g.fillStyle = css(pal.field); g.fill();
  g.lineWidth = 1; g.strokeStyle = css(pal.cream); g.stroke();
  for (let k = 0; k < 8; k++) leaf(g, cx, cy, (k / 8) * TAU, 36, 10, pal);
  flower(g, cx, cy, 32, pal, rng, pal.rose);
  flower(g, cx, cy, 13, pal, rng, pal.cream);
}

export default {
  id: 'retro', name: 'Ретро',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const variant = rng.int(0, 2);
    const inset = border(g, pal, rng.fork('b'), rng.int(0, 1));
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    g.fillStyle = css(pal.field); g.fillRect(fx, fy, fw, fh);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    const r = rng.fork('f');
    if (variant === 0) compWreath(g, pal, r, fx, fy, fw, fh);
    else if (variant === 1) compFawns(g, pal, r, fx, fy, fw, fh);
    else compLattice(g, pal, r, fx, fy, fw, fh);
    g.restore();
    // тонкая рамка поля
    g.strokeStyle = css(pal.gold); g.lineWidth = 1.4; g.strokeRect(fx, fy, fw, fh);
    return { edge: darken(pal.border, 0.4), fringe: [238, 226, 196] };
  },
};
