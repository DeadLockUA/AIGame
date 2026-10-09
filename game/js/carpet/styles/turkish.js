// Турецкий килим / анатолийский: ступенчатые ромбы с «крючками», гюли, полосы, пиксельные каймы.
import { CW, CH, css, mix, lighten, darken, pickPalette } from '../kit.js';

const PALS = [
  { field: [158, 34, 36], field2: [134, 24, 30], band: [24, 44, 84], m1: [236, 220, 176], m2: [216, 152, 42], m3: [30, 118, 124], light: [238, 224, 188], dark: [40, 18, 20], edge: [70, 20, 22] },
  { field: [28, 48, 94], field2: [20, 36, 74], band: [150, 32, 34], m1: [238, 222, 180], m2: [214, 162, 52], m3: [58, 142, 132], light: [236, 222, 186], dark: [14, 20, 40], edge: [20, 30, 58] },
  { field: [228, 212, 174], field2: [210, 192, 150], band: [122, 36, 34], m1: [30, 52, 92], m2: [182, 62, 42], m3: [198, 150, 52], light: [246, 238, 210], dark: [60, 40, 30], edge: [110, 50, 40] },
  { field: [72, 86, 54], field2: [58, 70, 42], band: [140, 40, 30], m1: [238, 224, 178], m2: [210, 142, 46], m3: [172, 62, 50], light: [236, 224, 186], dark: [26, 32, 20], edge: [40, 50, 30] },
  { field: [92, 36, 70], field2: [74, 26, 56], band: [30, 102, 112], m1: [240, 226, 192], m2: [228, 134, 52], m3: [204, 62, 72], light: [240, 228, 196], dark: [30, 12, 24], edge: [50, 20, 40] },
  { field: [178, 86, 46], field2: [152, 68, 36], band: [28, 54, 72], m1: [240, 226, 186], m2: [232, 172, 62], m3: [118, 150, 100], light: [242, 230, 192], dark: [44, 22, 14], edge: [74, 36, 22] },
];

const cell = (g, x, y, w, h, col) => { g.fillStyle = css(col); g.fillRect(x, y, w + 0.4, h + 0.4); };

// Ступенчатый ромб (строки разной ширины), n — «радиус» в клетках
function sd(g, cx, cy, n, sx, sy, col) {
  g.fillStyle = css(col);
  for (let k = -n; k <= n; k++) {
    const w = (n - Math.abs(k)) * 2 + 1;
    g.fillRect(cx - (w * sx) / 2, cy + k * sy - sy / 2, w * sx + 0.4, sy + 0.4);
  }
}

// Ромб из колец + крючки + Т-образные кончики + крест в центре
function gul(g, cx, cy, n, sx, sy, layers, o = {}) {
  let size = n;
  for (const [col, th] of layers) {
    if (size < 0) break;
    sd(g, cx, cy, size, sx, sy, col);
    size -= th;
  }
  const oc = o.hook || layers[0][0];
  if (o.hooks) {
    const kk = Math.max(1, Math.floor(n / 2));
    for (const sgx of [-1, 1]) for (const sgy of [-1, 1]) {
      const k = kk * sgy;
      const w = (n - Math.abs(k)) * 2 + 1;
      const xe = sgx > 0 ? cx + (w * sx) / 2 : cx - (w * sx) / 2 - 2 * sx;
      cell(g, xe, cy + k * sy - sy / 2, 2 * sx, sy, oc);
      const xh = sgx > 0 ? xe + sx : xe;
      cell(g, xh, cy + (k + sgy) * sy - sy / 2, sx, sy, oc);
    }
  }
  if (o.tips) {
    const c = o.tipCol || oc;
    for (const s of [-1, 1]) {
      // верх/низ
      cell(g, cx - sx / 2, s < 0 ? cy - n * sy - sy / 2 - 2 * sy : cy + n * sy + sy / 2, sx, 2 * sy, c);
      cell(g, cx - 1.5 * sx, s < 0 ? cy - n * sy - sy / 2 - 3 * sy : cy + n * sy + sy / 2 + 2 * sy, 3 * sx, sy, c);
      // лево/право
      cell(g, s < 0 ? cx - n * sx - sx / 2 - 2 * sx : cx + n * sx + sx / 2, cy - sy / 2, 2 * sx, sy, c);
      cell(g, s < 0 ? cx - n * sx - sx / 2 - 3 * sx : cx + n * sx + sx / 2 + 2 * sx, cy - 1.5 * sy, sx, 3 * sy, c);
    }
  }
  if (o.cross) {
    const c = o.cross;
    cell(g, cx - sx / 2, cy - sy / 2, sx, sy, c);
    cell(g, cx - 1.5 * sx, cy - sy / 2, sx, sy, c); cell(g, cx + sx / 2, cy - sy / 2, sx, sy, c);
    cell(g, cx - sx / 2, cy - 1.5 * sy, sx, sy, c); cell(g, cx - sx / 2, cy + sy / 2, sx, sy, c);
  }
}

