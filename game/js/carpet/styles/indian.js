// Индийский (могольский): ограновые решётки-«джали», лотосы, боте/пейсли, цветущие веточки, золотые контуры.
import { CW, CH, css, mix, lighten, darken, pickPalette, petalPath, polar, quad, RNG } from '../kit.js';

const PALS = [
  { field: [128, 22, 38], border: [20, 68, 56], gold: [228, 184, 84], p1: [228, 112, 132], p2: [246, 232, 204], p3: [44, 78, 150], leaf: [52, 134, 92], dark: [40, 10, 16], edge: [58, 14, 22] },
  { field: [20, 30, 74], border: [116, 24, 44], gold: [232, 190, 92], p1: [236, 120, 110], p2: [246, 234, 208], p3: [40, 150, 140], leaf: [62, 142, 96], dark: [8, 12, 36], edge: [14, 20, 54] },
  { field: [238, 226, 196], border: [24, 78, 64], gold: [196, 144, 52], p1: [182, 40, 58], p2: [248, 240, 220], p3: [40, 74, 140], leaf: [56, 134, 86], dark: [50, 30, 20], edge: [20, 60, 48] },
  { field: [18, 84, 72], border: [112, 24, 44], gold: [232, 188, 88], p1: [240, 140, 150], p2: [248, 236, 210], p3: [226, 150, 50], leaf: [90, 170, 100], dark: [6, 36, 30], edge: [14, 52, 46] },
  { field: [98, 30, 92], border: [24, 100, 108], gold: [232, 190, 96], p1: [240, 120, 150], p2: [248, 236, 214], p3: [230, 150, 56], leaf: [70, 150, 100], dark: [34, 10, 32], edge: [52, 16, 50] },
  { field: [36, 30, 40], border: [128, 28, 44], gold: [228, 186, 90], p1: [226, 96, 110], p2: [244, 232, 206], p3: [40, 140, 150], leaf: [70, 150, 96], dark: [14, 10, 16], edge: [22, 16, 26] },
  { field: [186, 82, 40], border: [64, 24, 60], gold: [244, 208, 110], p1: [248, 226, 190], p2: [240, 150, 150], p3: [38, 92, 120], leaf: [52, 120, 80], dark: [60, 20, 12], edge: [90, 34, 24] },
];

const stroke = (g, col, lw) => { g.strokeStyle = css(col); g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; };

function leaf(g, len, w, fill, vein) {
  petalPath(g, len, w);
  g.fillStyle = css(fill); g.fill();
  g.lineWidth = Math.max(0.5, len * 0.05); g.strokeStyle = css(vein, 0.8); g.stroke();
  g.beginPath(); g.moveTo(0, -len * 0.06); g.lineTo(0, -len * 0.82);
  g.lineWidth = Math.max(0.4, len * 0.035); g.strokeStyle = css(vein, 0.7); g.stroke();
}

// Радиальный цветок
function bloom(g, r, n, c1, c2, c3, gold) {
  g.save();
  for (let i = 0; i < n; i++) {
    g.save(); g.rotate((i * Math.PI * 2) / n);
    petalPath(g, r, r * (n > 7 ? 0.26 : 0.36));
    g.fillStyle = css(c1); g.fill();
    stroke(g, gold, Math.max(0.5, r * 0.05)); g.stroke();
    g.restore();
  }
  for (let i = 0; i < n; i++) {
    g.save(); g.rotate(((i + 0.5) * Math.PI * 2) / n);
    petalPath(g, r * 0.66, r * (n > 7 ? 0.2 : 0.28));
    g.fillStyle = css(c2); g.fill();
    stroke(g, gold, Math.max(0.4, r * 0.035)); g.stroke();
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, r * 0.26, 0, Math.PI * 2);
  g.fillStyle = css(c3); g.fill(); stroke(g, gold, Math.max(0.5, r * 0.05)); g.stroke();
  g.beginPath(); g.arc(0, 0, r * 0.1, 0, Math.PI * 2);
  g.fillStyle = css(gold); g.fill();
  g.restore();
}

