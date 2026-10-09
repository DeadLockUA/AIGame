// Скандинавский ковёр: клеточный (вязаный) орнамент — звёзды Сельбу, ромбы, ёлочки, снежинки; вариант «рёйя» в полосах.
import { CW, CH, css, mix, darken, lighten } from '../kit.js';

const NX = 57, NY = 85; // нечётные: есть центральная клетка
const CX = (NX - 1) / 2, CY = (NY - 1) / 2;

// bg — фон, c1 — основной, c2 — акцент, c3 — приглушённый (между фоном и c1)
const PALS = [
  { bg: [238, 229, 208], c1: [30, 50, 98], c2: [188, 52, 50], c3: [170, 186, 204] },
  { bg: [28, 42, 84], c1: [238, 230, 208], c2: [208, 88, 62], c3: [92, 112, 160] },
  { bg: [208, 212, 212], c1: [52, 58, 68], c2: [214, 164, 56], c3: [150, 158, 164] },
  { bg: [36, 68, 58], c1: [236, 228, 204], c2: [204, 104, 70], c3: [100, 134, 112] },
  { bg: [238, 216, 208], c1: [44, 100, 110], c2: [132, 40, 58], c3: [196, 168, 166] },
  { bg: [216, 230, 236], c1: [54, 88, 140], c2: [206, 120, 130], c3: [150, 176, 204] },
  { bg: [30, 30, 36], c1: [240, 238, 230], c2: [204, 44, 48], c3: [100, 100, 108] },
  { bg: [244, 224, 190], c1: [140, 52, 40], c2: [40, 84, 90], c3: [212, 170, 130] },
];

const BM = {
  snow: ['#..#..#', '.#.#.#.', '..###..', '#######', '..###..', '.#.#.#.', '#..#..#'],
  dia: ['...#...', '..#.#..', '.#...#.', '#..#..#', '.#...#.', '..#.#..', '...#...'],
  flower: ['.#...#.', '###.###', '.#####.', '..###..', '.#####.', '###.###', '.#...#.'],
  heart: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...', '.......'],
  cross: ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'],
};
const bm = (name, v, m) => { // v 0..6, m -3..3
  const row = BM[name][v];
  return row && m >= -3 && m <= 3 && row[m + 3] === '#';
};
const dist = (du, P) => { const d = ((du % P) + P) % P; return Math.min(d, P - d); };
const sdist = (du, P) => { const d = ((du + P / 2) % P + P) % P - P / 2; return d; }; // со знаком, центр в 0

// ---------- узорные ленты: fn(du, v, k) -> 0|1|2; du — от центра, k — номер мотива ----------
const BANDS = {
  zig: { h: 5, f: (du, v) => { const a = dist(du, 8); return v === (a < 4 ? a : 8 - a) ? 1 : 0; } },
  zigThick: { h: 7, f: (du, v) => { const a = dist(du, 8); const z = Math.round(a * 1.5); return v === z || v === z + 1 ? 1 : 0; } },
  line: { h: 1, f: () => 1 },
  dots: { h: 1, f: (du) => (((du % 2) + 2) % 2 === 0 ? 1 : 0) },
  check: { h: 2, f: (du, v) => ((Math.floor(du / 2) + v) % 2 === 0 ? 1 : 0) },
  lozenge: { h: 9, P: 10, f: (du, v) => { const a = Math.abs(v - 4), d = dist(du, 10); const s = a + d; return s <= 1 ? 2 : s <= 4 ? (s === 4 || s === 3 ? 1 : 0) : 0; } },
  lozFill: { h: 7, P: 8, f: (du, v) => { const a = Math.abs(v - 3), d = dist(du, 8); const s = a + d; return s <= 3 ? (s <= 1 ? 2 : 1) : 0; } },
  tree: { h: 8, P: 8, f: (du, v, k) => { const d = dist(du, 8); if (v === 7) return d <= 0 ? 2 : 0; if (v >= 6) return d <= 0 ? 2 : 0; return d <= Math.floor(v / 2) ? (k % 2 ? 2 : 1) : 0; } },
  snow: { h: 9, P: 10, f: (du, v) => { const m = Math.round(sdist(du, 10)); return bm('snow', v - 1, m) ? 1 : 0; } },
  flower: { h: 9, P: 10, f: (du, v, k) => { const m = Math.round(sdist(du, 10)); return bm('flower', v - 1, m) ? (k % 2 ? 2 : 1) : 0; } },
  star: { h: 9, P: 10, f: (du, v, k) => { const m = Math.round(sdist(du, 10)); return bm('cross', v - 1, m) ? 1 : bm('dia', v - 1, m) ? 2 : 0; } },
  heart: { h: 9, P: 10, f: (du, v) => { const m = Math.round(sdist(du, 10)); return bm('heart', v - 1, m) ? 2 : 0; } },
  fir: { h: 5, f: (du, v) => { const a = dist(du, 6); return v === 4 - a || v === 4 - a - 1 && a < 3 ? 1 : 0; } },
};