// Ступенчатый угол-треугольник, вложенные слои
function stairTri(g, x0, y0, dx, dy, m, sx, sy, layers) {
  let size = m;
  for (const [col, th] of layers) {
    if (size <= 0) break;
    g.fillStyle = css(col);
    for (let i = 0; i < size; i++) {
      const w = (size - i) * sx;
      g.fillRect(dx > 0 ? x0 : x0 - w, dy > 0 ? y0 + i * sy : y0 - (i + 1) * sy, w + 0.4, sy + 0.4);
    }
    size -= th;
  }
}

function frame(g, ins, th, col) {
  g.fillStyle = css(col);
  g.beginPath(); g.rect(ins, ins, CW - 2 * ins, CH - 2 * ins);
  g.rect(ins + th, ins + th, CW - 2 * ins - 2 * th, CH - 2 * ins - 2 * th);
  g.fill('evenodd');
}

// Строки-пиксели
const KEY = [
  'aaaaaaa.',
  'a.....a.',
  'a.aaa.a.',
  'a.a.a.a.',
  'a.a.aaa.',
  'a.a.....',
  'aaa.....',
];
const ZIG = [
  '..a.....',
  '.aaa....',
  'aaaaa...',
  '.......a',
  '......aaa',
  '.....aaaaa',
];

function pix(g, rows, x, y, cs, cols, fx, fy) {
  const h = rows.length;
  for (let r = 0; r < h; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const rr = fy ? h - 1 - r : r;
      const cc = fx ? row.length - 1 - c : c;
      cell(g, x + cc * cs, y + rr * cs, cs, cs, cols[ch]);
    }
  }
}

function sideStrip(g, tx, ty, ang, len, fn) {
  g.save(); g.translate(tx, ty); g.rotate(ang);
  g.beginPath(); g.rect(0, 0, len, 28); g.clip();
  fn(len);
  g.restore();
}