// Лотос сбоку: растёт вверх от (0,0)
function lotus(g, s, c1, c2, gold, lf) {
  g.save();
  for (const sg of [-1, 1]) { g.save(); g.rotate(sg * 1.25); leaf(g, s * 0.62, s * 0.14, lf, darken(lf, 0.5)); g.restore(); }
  const ps = [[-1.05, 0.7, 0.2], [1.05, 0.7, 0.2], [-0.52, 0.92, 0.22], [0.52, 0.92, 0.22], [0, 1, 0.24]];
  ps.forEach(([a, l, w], k) => {
    g.save(); g.rotate(a);
    petalPath(g, s * l, s * w);
    g.fillStyle = css(k < 2 ? mix(c1, c2, 0.4) : c1); g.fill();
    stroke(g, gold, Math.max(0.5, s * 0.03)); g.stroke();
    g.beginPath(); g.moveTo(0, -s * l * 0.1); g.lineTo(0, -s * l * 0.7);
    g.strokeStyle = css(c2, 0.9); g.lineWidth = Math.max(0.5, s * 0.05); g.stroke();
    g.restore();
  });
  g.beginPath(); g.arc(0, 0, s * 0.1, 0, Math.PI * 2); g.fillStyle = css(gold); g.fill();
  g.restore();
}

function paisleyPath(g, s) {
  g.beginPath();
  g.moveTo(0, s * 0.5);
  g.bezierCurveTo(-s * 0.46, s * 0.5, -s * 0.52, -s * 0.02, -s * 0.22, -s * 0.3);
  g.bezierCurveTo(-s * 0.08, -s * 0.44, s * 0.1, -s * 0.52, s * 0.3, -s * 0.44);
  g.bezierCurveTo(s * 0.1, -s * 0.3, s * 0.16, -s * 0.1, s * 0.3, s * 0.08);
  g.bezierCurveTo(s * 0.44, s * 0.3, s * 0.3, s * 0.5, 0, s * 0.5);
  g.closePath();
}

// Боте с вложенными слоями и цветком в основании
function boteh(g, s, c1, c2, c3, gold, flowerCol) {
  paisleyPath(g, s); g.fillStyle = css(c1); g.fill(); stroke(g, gold, Math.max(0.7, s * 0.025)); g.stroke();
  g.save(); g.translate(0, s * 0.07); g.scale(0.74, 0.74);
  paisleyPath(g, s); g.fillStyle = css(c2); g.fill(); stroke(g, gold, Math.max(0.5, s * 0.02)); g.stroke();
  g.restore();
  g.save(); g.translate(0, s * 0.13); g.scale(0.5, 0.5);
  paisleyPath(g, s); g.fillStyle = css(c3); g.fill(); stroke(g, gold, Math.max(0.4, s * 0.016)); g.stroke();
  g.restore();
  // капельки по дуге
  g.fillStyle = css(gold);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const x = -s * 0.36 + t * s * 0.1, y = s * 0.3 - t * s * 0.55;
    g.beginPath(); g.arc(x - Math.sin(t * 3) * s * 0.02, y, s * 0.018, 0, 7); g.fill();
  }
  g.save(); g.translate(-s * 0.02, s * 0.24);
  bloom(g, s * 0.13, 6, flowerCol[0], flowerCol[1], gold, gold);
  g.restore();
}

function ogeePath(g, w, h) {
  g.beginPath();
  g.moveTo(0, -h / 2);
  g.bezierCurveTo(w * 0.08, -h * 0.33, w / 2, -h * 0.26, w / 2, 0);
  g.bezierCurveTo(w / 2, h * 0.26, w * 0.08, h * 0.33, 0, h / 2);
  g.bezierCurveTo(-w * 0.08, h * 0.33, -w / 2, h * 0.26, -w / 2, 0);
  g.bezierCurveTo(-w / 2, -h * 0.26, -w * 0.08, -h * 0.33, 0, -h / 2);
  g.closePath();
}