function rose(dx, dy, R) {
  const r = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  const k = Math.pow(Math.abs(Math.cos(4 * th)), 1.4);
  const edge = R * (0.52 + 0.48 * k);
  if (r > edge + 0.2) return 0;
  const t = r / edge;
  if (r < 1.1) return 1;
  if (t > 0.74) return 1;
  if (t > 0.58) return 0;
  if (t > 0.3) return 2;
  return t > 0.18 ? 0 : 1;
}

function makeBorder(rng, kind) {
  // возвращает массив рядов-лент от внешнего края внутрь
  const rows = [];
  const push = (name, color = 1) => rows.push({ name, color });
  const gap = () => rows.push({ name: null });
  if (kind === 0) { gap(); push('line'); push('zig', 1); push('line'); gap(); }
  else if (kind === 1) { gap(); push('line'); gap(); push('lozenge', 1); gap(); push('line'); gap(); }
  else if (kind === 2) { gap(); push('line', 2); push('tree', 1); push('line', 2); gap(); }
  else { gap(); push('check', 1); push('zigThick', 2); push('check', 1); gap(); }
  return rows;
}

export default {
  id: 'scandi', name: 'Скандинавский',
  paint(g, rng) {
    const pal = rng.pick(PALS);
    const cols = [pal.bg, pal.c1, pal.c2, pal.c3];
    const grid = new Uint8Array(NX * NY); // индекс цвета
    const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < NX && y < NY) grid[y * NX + x] = v; };
    const get = (x, y) => grid[y * NX + x];
    const variant = rng.int(0, 3);
    const bkind = rng.int(0, 3);
    const colA = rng.chance(0.5) ? 1 : 2; // чередование цветов в лентах
    const noiseR = rng.fork('noise');
    const rowTint = new Float32Array(NY);

    // ---- кайма ----
    const brows = makeBorder(rng, bkind);
    const rowH = (r) => (r.name ? BANDS[r.name].h : 1);
    const B = brows.reduce((a, r) => a + rowH(r), 0);
    // фон каймы — фон; ленты по периметру со смещением
    const ringRows = []; // индекс кольца -> {r, v}
    for (const r of brows) { const h = rowH(r); for (let v = 0; v < h; v++) ringRows.push({ r, v }); }
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const d = Math.min(x, y, NX - 1 - x, NY - 1 - y);
      if (d >= B) continue;
      const { r, v } = ringRows[d];
      if (!r.name) continue;
      const topSide = Math.min(x, NX - 1 - x) >= Math.min(y, NY - 1 - y);
      const du = topSide ? x - CX : y - CY;
      const band = BANDS[r.name];
      const k = Math.round(du / (band.P || 8));
      let val = band.f(du, v, k);
      if (val === 1 && r.color === 2) val = 2;
      set(x, y, val);
    }

    // ---- поле ----
    const fx0 = B, fy0 = B, fx1 = NX - B - 1, fy1 = NY - B - 1;
    const fieldBand = (name, yTop, color = 1, du0 = 0) => {
      const band = BANDS[name];
      for (let v = 0; v < band.h; v++) for (let x = fx0; x <= fx1; x++) {
        const du = x - CX + du0;
        const k = Math.round(du / (band.P || 8));
        let val = band.f(du, v, k);
        if (val === 1 && color === 2) val = 2;
        set(x, yTop + v, val);
      }
      return band.h;
    };
    const inField = (x, y) => x >= fx0 && x <= fx1 && y >= fy0 && y <= fy1;

    if (variant === 0) {
      // Сельбу: крупная роза в центре, мелкие мотивы в шахматном порядке
      const motifs = rng.pick([['snow', 'dia'], ['flower', 'dia'], ['star', 'snow'], ['heart', 'cross']]);
      const R = 13;
      const step = 10;
      for (let gy = 0; gy < 12; gy++) {
        const cy = CY + (gy - 5.5) * step * 0.92;
      }
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const dx = x - CX, dy = y - CY;
        const s = Math.abs(dx) + Math.abs(dy);
        if (s <= R + 4) { set(x, y, rose(dx, dy, R)); continue; }
        if (s <= R + 5) continue;
        // мелкие мотивы: решётка со сдвигом
        const row = Math.floor((dy + 500) / step);
        const off = row % 2 ? step / 2 : 0;
        const mx = Math.round(sdist(dx + off, step)), my = ((dy + 500) % step) - 5;
        const kx = Math.round((dx + off) / step);
        const m = mx, v = my + 3;
        if (v >= 0 && v < 7 && bm(motifs[(kx + row) % 2 ? 1 : 0], v, m)) set(x, y, (kx + row) % 2 ? 2 : 1);
      }
      // малые розы по углам поля
      const hw = (fx1 - fx0) / 2, hh = (fy1 - fy0) / 2;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        const ccx = CX + sx * (hw - 9), ccy = CY + sy * (hh - 9);
        for (let y = Math.round(ccy) - 8; y <= Math.round(ccy) + 8; y++) for (let x = Math.round(ccx) - 8; x <= Math.round(ccx) + 8; x++) {
          if (!inField(x, y)) continue;
          const dx = x - Math.round(ccx), dy = y - Math.round(ccy);
          if (Math.hypot(dx, dy) <= 8.5) set(x, y, Math.hypot(dx, dy) > 7.2 ? 0 : rose(dx, dy, 7));
        }
      }
      // обрезаем мотивы вплотную к границе поля: делаем строку-рамку
      for (let x = fx0; x <= fx1; x++) { set(x, fy0, 1); set(x, fy1, 1); }
      for (let y = fy0; y <= fy1; y++) { set(fx0, y, 1); set(fx1, y, 1); }
      for (let x = fx0 + 1; x <= fx1 - 1; x++) for (const y of [fy0 + 1, fy1 - 1]) set(x, y, 0);
      for (let y = fy0 + 1; y <= fy1 - 1; y++) for (const x of [fx0 + 1, fx1 - 1]) set(x, y, 0);
      // кружок вокруг розы
      for (let y = fy0 + 2; y <= fy1 - 2; y++) for (let x = fx0 + 2; x <= fx1 - 2; x++) {
        const s = Math.abs(x - CX) + Math.abs(y - CY);
        if (s === R + 6) set(x, y, 1);
      }
    } else if (variant === 1) {
      // Полосы Fair Isle, зеркальные относительно центра
      const pool = ['snow', 'flower', 'star', 'heart', 'lozenge', 'tree', 'lozFill'];
      const seps = ['line', 'zig', 'check', 'dots', 'fir'];
      const seq = [];
      let total = 0;
      const half = (fy1 - fy0 + 1);
      const centerName = rng.pick(['flower', 'snow', 'star']);
      const cBand = BANDS[centerName];
      let remain = Math.floor((half - cBand.h) / 2);
      let guard = 0;
      while (guard++ < 40) {
        const sep = rng.pick(seps), sb = BANDS[sep];
        const mot = rng.pick(pool), mb = BANDS[mot];
        const need = 1 + sb.h + 1 + mb.h;
        if (remain < need + 1) {
          // добиваем разделителем
          if (remain >= 1 + sb.h + 1) { seq.push([sep, 1]); remain -= 1 + sb.h + 1; } // gap + sep + gap
          break;
        }
        seq.push([sep, 1], [mot, seq.length % 2 ? 2 : 1]);
        remain -= need + 1;
      }
      // раскладка: верх (seq), центр, низ (зеркально)
      const layout = [...seq, [centerName, 1], ...seq.slice().reverse()];
      // зазоры 1 между лентами; считаем и центрируем
      let tot = layout.reduce((a, [n]) => a + BANDS[n].h + 1, 0) - 1;
      let y = fy0 + Math.floor((fy1 - fy0 + 1 - tot) / 2);
      // зеркальная раскладка симметрична, поэтому центр совпадёт
      if ((fy1 - fy0 + 1 - tot) % 2) y += 0;
      for (const [n, col] of layout) { y += fieldBand(n, y, col) + 1; }
      // фон-подложка между полосами: тонкие ромбики на пустых рядах не нужны
    } else if (variant === 2) {
      // Рёйя: широкие мягкие полосы с вкраплениями узелков и тонкими узорными лентами
      const bandsC = [0, 1, 2, 3];
      let y = fy0;
      const sepNames = ['zig', 'check', 'dots', 'fir'];
      const rr = rng.fork('ryi');
      const stripes = [];
      let lastC = -1;
      while (y <= fy1) {
        const h = rr.int(5, 12);
        let c;
        do { c = rr.pick(bandsC); } while (c === lastC);
        lastC = c;
        const hh = Math.min(h, fy1 - y + 1);
        stripes.push({ y, h: hh, c });
        y += hh;
        if (y <= fy1 - 4 && rr.chance(0.7)) {
          const sn = rr.pick(sepNames), sb = BANDS[sn];
          if (y + sb.h + 2 <= fy1) {
            const sc = (c === 1 || c === 2) ? 0 : 1;
            stripes.push({ y, h: sb.h + 2, c: c === 0 ? 3 : c, sep: sn, sc });
            y += sb.h + 2;
            lastC = -1;
          }
        }
      }
      for (const s2 of stripes) for (let yy = s2.y; yy < s2.y + s2.h; yy++) rowTint[yy] = -0.09 + 0.18 * ((yy - s2.y) / Math.max(1, s2.h - 1));
      // зеркалируем для порядка: делаем симметрию верх/низ с вероятностью
      const sym = rng.chance(0.6);
      for (const s of stripes) {
        for (let yy = s.y; yy < s.y + s.h; yy++) for (let x = fx0; x <= fx1; x++) {
          set(x, yy, s.c);
        }
        if (s.sep) {
          const band = BANDS[s.sep];
          for (let v = 0; v < band.h; v++) for (let x = fx0; x <= fx1; x++) {
            if (band.f(x - CX, v, 0)) set(x, s.y + 1 + v, s.sc === 0 ? 0 : s.sc);
          }
        }
      }
      if (sym) {
        for (let yy = fy0; yy <= CY; yy++) for (let x = fx0; x <= fx1; x++) set(x, fy1 - (yy - fy0), get(x, yy));
      }
      // ряды-узелки на крупных полосах
      for (const s of stripes) {
        if (s.sep || s.h < 7) continue;
        const dc = s.c === 0 ? 1 : 0;
        const yy = s.y + Math.floor(s.h / 2);
        if (sym && yy > CY) continue;
        for (let x = fx0 + 2; x <= fx1 - 2; x += 4) { set(x, yy, dc); if (sym) set(x, fy1 - (yy - fy0), dc); }
      }
    } else {
      // Решётка вложенных ромбов
      const P = 18;
      const rings = rng.chance(0.5) ? [1, 0, 2, 0, 3] : [1, 2, 0, 3, 0];
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const dx = x - CX, dy = y - CY;
        const a = dist(dx, P), b = dist(dy, P);
        const a2 = dist(dx + P / 2, P), b2 = dist(dy + P / 2, P);
        const d1 = a + b, d2 = a2 + b2;
        const d = Math.min(d1, d2);
        const ring = Math.floor(d / 2);
        let val = rings[ring % rings.length];
        if (d1 > d2 && ring < 5) val = rings[(ring + 1) % rings.length] === 0 ? (ring % 2 ? 3 : 0) : rings[(ring + 1) % rings.length];
        if (d <= 1) val = d1 <= d2 ? 2 : 1;
        set(x, y, val);
      }
      // обводка поля
      for (let x = fx0; x <= fx1; x++) { set(x, fy0, 1); set(x, fy1, 1); }
      for (let y = fy0; y <= fy1; y++) { set(fx0, y, 1); set(fx1, y, 1); }
    }

    // ---- отрисовка клеток ----
    const cw = CW / NX, ch = CH / NY;
    const tints = [];
    for (let i = 0; i < NX * NY; i++) tints.push(noiseR.range(-0.035, 0.035));
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const i = y * NX + x;
      const t = tints[i] + rowTint[y];
      const c = t > 0 ? lighten(cols[grid[i]], t) : darken(cols[grid[i]], -t);
      g.fillStyle = css(c);
      g.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
    if (variant === 2) {
      // пряди рёйи: короткие вертикальные ворсинки
      const yr = rng.fork('yarn');
      g.lineCap = 'round';
      for (let i = 0; i < 2600; i++) {
        const x = yr.range(4, CW - 4), y = yr.range(4, CH - 4);
        const len = yr.range(3, 9);
        g.strokeStyle = yr.chance(0.5) ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)';
        g.lineWidth = yr.range(0.6, 1.3);
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + yr.range(-1.5, 1.5), y + len / 2, x + yr.range(-2, 2), y + len); g.stroke();
      }
    }
    // вязаный «V»-рельеф: тонкая тень снизу клетки
    g.fillStyle = 'rgba(0,0,0,0.10)';
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) g.fillRect(x * cw, (y + 1) * ch - 1, cw, 0.9);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) g.fillRect(x * cw, y * ch, cw, 0.8);
    return { edge: darken(cols[1] === pal.c1 && pal.bg[0] + pal.bg[1] + pal.bg[2] < 300 ? pal.c2 : pal.c1, 0.35), fringe: lighten(pal.bg[0] + pal.bg[1] + pal.bg[2] > 450 ? pal.bg : pal.c1, 0.1) };
  },
};