function border(g, pal, rng) {
  g.fillStyle = css(pal.dark); g.fillRect(0, 0, CW, CH);
  const kind = rng.int(0, 2);
  const stripe = rng.pick([pal.band, pal.m3, pal.m2]);
  // фон основной полосы
  g.fillStyle = css(pal.band); g.fillRect(12, 12, CW - 24, CH - 24);
  const n4 = rng.chance(0.5);
  const cs = 4;
  const strip = (len) => {
    if (kind === 0) {
      // ключи-спирали
      const per = 8 * cs;
      const cnt = Math.max(1, Math.round(len / per));
      const tw = len / cnt;
      g.save(); g.scale(tw / per, 1);
      for (let i = 0; i < cnt; i++) {
        g.save(); g.translate(i * per, 0);
        pix(g, KEY, 0, 0, cs, { a: i % 2 ? pal.m2 : pal.m1 }, false, i % 2 === 1);
        g.restore();
      }
      g.restore();
    } else if (kind === 1) {
      // крючковатые ромбы с перемычками
      const per = 40;
      const cnt = Math.max(1, Math.round(len / per));
      const tw = len / cnt;
      for (let i = 0; i < cnt; i++) {
        const cx = (i + 0.5) * tw;
        const cols = i % 2 ? [pal.m2, pal.m1, pal.m3] : [pal.m1, pal.m2, pal.m3];
        gul(g, cx, 14, 3, 4, 4, [[cols[0], 1], [pal.field, 1], [cols[1], 1], [cols[2], 1]], { hooks: false });
        cell(g, cx - tw / 2 - 2, 12, 4, 4, pal.m1);
      }
    } else {
      // пилообразные зубцы вверх/вниз
      const per = 28;
      const cnt = Math.max(1, Math.round(len / per));
      const tw = len / cnt;
      for (let i = 0; i < cnt; i++) {
        const x0 = i * tw;
        for (let r = 0; r < 7; r++) {
          const w = (r + 1) * (tw / 7);
          cell(g, x0 + (tw - w) / 2, r * 4, w, 4, i % 2 ? pal.m1 : pal.m2);
          cell(g, x0 + (tw - w) / 2 + tw / 2, 24 - r * 4, w, 4, i % 2 ? pal.m3 : pal.m1);
        }
      }
      // подчёркивающие полоски
      cell(g, 0, 0, len, 2, pal.dark); cell(g, 0, 26, len, 2, pal.dark);
    }
  };
  const L = CW - 80, H = CH - 80;
  sideStrip(g, 40, 12, 0, L, strip);
  sideStrip(g, CW - 12, 40, Math.PI / 2, H, strip);
  sideStrip(g, CW - 40, CH - 12, Math.PI, L, strip);
  sideStrip(g, 12, CH - 40, -Math.PI / 2, H, strip);
  // угловые квадраты
  for (const [x, y] of [[12, 12], [CW - 40, 12], [12, CH - 40], [CW - 40, CH - 40]]) {
    cell(g, x, y, 28, 28, pal.dark);
    gul(g, x + 14, y + 14, 3, 4, 4, [[pal.m2, 1], [pal.m1, 1], [pal.band, 1], [pal.m3, 1]], { cross: pal.dark });
  }
  frame(g, 6, 4, stripe);
  frame(g, 10, 2, pal.light);
  frame(g, 40, 2, pal.light);
  frame(g, 42, 4, stripe);
  // тонкие «зубчики» на внешних полосах
  g.fillStyle = css(pal.dark, 0.5);
  for (let x = 8; x < CW - 8; x += 8) { g.fillRect(x, 6, 3, 1.5); g.fillRect(x, CH - 7.5, 3, 1.5); }
  for (let y = 8; y < CH - 8; y += 8) { g.fillRect(6, y, 1.5, 3); g.fillRect(CW - 7.5, y, 1.5, 3); }
  return 46;
}

function abrash(g, rng, x, y, w, h) {
  let yy = y;
  while (yy < y + h) {
    const bh = rng.range(6, 18);
    const t = rng.range(-0.07, 0.07);
    g.fillStyle = t > 0 ? `rgba(255,240,220,${t})` : `rgba(20,0,0,${-t})`;
    g.fillRect(x, yy, w, bh);
    yy += bh;
  }
}

function groundDots(g, pal, x, y, w, h, step, col) {
  g.fillStyle = css(col, 0.8);
  let row = 0;
  for (let yy = y + step / 2; yy < y + h; yy += step, row++) {
    for (let xx = x + step / 2 + (row % 2) * (step / 2); xx < x + w; xx += step) {
      g.fillRect(xx - 1.5, yy - 4.5, 3, 9); g.fillRect(xx - 4.5, yy - 1.5, 9, 3);
    }
  }
}

function plus(g, cx, cy, s, col) {
  cell(g, cx - s / 2, cy - s / 2, s, s, col);
  cell(g, cx - s * 1.5, cy - s / 2, s, s, col); cell(g, cx + s / 2, cy - s / 2, s, s, col);
  cell(g, cx - s / 2, cy - s * 1.5, s, s, col); cell(g, cx - s / 2, cy + s / 2, s, s, col);
}

function layersFor(pal, rng, fieldCol) {
  const a = rng.shuffle([pal.band, pal.m2, pal.m3]);
  return [[pal.m1, 1], [a[0], 2], [pal.m1 === pal.light ? pal.m2 : pal.m1, 1], [a[1], 2], [pal.m1, 1], [a[2], 1]];
}