// Веточка с цветком: от (x,y) под углом a (0 = вверх), длина len
function sprig(g, pal, x, y, a, len, kind, rng) {
  g.save(); g.translate(x, y); g.rotate(a);
  const bend = rng.range(-0.35, 0.35) * len;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(bend, -len * 0.5, bend * 0.4, -len);
  stroke(g, pal.leaf, 2.2); g.stroke();
  stroke(g, pal.gold, 0.7); g.stroke();
  const ptAt = (t) => {
    const u = 1 - t;
    return [2 * u * t * bend + t * t * bend * 0.4, -(2 * u * t * len * 0.5 + t * t * len)];
  };
  for (const [t, sg] of [[0.35, -1], [0.55, 1], [0.75, -1]]) {
    const [px, py] = ptAt(t);
    g.save(); g.translate(px, py); g.rotate(sg * 1.0);
    leaf(g, len * 0.36, len * 0.11, pal.leaf, darken(pal.leaf, 0.5));
    g.restore();
  }
  const [ex, ey] = ptAt(1);
  g.translate(ex, ey);
  if (kind === 0) bloom(g, len * 0.27, 6, pal.p1, pal.p2, pal.p3, pal.gold);
  else if (kind === 1) lotus(g, len * 0.44, pal.p1, pal.p2, pal.gold, pal.leaf);
  else bloom(g, len * 0.23, 8, pal.p2, pal.p1, pal.p3, pal.gold);
  g.restore();
}

function ground(g, pal, x, y, w, h, rng) {
  // тонкая решётка точек и мелких четырёхлепестковых цветочков в тон
  const c = mix(pal.field, pal.gold, 0.22);
  g.fillStyle = css(c, 0.5);
  let row = 0;
  for (let yy = y + 8; yy < y + h; yy += 13, row++) {
    for (let xx = x + 8 + (row % 2) * 6.5; xx < x + w; xx += 13) {
      g.beginPath(); g.arc(xx, yy, 1.1, 0, 7); g.fill();
    }
  }
  // лёгкие неровности цвета
  for (let i = 0; i < 10; i++) {
    const px = rng.range(x, x + w), py = rng.range(y, y + h), r = rng.range(40, 100);
    const gr = g.createRadialGradient(px, py, 0, px, py, r);
    const col = rng.chance(0.5) ? [255, 235, 200] : [0, 0, 0];
    gr.addColorStop(0, css(col, 0.07)); gr.addColorStop(1, css(col, 0));
    g.fillStyle = gr; g.fillRect(px - r, py - r, r * 2, r * 2);
  }
}

// ---- Кайма ----
function frameRect(g, ins, th, col) {
  g.fillStyle = css(col);
  g.beginPath(); g.rect(ins, ins, CW - 2 * ins, CH - 2 * ins);
  g.rect(ins + th, ins + th, CW - 2 * ins - 2 * th, CH - 2 * ins - 2 * th);
  g.fill('evenodd');
}

