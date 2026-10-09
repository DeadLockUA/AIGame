// Навахо: ступенчатые ромбы, зигзаги, полосы, насыщенные земляные цвета — клеточное ткачество.
import { CW, CH, css, mix, darken, lighten } from '../kit.js';

const NX = 49, NY = 73;
const CX = (NX - 1) / 2, CY = (NY - 1) / 2;
const B = 6;

// field, dark, light, accA, accB
const PALS = [
  [[154, 40, 32], [30, 26, 26], [234, 222, 192], [196, 150, 92], [136, 132, 126]], // Ganado
  [[34, 112, 118], [26, 30, 42], [238, 226, 198], [226, 128, 42], [172, 46, 38]], // бирюза
  [[216, 124, 48], [38, 28, 28], [240, 228, 196], [112, 32, 36], [40, 122, 122]], // закат
  [[198, 158, 108], [60, 38, 30], [238, 226, 200], [168, 70, 40], [58, 140, 140]], // пустыня
  [[222, 208, 176], [36, 32, 30], [120, 104, 90], [168, 62, 40], [196, 160, 100]], // Два Серых Холма
  [[30, 44, 92], [236, 224, 196], [226, 164, 44], [180, 54, 42], [90, 150, 160]], // индиго
  [[104, 30, 40], [26, 22, 26], [232, 204, 150], [214, 120, 44], [46, 120, 112]], // бордо
];

const dist = (du, P) => { const d = ((du % P) + P) % P; return Math.min(d, P - d); };
const tsteps = (dx, dy, ax, ay) => Math.floor(Math.abs(dx) / ax) + Math.floor(Math.abs(dy) / ay);

function borderVal(kind, du, v, k) {
  // возвращает индекс цвета для ряда v (0..B-1) ленты; 1=dark, 2=light, 3=accA, 4=accB, 0=field
  if (kind === 0) {
    if (v === 0 || v === 5) return 1;
    const a = dist(du, 8);
    return a <= 4 - v ? (k % 2 ? 3 : 2) : 1;
  }
  if (kind === 1) {
    if (v === 0 || v === 5) return 1;
    const a = dist(du, 8);
    const z = Math.min(a, 3);
    return v - 1 === z ? 2 : 1;
  }
  if (kind === 2) {
    if (v === 0) return 1;
    if (v === 5) return 3;
    return (Math.floor(du / 2) + Math.floor((v - 1) / 2)) % 2 === 0 ? 2 : 1;
  }
  if (v === 0 || v === 5) return 2;
  if (v === 1) return 1;
  const a = Math.abs(v - 3), d = dist(du, 6);
  const s = a + d;
  return s <= 1 ? 3 : s <= 2 ? 2 : 1;
}

// Концентрические «эхо»-кольца вокруг ступенчатого ромба
function diamondRings(dx, dy, ax, ay, N, rc) {
  const t = tsteps(dx, dy, ax, ay);
  if (t > N) return -1;
  return rc[Math.floor((N - t) / (ax === 2 ? 2 : 1)) % rc.length];
}