// ---- Композиции ----
function compMedallion(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2, cy = CH / 2;
  const sx = 9, sy = 11;
  // угловые лесенки
  const m = 8;
  const lay = [[pal.band, 3], [pal.m2, 1], [pal.m1, 1], [pal.m3, 1]];
  stairTri(g, fx, fy, 1, 1, m, 9, 9, lay);
  stairTri(g, fx + fw, fy, -1, 1, m, 9, 9, lay);
  stairTri(g, fx, fy + fh, 1, -1, m, 9, 9, lay);
  stairTri(g, fx + fw, fy + fh, -1, -1, m, 9, 9, lay);
  // малые ромбы по оси
  for (const dy of [-168, 168]) {
    gul(g, cx, cy + dy, 3, 7, 7, [[pal.m1, 1], [pal.band, 1], [pal.m2, 1], [pal.m3, 1]], { cross: pal.m1, hooks: true, hook: pal.m2 });
  }
  for (const dy of [-1, 1]) for (const dx of [-1, 1]) plus(g, cx + dx * 92, cy + dy * 138, 5, pal.m2);
  for (const dy of [-1, 1]) for (const dx of [-1, 1]) plus(g, cx + dx * 100, cy + dy * 40, 5, pal.m3);
  // боковые полуромбы у краёв поля
  for (const s of [-1, 1]) for (const dy of [-60, 60]) {
    gul(g, s < 0 ? fx : fx + fw, cy + dy * 2.2, 4, 6, 7, [[pal.m1, 1], [pal.m3, 1], [pal.m2, 1], [pal.band, 1]], { cross: pal.m1 });
  }
  if (rng.chance(0.65)) {
    sd(g, cx, cy, 13, sx, sy * 0.95, rng.pick([pal.m1, pal.m2]));
    sd(g, cx, cy, 12, sx, sy * 0.95, mix(pal.field, pal.dark, 0.25));
    sd(g, cx, cy, 11, sx, sy * 0.95, mix(pal.field, pal.dark, 0.15));
    groundDots(g, pal, cx - 100, cy - 100, 200, 200, 20, mix(pal.field, pal.dark, 0.3));
    sd(g, cx, cy, 10, sx, sy * 0.95, mix(pal.field, pal.dark, 0.25));
  }
  // главный медальон
  gul(g, cx, cy, 8, sx, sy, layersFor(pal, rng), { hooks: true, tips: true, tipCol: pal.m2, hook: pal.m1, cross: pal.m1 });
  // рисунок внутри: 4 малых ромба
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    // не рисуем, медальон уже плотный
  }
  gul(g, cx, cy, 2, 8, 9, [[pal.m2, 1], [pal.field, 1], [pal.m1, 1]], { cross: pal.band });
}

function compTriple(g, pal, rng, fx, fy, fw, fh) {
  const cx = CW / 2;
  const ys = [fy + 78, CH / 2, fy + fh - 78];
  const lay = layersFor(pal, rng);
  for (let i = 0; i < 3; i++) {
    const big = i === 1;
    gul(g, cx, ys[i], big ? 7 : 6, 9, big ? 10 : 9, i === 1 ? [lay[0], lay[1], lay[2], lay[3], lay[4], lay[5]] : [[pal.m2, 1], [pal.band, 2], [pal.m1, 1], [pal.m3, 2], [pal.m2, 1], [pal.field, 1]], { hooks: true, hook: pal.m1, tips: i === 1, tipCol: pal.m2, cross: pal.m1 });
    // полуромбы по бокам
    for (const s of [-1, 1]) {
      gul(g, s < 0 ? fx : fx + fw, ys[i], 4, 8, 9, [[pal.m1, 1], [pal.m3, 1], [pal.m2, 1], [pal.band, 1]], { cross: pal.m1 });
    }
  }
  // между медальонами — пары малых ромбов
  for (const y of [(ys[0] + ys[1]) / 2, (ys[1] + ys[2]) / 2]) {
    for (const dx of [-62, 62]) gul(g, cx + dx, y, 2, 7, 7, [[pal.m2, 1], [pal.band, 1], [pal.m1, 1]], { hooks: false });
    plus(g, cx, y, 6, pal.m1);
  }
  for (const dx of [-1, 1]) for (const y of ys) plus(g, cx + dx * 80, y, 4, pal.m3);
  // уголки
  const lt = [[pal.band, 2], [pal.m2, 1], [pal.m1, 1]];
  stairTri(g, fx, fy, 1, 1, 5, 8, 8, lt); stairTri(g, fx + fw, fy, -1, 1, 5, 8, 8, lt);
  stairTri(g, fx, fy + fh, 1, -1, 5, 8, 8, lt); stairTri(g, fx + fw, fy + fh, -1, -1, 5, 8, 8, lt);
}