function border(g, pal, rng) {
  g.fillStyle = css(pal.dark); g.fillRect(0, 0, CW, CH);
  g.fillStyle = css(pal.border); g.fillRect(7, 7, CW - 14, CH - 14);
  // лёгкий узор на фоне каймы
  g.fillStyle = css(mix(pal.border, pal.gold, 0.2), 0.4);
  for (let y = 15; y < CH - 14; y += 10) for (let x = 15; x < CW - 14; x += 10) {
    if (x > 44 && x < CW - 44 && y > 44 && y < CH - 44) continue;
    g.beginPath(); g.arc(x, y, 0.9, 0, 7); g.fill();
  }
  frameRect(g, 7, 2, pal.gold);
  frameRect(g, 11, 1.2, pal.p2);
  frameRect(g, 41, 1.2, pal.p2);
  frameRect(g, 44, 2.2, pal.gold);
  // зубчики на guard-полосках
  g.fillStyle = css(pal.gold, 0.8);
  const c0 = 26;
  const x0 = c0, W = CW - 2 * c0, H = CH - 2 * c0;
  const per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [x0 + t, c0, 0, 1];
    t -= W; if (t < H) return [x0 + W, c0 + t, -1, 0];
    t -= H; if (t < W) return [x0 + W - t, c0 + H, 0, -1];
    t -= W; return [c0, c0 + H - t, 1, 0];
  };
  const N = rng.pick([22, 26, 30]) * 2; // чётное число
  // стебель-волна
  g.beginPath();
  const SEG = N * 8;
  for (let i = 0; i <= SEG; i++) {
    const t = (i / SEG) * per;
    const [x, y, nx, ny] = pt(t);
    const off = Math.sin((i / 8) * Math.PI) * 5;
    const px = x + nx * off, py = y + ny * off;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  stroke(g, pal.leaf, 2.4); g.stroke();
  stroke(g, pal.gold, 0.9); g.stroke();
  const motif = rng.int(0, 1);
  for (let i = 0; i < N; i++) {
    const [x, y, nx, ny] = pt(((i + 0.5) / N) * per);
    const off = Math.sin(((i + 0.5)) * Math.PI) * 5; // + на нечётных, - на чётных
    const px = x + nx * off, py = y + ny * off;
    const side = off > 0 ? 1 : -1;
    // листья
    g.save(); g.translate(px, py);
    g.rotate(Math.atan2(nx, -ny) + (side > 0 ? 0 : Math.PI));
    if (i % 2 === 0) {
      // цветок
      if (motif === 0) lotus(g, 15, pal.p1, pal.p2, pal.gold, pal.leaf);
      else bloom(g, 8.5, 6, i % 4 === 0 ? pal.p1 : pal.p2, i % 4 === 0 ? pal.p2 : pal.p1, pal.p3, pal.gold);
    } else {
      g.rotate(0.9); leaf(g, 12, 3.6, pal.leaf, darken(pal.leaf, 0.5));
      g.rotate(-1.8); leaf(g, 12, 3.6, pal.leaf, darken(pal.leaf, 0.5));
    }
    g.restore();
  }
  // угловые цветы
  for (const [x, y] of [[c0, c0], [CW - c0, c0], [c0, CH - c0], [CW - c0, CH - c0]]) {
    g.beginPath(); g.arc(x, y, 14, 0, 7); g.fillStyle = css(pal.dark); g.fill();
    g.save(); g.translate(x, y); bloom(g, 14, 10, pal.p1, pal.p2, pal.p3, pal.gold); g.restore();
  }
  return 46;
}