export default {
  id: 'navajo', name: 'Навахо',
  paint(g, rng) {
    const P = rng.pick(PALS);
    let cols = P.slice();
    // иногда меняем местами тёмный и светлый для разнообразия
    if (rng.chance(0.3) && P[0][0] < 120) cols = [cols[0], cols[2], cols[1], cols[3], cols[4]];
    const grid = new Uint8Array(NX * NY);
    const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < NX && y < NY) grid[y * NX + x] = v; };
    const bkind = rng.int(0, 3);
    const variant = rng.int(0, 3);
    const fx0 = B, fy0 = B, fx1 = NX - B - 1, fy1 = NY - B - 1;
    const inF = (x, y) => x >= fx0 && x <= fx1 && y >= fy0 && y <= fy1;

    // ---- кайма ----
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const d = Math.min(x, y, NX - 1 - x, NY - 1 - y);
      if (d >= B) continue;
      const top = Math.min(x, NX - 1 - x) >= Math.min(y, NY - 1 - y);
      const du = top ? x - CX : y - CY;
      const k = Math.round(du / 8);
      set(x, y, borderVal(bkind, du, d, k));
    }
    const rr = rng.fork('ring');
    const nonF = [1, 2, 3, 4];
    const mkRings = () => {
      const a = rr.shuffle(nonF);
      const out = [a[0], a[1], a[2], a[0]];
      if (rr.chance(0.5)) out.push(a[3]);
      return out;
    };
    const wrapColor = (c) => c;
    // фон поля: «ворсистая» фактура клеток
    const fieldTex = (x, y) => ((x * 7 + y * 3) % 11 === 0 || (x * 3 + y * 5) % 17 === 0) ? 5 : 0;

    if (variant === 0) {
      // Ганадо: большой ступенчатый ромб, эхо-контуры, половинки ромбов по краям
      const ax = rng.pick([2, 3]), ay = rng.pick([3, 4]);
      const N = ax === 3 ? 5 : 8;
      const rc = mkRings();
      const echo = [rr.pick([1, 2]), rr.pick([3, 4])];
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const dx = x - CX, dy = y - CY;
        let v = diamondRings(dx, dy, ax, ay, N, rc);
        if (v < 0) {
          const m = tsteps(dx, dy, ax, ay) - N - 1;
          v = m % 3 === 0 ? echo[Math.floor(m / 3) % 2] : fieldTex(x, y);
        }
        set(x, y, v);
      }
      // половинки ромбов у верхней и нижней границы поля
      for (const cy of [fy0, fy1]) {
        for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
          const dx = x - CX, dy = y - cy;
          const t = tsteps(dx, dy, 3, 2);
          if (t <= 3) set(x, y, rc[(3 - t) % rc.length]);
        }
      }
      // кресты в центре
      for (let i = -2; i <= 2; i++) { set(CX + i, CY, 1); set(CX, CY + i, 1); }
      set(CX, CY, 3);
    } else if (variant === 1) {
      // Штормовой узор: центральный блок, угловые квадраты, связующие линии, молнии
      const rc = mkRings();
      const hw = (fx1 - fx0) / 2, hh = (fy1 - fy0) / 2;
      const echo = rr.pick([1, 2, 3]);
      const echoB = rr.pick([1, 2, 3, 4].filter((c) => c !== echo));
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const m = Math.floor(Math.abs(x - CX) / 2) + Math.floor(Math.abs(y - CY) / 2);
        set(x, y, m % 4 === 0 ? echo : m % 4 === 2 ? echoB : fieldTex(x, y));
      }
      const box = (cx, cy, r, ringsArr) => {
        for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
          const m = Math.max(Math.abs(x - cx), Math.abs(y - cy));
          if (inF(x, y)) set(x, y, ringsArr[(r - m) % ringsArr.length]);
        }
      };
      // кресты-связки
      const bar = (x0, y0, x1, y1, c, th = 1) => {
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inF(x, y)) set(x, y, c);
      };
      bar(fx0, CY - 1, fx1, CY + 1, rc[0]); bar(fx0, CY, fx1, CY, rc[1]);
      bar(CX - 1, fy0, CX + 1, fy1, rc[0]); bar(CX, fy0, CX, fy1, rc[1]);
      box(CX, CY, 6, rc.length > 2 ? [rc[1], rc[0], rc[2], rc[1]] : rc);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(CX + sx * (hw - 4), CY + sy * (hh - 4), 4, [rc[0], rc[1], rc[2], rc[0]]);
      // боковые квадраты по осям
      for (const s of [-1, 1]) { box(CX + s * (hw - 4), CY, 3, [rc[1], rc[2], rc[0]]); box(CX, CY + s * (hh - 4), 3, [rc[1], rc[2], rc[0]]); }
    } else if (variant === 2) {
      // Одеяло вождя: симметричные горизонтальные полосы + центральная панель с ромбами
      const stripeCols = rr.shuffle([1, 2, 3, 4]);
      const fh = fy1 - fy0 + 1;
      const panelH = 25;
      const prof = [];
      let acc = panelH / 2 + 1;
      const hasThin = rng.chance(0.7);
      let c = 0;
      while (acc < fh / 2 + 2) {
        const thick = rr.pick([3, 4, 5, 6]);
        prof.push([stripeCols[c % stripeCols.length], thick]); acc += thick;
        if (hasThin) { prof.push([2, 1], [c % 2 ? 3 : 1, 1], [2, 1]); acc += 3; }
        prof.push([0, 2]); acc += 2;
        c++;
      }
      for (let y = fy0; y <= fy1; y++) {
        const dy = Math.abs(y - CY);
        let col = 0;
        let a = panelH / 2 + 1;
        for (const [pc2, th] of prof) { if (dy > a && dy <= a + th) { col = pc2; break; } a += th; }
        for (let x = fx0; x <= fx1; x++) set(x, y, col === 0 ? fieldTex(x, y) : col);
      }
      const lumI = (i) => cols[i][0] + cols[i][1] + cols[i][2];
      const pbg = [1, 2, 3, 4].reduce((a, b) => (lumI(b) > lumI(a) ? b : a));
      const others = [1, 2, 3, 4].filter((i) => i !== pbg).sort((a, b) => lumI(a) - lumI(b));
      const sh = rr.int(0, 2);
      const rc = [others[sh % 3], others[(sh + 1) % 3], others[(sh + 2) % 3], others[sh % 3]];
      for (let y = Math.ceil(CY - panelH / 2); y <= Math.floor(CY + panelH / 2); y++) for (let x = fx0; x <= fx1; x++) {
        let v = ((x * 5 + y * 3) % 13 === 0) ? 5 : pbg;
        for (const cx of [CX - 12, CX, CX + 12]) {
          const t = tsteps(x - cx, y - CY, 2, 2);
          if (t <= 5) v = rc[(5 - t) % rc.length];
          else if (t === 6 && Math.abs(x - cx) < 12) v = 5 === 5 ? 1 : v;
        }
        set(x, y, v);
      }
      for (let x = fx0; x <= fx1; x++) { set(x, Math.ceil(CY - panelH / 2) - 1, 1); set(x, Math.floor(CY + panelH / 2) + 1, 1); }
    } else {
      // Два Серых Холма: решётка малых ступенчатых ромбов, центральный двойной ромб
      const rc = mkRings();
      const small = [rr.pick([1, 3, 4]), 2];
      const Pd = 12;
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const dx = x - CX, dy = y - CY;
        const t1 = tsteps(dist(dx, Pd) , dist(dy, Pd), 1, 1);
        const t2 = tsteps(dist(dx + Pd / 2, Pd), dist(dy + Pd / 2, Pd), 1, 1);
        const t = Math.min(t1, t2);
        let v = 0;
        if (t === 0) v = small[0]; else if (t === 1) v = t1 <= t2 ? small[1] : small[0];
        else if (t === 2 && t1 <= t2) v = small[0];
        else v = fieldTex(x, y);
        set(x, y, v);
      }
      const ax = 3, ay = 4, N = 5;
      for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const dx = x - CX, dy = y - CY;
        const t = tsteps(dx, dy, ax, ay);
        if (t <= N + 1) set(x, y, t === N + 1 ? 1 : rc[(N - t) % rc.length]);
      }
      for (let i = -3; i <= 3; i++) { set(CX + i, CY, 1); set(CX, CY + i, 1); }
      // половинки ромбов по краям
      for (const cy of [fy0, fy1]) for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
        const t = tsteps(x - CX, y - cy, 3, 2);
        if (t <= 3) set(x, y, rc[(3 - t) % rc.length]);
      }
    }
    // внутренняя окантовка поля
    for (let x = fx0; x <= fx1; x++) { if (grid[fy0 * NX + x] === 0) set(x, fy0, 1); if (grid[fy1 * NX + x] === 0) set(x, fy1, 1); }
    for (let y = fy0; y <= fy1; y++) { if (grid[y * NX + fx0] === 0) set(fx0, y, 1); if (grid[y * NX + fx1] === 0) set(fx1, y, 1); }

    // ---- отрисовка ----
    const colTab = [cols[0], cols[1], cols[2], cols[3], cols[4], mix(cols[0], cols[1], 0.16)];
    const cw = CW / NX, ch = CH / NY;
    const nr = rng.fork('tint');
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const base = colTab[grid[y * NX + x]];
      const t = nr.range(-0.04, 0.04) + 0.015 * Math.sin(y * 0.9);
      g.fillStyle = css(t > 0 ? lighten(base, t) : darken(base, -t));
      g.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
    // ступенчатая «полосатость» шерсти
    g.fillStyle = 'rgba(0,0,0,0.10)';
    for (let y = 0; y < NY; y++) g.fillRect(0, (y + 1) * ch - 1, CW, 1);
    g.fillStyle = 'rgba(255,255,255,0.07)';
    for (let y = 0; y < NY; y++) g.fillRect(0, y * ch, CW, 0.8);
    const lum = (c) => c[0] + c[1] + c[2];
    return { edge: darken(cols[1], 0.3), fringe: lum(cols[2]) > 500 ? cols[2] : [232, 218, 188] };
  },
};