function compLattice(g, pal, rng, fx, fy, fw, fh) {
  const nx = rng.pick([3, 4]);
  const stepX = fw / nx;
  const stepY = rng.pick([62, 68, 74]);
  const rows = Math.floor(fh / stepY) + 1;
  const oy = fy + (fh - (rows - 1) * stepY) / 2;
  const sets = [
    [[pal.m1, 1], [pal.band, 1], [pal.m2, 1], [pal.m3, 1]],
    [[pal.m2, 1], [pal.m3, 1], [pal.m1, 1], [pal.band, 1]],
  ];
  const n = stepX > 80 ? 4 : 3;
  const sxx = Math.min(8, (stepX * 0.74) / (2 * n + 1));
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? stepX / 2 : 0;
    for (let c = -1; c <= nx; c++) {
      const x = fx + stepX / 2 + c * stepX + off;
      const y = oy + r * stepY;
      if (x < fx - 5 || x > fx + fw + 5) continue;
      gul(g, x, y, n, sxx, sxx * 1.1, sets[(r + c) % 2], { hooks: n >= 4, hook: pal.m1, cross: pal.field });
    }
  }
  // кресты между
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? stepX / 2 : 0;
    for (let c = -1; c <= nx; c++) {
      const x = fx + c * stepX + off + stepX;
      const y = oy + r * stepY + stepY / 2;
      if (x < fx + 4 || x > fx + fw - 4 || y > fy + fh - 4) continue;
      plus(g, x - stepX / 2 * 0, y, 4, (r + c) % 2 ? pal.m2 : pal.m3);
    }
  }
}

function compBands(g, pal, rng, fx, fy, fw, fh) {
  const hs = [];
  let tot = 0;
  const choices = [34, 52, 74, 96];
  while (tot < fh - 30) { const h = rng.pick(choices); hs.push(h); tot += h + 10; }
  const scale = fh / tot;
  let y = fy;
  hs.forEach((h0, i) => {
    const h = h0 * scale, gap = 10 * scale;
    const cy = y + h / 2;
    const alt = i % 2;
    if (h0 >= 74) {
      const n = Math.floor(h0 / 16);
      const s = Math.floor((h - 4) / (2 * n + 1) * 10) / 10;
      const cnt = 3;
      for (let k = 0; k < cnt; k++) {
        const x = fx + (k + 0.5) * (fw / cnt);
        gul(g, x, cy, n, s * 1.15, s, [[alt ? pal.m2 : pal.m1, 1], [pal.band, 1], [alt ? pal.m1 : pal.m2, 1], [pal.m3, 1]], { hooks: n >= 4, hook: pal.m1, cross: pal.m1 });
      }
    } else if (h0 >= 52) {
      const cnt = 5;
      for (let k = 0; k < cnt; k++) {
        const x = fx + (k + 0.5) * (fw / cnt);
        gul(g, x, cy, 3, 6, 6.5, [[k % 2 ? pal.m2 : pal.m1, 1], [pal.band, 1], [pal.m3, 1], [pal.m1, 1]], { cross: pal.m2 });
      }
    } else {
      // зубцы
      const cnt = 9;
      const tw = fw / cnt;
      for (let k = 0; k < cnt; k++) {
        const rows = 5;
        for (let r = 0; r < rows; r++) {
          const w = ((r + 1) / rows) * tw * 0.9;
          cell(g, fx + k * tw + (tw - w) / 2, y + r * (h / rows) * 0.9, w, (h / rows) * 0.9, k % 2 ? pal.m1 : pal.m2);
        }
      }
    }
    // разделительные полосы
    cell(g, fx, y + h + gap / 2 - 2, fw, 2, pal.m1);
    cell(g, fx, y + h + gap / 2 - 5, fw, 2, i % 2 ? pal.band : pal.m3);
    y += h + gap;
  });
}

export default {
  id: 'turkish',
  name: 'Турецкий',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    g.fillStyle = css(pal.field); g.fillRect(fx, fy, fw, fh);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    abrash(g, rng.fork('abrash'), fx, fy, fw, fh);
    groundDots(g, pal, fx, fy, fw, fh, 20, mix(pal.field, pal.field2, 1.6));
    const comp = rng.pick([0, 1, 2, 3]);
    const r2 = rng.fork('comp');
    if (comp === 0) compMedallion(g, pal, r2, fx, fy, fw, fh);
    else if (comp === 1) compTriple(g, pal, r2, fx, fy, fw, fh);
    else if (comp === 2) compLattice(g, pal, r2, fx, fy, fw, fh);
    else compBands(g, pal, r2, fx, fy, fw, fh);
    g.restore();
    return { edge: pal.edge, fringe: [232, 220, 192] };
  },
};