// ---- Композиции ----
function compOgee(g, pal, rng, fx, fy, fw, fh) {
  const cols = rng.pick([2, 3, 3]);
  const sx = fw / cols;
  const w = sx * 1.0, h = w * rng.range(1.45, 1.65);
  const kind = rng.int(0, 2);
  const fillA = mix(pal.field, pal.dark, 0.35);
  const fillB = mix(pal.border, pal.field, 0.35);
  const rows = Math.ceil(fh / h) + 2;
  const base = fy + fh / 2 - h / 2 - Math.floor(rows / 2) * h + (rng.chance(0.5) ? 0 : h / 2);
  for (let c = 0; c < cols; c++) {
    const x = fx + sx * (c + 0.5);
    for (let r = 0; r < rows; r++) {
      const y = base + r * h + (c % 2 ? h / 2 : 0);
      if (y < fy - h / 2 || y > fy + fh + h / 2) continue;
      g.save(); g.translate(x, y);
      ogeePath(g, w * 0.98, h * 0.98);
      g.fillStyle = css((c + r) % 2 ? fillB : fillA); g.fill();
      stroke(g, pal.gold, 2); g.stroke();
      g.save(); g.scale(0.88, 0.88); ogeePath(g, w * 0.98, h * 0.98); stroke(g, pal.p2, 0.7); g.globalAlpha = 0.7; g.stroke(); g.globalAlpha = 1; g.restore();
      // растение
      const alt = (c + r) % 2;
      g.beginPath(); g.moveTo(0, h * 0.4); g.bezierCurveTo(-w * 0.04, h * 0.2, w * 0.04, h * 0.1, 0, -h * 0.02);
      stroke(g, pal.leaf, 2); g.stroke();
      for (const sg of [-1, 1]) {
        g.save(); g.translate(0, h * 0.26); g.rotate(sg * 0.9);
        leaf(g, h * 0.2, h * 0.05, pal.leaf, darken(pal.leaf, 0.5)); g.restore();
        g.save(); g.translate(0, h * 0.14); g.rotate(sg * 0.5);
        leaf(g, h * 0.17, h * 0.045, pal.leaf, darken(pal.leaf, 0.5)); g.restore();
      }
      g.save(); g.translate(0, -h * 0.02);
      if (kind === 0) lotus(g, h * 0.3, alt ? pal.p2 : pal.p1, alt ? pal.p1 : pal.p2, pal.gold, pal.leaf);
      else if (kind === 1) { g.translate(0, -h * 0.08); bloom(g, w * 0.26, 8, alt ? pal.p2 : pal.p1, alt ? pal.p1 : pal.p2, pal.p3, pal.gold); }
      else boteh(g, h * 0.38, alt ? pal.p1 : pal.p3, pal.p2, alt ? pal.p3 : pal.p1, pal.gold, [pal.p2, pal.p1]);
      g.restore();
      // боковые бутоны
      for (const sg of [-1, 1]) {
        g.save(); g.translate(sg * w * 0.28, h * 0.1 - h * 0.05); g.rotate(sg * 0.25);
        if (kind !== 1) bloom(g, w * 0.08, 5, pal.p1, pal.p2, pal.p3, pal.gold);
        else lotus(g, h * 0.1, pal.p1, pal.p2, pal.gold, pal.leaf);
        g.restore();
      }
      // верхний и нижний кончики — капельки
      g.fillStyle = css(pal.gold);
      for (const sy of [-1, 1]) { g.beginPath(); g.arc(0, sy * h * 0.42, 2, 0, 7); g.fill(); }
      g.restore();
      // цветочек в зазоре справа
      if (c < cols - 1) {
        for (const dy of [h * 0.25, h * 0.75]) {
          g.save(); g.translate(x + sx / 2, y + dy - (dy > h / 2 ? h : 0) + 0);
          bloom(g, 7, 4, pal.p1, pal.p2, pal.gold, pal.gold);
          g.restore();
        }
      }
    }
  }
  // цветочки по левому/правому краю (половинки зазоров)
  void rng;
}

function medallionPath(g, R, lobes, amp, sy) {
  polar(g, 0, 0, 0, (a) => R * (1 + amp * Math.cos(lobes * a)));
}

function compMedallion(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2, cy = CH / 2;
  const seed = rng.s;
  const lobes = rng.pick([6, 8, 10]);
  const sy = 1.35;
  const R = 88;
  // ветки в углах (панель закроет лишнее)
  const kinds = [rng.int(0, 2), rng.int(0, 2), rng.int(0, 2)];
  quad(g, cx, cy, (q) => {
    const r = new RNG(seed ^ 0x9e37);
    const hw = fw / 2, hh = fh / 2;
    const starts = [[96, 150], [112, 118], [122, 74], [70, 188], [40, 204], [92, 196], [118, 160], [124, 20], [20, 214]];
    starts.forEach(([sx0, sy0], i) => {
      const a = Math.atan2(hw - sx0, -(hh - sy0)) + r.range(-0.6, 0.6);
      sprig(q, pal, sx0, sy0, a, r.range(36, 56), kinds[i % 3], r);
    });
  });
  // картуш-панель
  g.save(); g.translate(cx, cy);
  ogeePath(g, fw * 0.96, fh * 0.98);
  g.fillStyle = css(mix(pal.field, pal.dark, 0.28)); g.fill(); stroke(g, pal.gold, 2); g.stroke();
  g.save(); g.scale(0.95, 0.96); ogeePath(g, fw * 0.96, fh * 0.98); stroke(g, pal.p2, 0.7); g.globalAlpha = 0.6; g.stroke(); g.restore();
  g.restore();
  // внутри панели: цветочки в просветах
  quad(g, cx, cy, (q) => {
    q.save(); q.translate(62, 150); q.rotate(0.3);
    for (const sg of [-1, 1]) { q.save(); q.rotate(sg * 1.2); leaf(q, 24, 7, pal.leaf, darken(pal.leaf, 0.5)); q.restore(); }
    bloom(q, 15, 8, pal.p1, pal.p2, pal.p3, pal.gold);
    q.restore();
    q.save(); q.translate(0, 192);
    for (const sg of [-1, 1]) { q.save(); q.rotate(sg * 1.3); leaf(q, 16, 5, pal.leaf, darken(pal.leaf, 0.5)); q.restore(); }
    bloom(q, 9, 6, pal.p2, pal.p1, pal.gold, pal.gold);
    q.restore();
    q.save(); q.translate(92, 80);
    bloom(q, 8, 6, pal.p2, pal.p1, pal.gold, pal.gold);
    q.restore();
  });
  quad(g, cx, cy, (q) => {
    const hw = fw / 2, hh = fh / 2;
    // угол: четверть-цветок
    q.save(); q.translate(hw, hh);
    q.beginPath(); q.arc(0, 0, 54, Math.PI, Math.PI * 1.5); q.lineTo(0, 0); q.closePath();
    q.fillStyle = css(mix(pal.field, pal.dark, 0.45)); q.fill(); stroke(q, pal.gold, 1.6); q.stroke();
    q.beginPath(); q.arc(0, 0, 44, Math.PI, Math.PI * 1.5); stroke(q, pal.p2, 0.7); q.stroke();
    q.save(); q.translate(-17, -17); bloom(q, 20, 10, pal.p1, pal.p2, pal.p3, pal.gold); q.restore();
    q.restore();
    // боковой боте у оси
    q.save(); q.translate(hw - 26, 36); q.rotate(-0.1);
    boteh(q, 54, pal.p1, pal.p2, pal.p3, pal.gold, [pal.p2, pal.p1]);
    q.restore();
  });
  // медальон
  g.save(); g.translate(cx, cy);
  g.save(); g.scale(1, sy);
  medallionPath(g, R * 1.1, lobes, 0.07);
  g.fillStyle = css(pal.dark, 0.4); g.fill();
  medallionPath(g, R, lobes, 0.09);
  g.fillStyle = css(pal.border); g.fill(); stroke(g, pal.gold, 2.4); g.stroke();
  medallionPath(g, R * 0.84, lobes, 0.07);
  g.fillStyle = css(mix(pal.field, pal.dark, 0.25)); g.fill(); stroke(g, pal.p2, 0.9); g.stroke();
  g.restore();
  // кольцо лепестков
  g.save(); g.scale(1, sy);
  for (let i = 0; i < lobes * 2; i++) {
    g.save(); g.rotate((i * Math.PI) / lobes);
    g.translate(0, -R * 0.64);
    petalPath(g, R * 0.2, R * 0.075);
    g.fillStyle = css(i % 2 ? pal.p1 : pal.p2); g.fill(); stroke(g, pal.gold, 0.7); g.stroke();
    g.restore();
  }
  g.restore();
  g.save(); g.scale(1, sy);
  bloom(g, R * 0.58, lobes * 2, pal.p1, pal.p2, pal.p3, pal.gold);
  g.restore();
  g.save(); g.scale(1, sy * 0.95);
  bloom(g, R * 0.3, 12, pal.p3, pal.p1, pal.gold, pal.gold);
  g.restore();
  // верхний и нижний «кончики» (ogee)
  for (const s of [-1, 1]) {
    g.save(); g.translate(0, s * R * sy * 1.08); g.scale(1, s);
    ogeePath(g, R * 0.36, R * 0.8); g.fillStyle = css(pal.p3); g.fill(); stroke(g, pal.gold, 1.6); g.stroke();
    g.translate(0, 0); g.scale(0.55, 0.55); ogeePath(g, R * 0.36, R * 0.8); g.fillStyle = css(pal.p1); g.fill(); stroke(g, pal.gold, 1); g.stroke();
    g.restore();
  }
  g.restore();
}

function compBoteh(g, pal, rng, fx, fy, fw, fh) {
  const cols = rng.pick([2, 3]);
  const sxp = fw / cols;
  const s = sxp * rng.range(0.82, 0.95);
  const stepY = s * 0.95;
  const rows = Math.ceil(fh / stepY) + 1;
  const oy = fy + fh / 2 - ((rows - 1) * stepY) / 2;
  const mode = rng.int(0, 1);
  // вьющийся стебель-фон: диагональные «волны»
  g.strokeStyle = css(pal.leaf, 0.5); g.lineWidth = 1.4;
  for (let i = -3; i < 8; i++) {
    g.beginPath();
    for (let y = fy; y <= fy + fh; y += 6) {
      const x = fx + (i + 0.5) * sxp * 0.9 + Math.sin(y / 22 + i) * 12;
      if (y === fy) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c <= cols; c++) {
      const x = fx + sxp * (c + 0.5) + (r % 2 ? sxp / 2 : 0);
      const y = oy + r * stepY;
      if (x < fx - s * 0.4 || x > fx + fw + s * 0.4) continue;
      const dir = (r + c) % 2 ? 1 : -1;
      g.save(); g.translate(x, y);
      g.rotate(mode ? dir * 0.35 : (r % 2 ? 0.25 : -0.25));
      g.scale(mode ? 1 : dir, 1);
      const sets = [[pal.p1, pal.p2, pal.p3], [pal.p3, pal.p2, pal.p1], [pal.p2, pal.p1, pal.leaf]];
      const set = sets[(r + c + 3) % 3];
      boteh(g, s, set[0], set[1], set[2], pal.gold, [pal.p2, pal.p1]);
      g.restore();
      // цветочек между
      g.save(); g.translate(x + sxp / 2, y + stepY / 2);
      bloom(g, 8, 6, (r + c) % 2 ? pal.p2 : pal.p1, (r + c) % 2 ? pal.p1 : pal.p2, pal.p3, pal.gold);
      g.restore();
      g.save(); g.translate(x, y + stepY / 2 + (r % 2 ? 0 : 0));
      for (const sg of [-1, 1]) { g.save(); g.translate(sg * 10, 0); g.rotate(sg * 1.1); leaf(g, 13, 4, pal.leaf, darken(pal.leaf, 0.5)); g.restore(); }
      g.restore();
    }
  }
}

export default {
  id: 'indian',
  name: 'Индийский',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    g.fillStyle = css(pal.field); g.fillRect(fx, fy, fw, fh);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    ground(g, pal, fx, fy, fw, fh, rng.fork('ground'));
    const comp = rng.pick([0, 1, 2]);
    const r2 = rng.fork('comp');
    if (comp === 0) compOgee(g, pal, r2, fx, fy, fw, fh);
    else if (comp === 1) compMedallion(g, pal, r2, fx, fy, fw, fh);
    else compBoteh(g, pal, r2, fx, fy, fw, fh);
    g.restore();
    return { edge: pal.edge, fringe: [240, 228, 200] };
  },
};
