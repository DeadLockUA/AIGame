// Ковёр-пицца: клетчатая кайма-скатерть, в поле пицца (целая, нарезанная, квартет), россыпь овощей.
import { CW, CH, css, darken, lighten, mix, pickPalette, star, petalPath, polar, RNG } from '../kit.js';

const KINDS = ['cream', 'cream', 'cream', 'slate', 'wood', 'sauce'];
const PALS = [
  { check: [200, 36, 44], white: [250, 244, 232], field: [243, 226, 190], field2: [232, 208, 164], trim: [120, 22, 28], edge: [120, 22, 28] },
  { check: [38, 128, 76], white: [248, 244, 228], field: [240, 222, 176], field2: [224, 200, 146], trim: [20, 74, 44], edge: [24, 84, 50] },
  { check: [40, 98, 170], white: [246, 246, 240], field: [250, 232, 160], field2: [236, 210, 120], trim: [20, 52, 100], edge: [24, 56, 104] },
  { check: [214, 70, 30], white: [252, 240, 220], field: [64, 56, 66], field2: [80, 70, 82], trim: [110, 36, 16], edge: [120, 40, 18] },
  { check: [190, 40, 70], white: [250, 238, 232], field: [170, 118, 70], field2: [148, 98, 56], trim: [96, 20, 38], edge: [100, 22, 40] },
  { check: [226, 150, 30], white: [252, 244, 220], field: [184, 52, 46], field2: [164, 40, 38], trim: [130, 78, 12], edge: [136, 84, 14] },
];

const L = (c, a) => css(c, a);
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };

/* ---------- ингредиенты ---------- */
function pepperoni(g, s, rg) {
  const base = [188, 44, 40];
  const gr = g.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.1, 0, 0, s);
  gr.addColorStop(0, L(lighten(base, 0.18))); gr.addColorStop(1, L(darken(base, 0.12)));
  circ(g, 0, 0, s); g.fillStyle = gr; g.fill();
  g.lineWidth = Math.max(0.8, s * 0.1); g.strokeStyle = L(darken(base, 0.4)); g.stroke();
  g.fillStyle = L(darken(base, 0.35), 0.7);
  for (let i = 0; i < 6; i++) { const a = rg.range(0, 6.28), d = rg.range(0.1, 0.7) * s; circ(g, Math.cos(a) * d, Math.sin(a) * d, s * rg.range(0.06, 0.12)); g.fill(); }
  g.fillStyle = L([255, 190, 150], 0.45);
  g.beginPath(); g.ellipse(-s * 0.38, -s * 0.42, s * 0.25, s * 0.1, -0.7, 0, 6.3); g.fill();
}
function mushroomSlice(g, s) {
  g.beginPath();
  g.moveTo(-s * 0.28, s * 0.9);
  g.bezierCurveTo(-s * 0.3, s * 0.3, -s * 1.1, s * 0.25, -s * 0.95, -s * 0.2);
  g.bezierCurveTo(-s * 0.8, -s * 0.9, s * 0.8, -s * 0.9, s * 0.95, -s * 0.2);
  g.bezierCurveTo(s * 1.1, s * 0.25, s * 0.3, s * 0.3, s * 0.28, s * 0.9);
  g.closePath();
  g.fillStyle = L([238, 222, 190]); g.fill();
  g.lineWidth = Math.max(0.7, s * 0.12); g.strokeStyle = L([140, 104, 70]); g.stroke();
  g.beginPath(); g.moveTo(-s * 0.9, -s * 0.05); g.quadraticCurveTo(0, -s * 0.35, s * 0.9, -s * 0.05);
  g.strokeStyle = L([170, 130, 90], 0.8); g.lineWidth = Math.max(0.6, s * 0.1); g.stroke();
}
function olive(g, s) {
  circ(g, 0, 0, s); g.fillStyle = L([36, 38, 34]); g.fill();
  g.lineWidth = s * 0.14; g.strokeStyle = L([90, 96, 70]); g.stroke();
  circ(g, 0, 0, s * 0.38); g.fillStyle = L([214, 150, 90], 0.9); g.fill();
}
function basil(g, s, c = [58, 140, 60]) {
  g.save();
  petalPath(g, s * 2, s * 0.95);
  g.translate(0, s);
  g.restore();
  g.save(); g.translate(0, s);
  petalPath(g, s * 2, s * 0.95);
  g.fillStyle = L(c); g.fill();
  g.lineWidth = Math.max(0.7, s * 0.1); g.strokeStyle = L(darken(c, 0.4)); g.stroke();
  g.strokeStyle = L(lighten(c, 0.3), 0.8); g.lineWidth = Math.max(0.6, s * 0.09);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 1.8); g.stroke();
  for (let i = 1; i < 4; i++) {
    const y = -s * 0.4 * i;
    g.beginPath(); g.moveTo(0, y); g.lineTo(s * 0.6, y - s * 0.3); g.moveTo(0, y); g.lineTo(-s * 0.6, y - s * 0.3); g.stroke();
  }
  g.restore();
}
function pepperRing(g, s) {
  g.lineWidth = s * 0.34; g.strokeStyle = L([70, 160, 60]); circ(g, 0, 0, s * 0.8); g.stroke();
  g.lineWidth = s * 0.08; g.strokeStyle = L([170, 230, 130], 0.8); g.beginPath(); g.arc(0, 0, s * 0.86, 3.6, 5.2); g.stroke();
}
function mozz(g, s) {
  polar(g, 0, 0, 0, (a) => s * (1 + 0.08 * Math.sin(5 * a + 1)));
  g.fillStyle = L([255, 250, 236]); g.fill();
  g.lineWidth = Math.max(0.6, s * 0.08); g.strokeStyle = L([226, 206, 160]); g.stroke();
}
function tomato(g, s) {
  const gr = g.createRadialGradient(-s * 0.35, -s * 0.35, s * 0.1, 0, 0, s * 1.1);
  gr.addColorStop(0, L([255, 110, 90])); gr.addColorStop(0.6, L([214, 42, 36])); gr.addColorStop(1, L([150, 22, 26]));
  g.beginPath(); g.ellipse(0, s * 0.05, s, s * 0.9, 0, 0, 6.3); g.fillStyle = gr; g.fill();
  g.lineWidth = Math.max(0.8, s * 0.07); g.strokeStyle = L([110, 18, 22]); g.stroke();
  star(g, 0, -s * 0.78, s * 0.42, s * 0.12, 5, -Math.PI / 2 + 0.3);
  g.fillStyle = L([60, 140, 56]); g.fill(); g.strokeStyle = L([30, 80, 34]); g.lineWidth = 0.8; g.stroke();
  g.fillStyle = L([255, 255, 255], 0.5); g.beginPath(); g.ellipse(-s * 0.45, -s * 0.2, s * 0.14, s * 0.3, 0.5, 0, 6.3); g.fill();
}
function mushroomWhole(g, s) {
  g.beginPath(); g.roundRect(-s * 0.3, 0, s * 0.6, s * 0.9, s * 0.2);
  g.fillStyle = L([240, 228, 200]); g.fill(); g.lineWidth = 0.9; g.strokeStyle = L([140, 104, 70]); g.stroke();
  g.beginPath(); g.moveTo(-s, 0.05 * s); g.bezierCurveTo(-s, -s * 1.1, s, -s * 1.1, s, 0.05 * s);
  g.quadraticCurveTo(0, s * 0.3, -s, 0.05 * s); g.closePath();
  const gr = g.createLinearGradient(0, -s, 0, s * 0.2);
  gr.addColorStop(0, L([190, 130, 86])); gr.addColorStop(1, L([140, 88, 56]));
  g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(0.9, s * 0.07); g.strokeStyle = L([90, 52, 34]); g.stroke();
  g.fillStyle = L([250, 230, 200], 0.85);
  for (const [x, y, r] of [[-0.45, -0.4, 0.14], [0.2, -0.6, 0.12], [0.5, -0.2, 0.1], [-0.1, -0.2, 0.09]]) { circ(g, x * s, y * s, r * s); g.fill(); }
}
function chili(g, s) {
  g.beginPath(); g.moveTo(-s * 0.6, -s * 0.5);
  g.bezierCurveTo(s * 0.4, -s * 0.9, s * 1.1, -s * 0.1, s * 1.1, s * 0.8);
  g.bezierCurveTo(s * 0.6, s * 0.1, -s * 0.1, s * 0.0, -s * 0.6, s * 0.1);
  g.closePath(); g.fillStyle = L([214, 40, 34]); g.fill();
  g.lineWidth = Math.max(0.8, s * 0.08); g.strokeStyle = L([120, 18, 20]); g.stroke();
  g.beginPath(); g.roundRect(-s * 0.95, -s * 0.62, s * 0.4, s * 0.8, s * 0.15); g.fillStyle = L([60, 140, 56]); g.fill(); g.strokeStyle = L([30, 80, 34]); g.stroke();
}
function garlic(g, s) {
  g.beginPath(); g.moveTo(0, -s * 1.1);
  g.bezierCurveTo(s * 0.2, -s * 0.6, s * 1.1, -s * 0.5, s * 0.9, s * 0.3);
  g.bezierCurveTo(s * 0.7, s * 0.95, -s * 0.7, s * 0.95, -s * 0.9, s * 0.3);
  g.bezierCurveTo(-s * 1.1, -s * 0.5, -s * 0.2, -s * 0.6, 0, -s * 1.1); g.closePath();
  g.fillStyle = L([250, 244, 230]); g.fill(); g.lineWidth = Math.max(0.8, s * 0.07); g.strokeStyle = L([170, 150, 120]); g.stroke();
  g.strokeStyle = L([200, 184, 150]); g.beginPath(); g.moveTo(0, -s * 0.9); g.quadraticCurveTo(s * 0.4, 0, 0, s * 0.85); g.moveTo(0, -s * 0.9); g.quadraticCurveTo(-s * 0.4, 0, 0, s * 0.85); g.stroke();
}

const TOP = {
  pep: { r: 0.14, n: 9, draw: pepperoni },
  mush: { r: 0.11, n: 7, draw: mushroomSlice },
  olive: { r: 0.06, n: 9, draw: olive },
  basil: { r: 0.1, n: 5, draw: basil, big: true },
  pepper: { r: 0.09, n: 5, draw: pepperRing },
  moz: { r: 0.15, n: 7, draw: mozz },
};

/* ---------- пицца ---------- */
function pizzaBody(g, r, seed, o) {
  const rg = new RNG(seed);
  const crust = o.crust;
  // корочка
  let gr = g.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.6, 0, 0, r);
  gr.addColorStop(0, L(lighten(crust, 0.12))); gr.addColorStop(0.85, L(crust)); gr.addColorStop(1, L(darken(crust, 0.28)));
  circ(g, 0, 0, r); g.fillStyle = gr; g.fill();
  g.lineWidth = r * 0.025; g.strokeStyle = L(darken(crust, 0.5)); g.stroke();
  for (let i = 0; i < 26; i++) {
    const a = rg.range(0, 6.283), rr = r * rg.range(0.89, 0.97);
    g.fillStyle = rg.chance(0.5) ? L(lighten(crust, 0.3), 0.55) : L(darken(crust, 0.35), 0.45);
    g.beginPath(); g.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, r * rg.range(0.02, 0.045), r * rg.range(0.015, 0.03), a, 0, 6.3); g.fill();
  }
  // соус
  const rs = r * 0.86;
  gr = g.createRadialGradient(0, 0, 0, 0, 0, rs);
  gr.addColorStop(0, L(o.sauce)); gr.addColorStop(1, L(darken(o.sauce, 0.2)));
  circ(g, 0, 0, rs); g.fillStyle = gr; g.fill();
  g.lineWidth = r * 0.012; g.strokeStyle = L(darken(o.sauce, 0.4), 0.7); g.stroke();
  // сыр
  const p1 = rg.range(0, 6), p2 = rg.range(0, 6), p3 = rg.range(0, 6);
  const cheeseR = (a) => r * 0.8 * (1 + 0.035 * Math.sin(7 * a + p1) + 0.03 * Math.sin(11 * a + p2) + 0.02 * Math.sin(17 * a + p3));
  polar(g, 0, 0, 0, cheeseR);
  gr = g.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r * 0.82);
  gr.addColorStop(0, L(lighten(o.cheese, 0.2))); gr.addColorStop(1, L(o.cheese));
  g.fillStyle = gr; g.fill();
  g.lineWidth = r * 0.015; g.strokeStyle = L(darken(o.cheese, 0.3), 0.8); g.stroke();
  // подтёки сыра за краем
  for (let i = 0; i < 6; i++) {
    const a = rg.range(0, 6.283), rr = cheeseR(a);
    g.fillStyle = L(o.cheese); g.beginPath(); g.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.05, r * 0.08, a + 1.57, 0, 6.3); g.fill();
    g.lineWidth = 0.7; g.strokeStyle = L(darken(o.cheese, 0.3), 0.7); g.stroke();
  }
  // пузыри/подрумянивание
  for (let i = 0; i < 16; i++) {
    const a = rg.range(0, 6.283), d = rg.range(0, 0.72) * r;
    g.fillStyle = L([200, 120, 40], 0.4); g.beginPath(); g.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * rg.range(0.03, 0.07), r * rg.range(0.025, 0.05), a, 0, 6.3); g.fill();
    g.fillStyle = L(lighten(o.cheese, 0.45), 0.6); g.beginPath(); g.ellipse(Math.cos(a) * d - 1, Math.sin(a) * d - 1.5, r * 0.03, r * 0.015, a, 0, 6.3); g.fill();
  }
  // начинка
  const placed = [];
  const maxD = r * 0.7;
  const fit = (x, y, rr) => {
    if (Math.hypot(x, y) + rr > r * 0.76) return false;
    for (const p of placed) if (Math.hypot(p.x - x, p.y - y) < (p.r + rr) * 0.92) return false;
    return true;
  };
  for (const k of o.kinds) {
    const t = TOP[k];
    const cnt = Math.max(2, Math.round(t.n * (r / 100) * (r / 100) * (k === 'pep' ? 1 : 1)));
    for (let i = 0; i < cnt; i++) {
      for (let tries = 0; tries < 30; tries++) {
        const a = rg.range(0, 6.283), d = Math.sqrt(rg.next()) * maxD;
        const s = r * t.r * rg.range(0.88, 1.1);
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        const rr = t.big ? s * 1.3 : s * 1.1;
        if (!fit(x, y, rr)) continue;
        placed.push({ x, y, r: rr });
        g.save(); g.translate(x, y); g.rotate(rg.range(0, 6.283));
        // тень
        g.shadowColor = 'rgba(60,20,0,0.35)'; g.shadowBlur = 2; g.shadowOffsetY = 1.2;
        t.draw(g, s, rg);
        g.restore();
        break;
      }
    }
  }
}

function wedgePath(g, r, a0, a1) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a1); g.closePath(); }

function slicedPizza(g, x, y, r, seed, o, n, gap, rot, pull) {
  g.save(); g.translate(x, y);
  const step = (Math.PI * 2) / n;
  const disp = (i) => {
    const am = rot + (i + 0.5) * step;
    const d = gap * (i === pull ? 1 : 0) + (i === pull ? r * 0.3 : 0) + gap * (i === pull ? 0 : 1);
    return [Math.cos(am) * d, Math.sin(am) * d];
  };
  // сыр-ниточки между вытянутым ломтём и соседом
  const order = [...Array(n).keys()].filter((i) => i !== pull).concat(pull >= 0 ? [pull] : []);
  for (const i of order) {
    const a0 = rot + i * step, a1 = a0 + step;
    const [dx, dy] = disp(i);
    g.save(); g.translate(dx + 2, dy + 3.5); wedgePath(g, r, a0, a1); g.fillStyle = 'rgba(40,20,10,0.28)'; g.fill(); g.restore();
    g.save(); g.translate(dx, dy); wedgePath(g, r, a0, a1); g.save(); g.clip();
    pizzaBody(g, r, seed, o);
    g.restore();
    wedgePath(g, r, a0, a1); g.lineWidth = 1.3; g.strokeStyle = L(darken(o.crust, 0.55), 0.9); g.stroke();
    g.restore();
  }
  if (pull >= 0) {
    const a0 = rot + pull * step;
    const prev = (pull + n - 1) % n;
    const [dx, dy] = disp(pull), [px, py] = disp(prev);
    const ux = Math.cos(a0), uy = Math.sin(a0);
    const cnt = 6;
    for (let k = 0; k < cnt; k++) {
      const t = r * (0.22 + 0.62 * (k / (cnt - 1)));
      const x1 = dx + ux * t, y1 = dy + uy * t, x2 = px + ux * t, y2 = py + uy * t;
      const mx = (x1 + x2) / 2 + Math.sin(k * 2.1) * 3, my = (y1 + y2) / 2 + 4 + Math.cos(k * 1.7) * 2;
      g.lineCap = 'round';
      g.strokeStyle = L(darken(o.cheese, 0.25)); g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
      g.strokeStyle = L(lighten(o.cheese, 0.2)); g.lineWidth = 1.7;
      g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
    }
  }
  g.restore();
}

function wholePizza(g, x, y, r, seed, o, rot = 0) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(40,20,10,0.3)'; g.beginPath(); g.ellipse(3, 5, r * 1.01, r * 1.01, 0, 0, 6.3); g.fill();
  g.rotate(rot);
  pizzaBody(g, r, seed, o);
  g.restore();
}

/* ---------- россыпь на поле ---------- */
const SCAT = [
  { f: tomato, r: 12 }, { f: mushroomWhole, r: 12 }, { f: basil, r: 10, big: true }, { f: chili, r: 11 },
  { f: garlic, r: 10 }, { f: olive, r: 6 }, { f: pepperRing, r: 9 },
];

function scatter(g, rg, area, obstacles, count, kinds) {
  const placed = [];
  const [x0, y0, x1, y1] = area;
  for (let i = 0; i < count; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const t = rg.pick(kinds);
      const s = t.r * rg.range(0.9, 1.25);
      const rr = s * (t.big ? 1.9 : 1.15);
      const x = rg.range(x0 + rr, x1 - rr), y = rg.range(y0 + rr, y1 - rr);
      if (obstacles.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + rr + 4)) continue;
      if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.r + rr) * 1.0)) continue;
      placed.push({ x, y, r: rr });
      g.save(); g.translate(x, y); g.rotate(rg.range(0, 6.283));
      g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5;
      t.f(g, s, rg);
      g.restore();
      break;
    }
  }
  return placed;
}

/* ---------- скатерть и поле ---------- */
const CELL = 9, BAND = 36;
function cloth(g, pal) {
  g.fillStyle = L(pal.white); g.fillRect(0, 0, CW, CH);
  g.fillStyle = L(pal.check, 0.55);
  for (let j = 0; j * CELL < CH; j += 2) g.fillRect(0, j * CELL, CW, CELL);
  for (let i = 0; i * CELL < CW; i += 2) g.fillRect(i * CELL, 0, CELL, CH);
  // лёгкая «ткань»: мелкие диагонали на цветных клетках
  g.strokeStyle = L(pal.white, 0.12); g.lineWidth = 0.6;
  g.beginPath();
  for (let k = -CH; k < CW; k += 3) { g.moveTo(k, 0); g.lineTo(k + CH, CH); }
  g.stroke();
  // строчка
  g.setLineDash([4, 3]); g.lineWidth = 1.2; g.strokeStyle = L(pal.white, 0.9);
  g.strokeRect(BAND - 4.5, BAND - 4.5, CW - 2 * BAND + 9, CH - 2 * BAND + 9);
  g.setLineDash([]);
  g.fillStyle = L(pal.trim); g.fillRect(BAND, BAND, CW - 2 * BAND, CH - 2 * BAND);
}

function fieldBase(g, pal, rg) {
  const x = BAND + 2.5, y = BAND + 2.5, w = CW - 2 * x, h = CH - 2 * y;
  const gr = g.createRadialGradient(CW / 2, CH / 2, 40, CW / 2, CH / 2, 300);
  gr.addColorStop(0, L(lighten(pal.field, 0.06))); gr.addColorStop(1, L(darken(pal.field, 0.1)));
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (pal.kind === 'wood') {
    g.lineWidth = 1.2;
    for (let yy = y; yy < y + h; yy += 7) {
      g.strokeStyle = L(pal.field2, 0.55); g.beginPath(); g.moveTo(x, yy);
      const ph = rg.range(0, 6);
      for (let xx = x; xx <= x + w; xx += 10) g.lineTo(xx, yy + Math.sin(xx * 0.03 + ph + yy * 0.1) * 1.6);
      g.stroke();
    }
    g.strokeStyle = L(darken(pal.field, 0.35), 0.5); g.lineWidth = 1;
    for (let yy = y + 56; yy < y + h; yy += 112) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  } else {
    // ромбическая решётка из точек
    g.fillStyle = L(pal.field2, pal.kind === 'slate' ? 0.8 : 0.6);
    for (let yy = y; yy < y + h; yy += 12) for (let xx = x + ((Math.round(yy / 12) % 2) * 6); xx < x + w; xx += 12) {
      g.beginPath(); g.moveTo(xx, yy - 2.4); g.lineTo(xx + 1.8, yy); g.lineTo(xx, yy + 2.4); g.lineTo(xx - 1.8, yy); g.fill();
    }
  }
  // орегано
  const oreg = pal.kind === 'slate' ? [150, 190, 110] : [92, 130, 60];
  for (let i = 0; i < 90; i++) {
    g.fillStyle = L(oreg, 0.55); g.save(); g.translate(rg.range(x, x + w), rg.range(y, y + h)); g.rotate(rg.range(0, 6.3));
    g.fillRect(-1.6, -0.5, 3.2, 1); g.restore();
  }
  g.restore();
  // внутренний кант
  g.lineWidth = 1.2; g.strokeStyle = L(darken(pal.trim, 0.2)); g.strokeRect(x, y, w, h);
}

function cornerTomatoes(g, rg) {
  for (const [x, y, rot] of [[BAND + 20, BAND + 20, -0.4], [CW - BAND - 20, BAND + 20, 0.5], [BAND + 20, CH - BAND - 20, 0.8], [CW - BAND - 20, CH - BAND - 20, -0.9]]) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5;
    basil(g, 9); g.rotate(2.1); basil(g, 8);
    g.restore();
  }
}

const TOPPING_SETS = [
  ['pep', 'mush', 'olive', 'basil'],
  ['pep', 'pepper', 'olive'],
  ['moz', 'basil', 'basil'],
  ['mush', 'pepper', 'olive', 'basil'],
  ['pep', 'pep', 'mush'],
];

export default {
  id: 'pizza',
  name: 'Пицца',
  paint(g, rng) {
    const pi = rng.int(0, PALS.length - 1);
    const pal = pickPalette(new RNG(rng.int(1, 1e9)), [PALS[pi]]);
    pal.kind = KINDS[pi];
    const lr = rng.fork('layout');
    const variant = rng.int(0, 3);
    cloth(g, pal);
    fieldBase(g, pal, rng.fork('field'));

    const crust = rng.pick([[226, 166, 84], [214, 150, 70], [232, 180, 100]]);
    const sauce = rng.pick([[206, 56, 38], [190, 44, 34], [220, 78, 44]]);
    const cheese = rng.pick([[250, 208, 84], [246, 196, 70], [252, 220, 110]]);
    const mk = (kinds) => ({ crust, sauce, cheese, kinds });
    const sc = SCAT;
    const area = [BAND + 6, BAND + 6, CW - BAND - 6, CH - BAND - 6];
    const cx = CW / 2, cy = CH / 2;
    const obs = [];
    const seed = rng.int(1, 1e9);
    const kinds = lr.pick(TOPPING_SETS);

    if (variant === 0) {
      const r = 116;
      obs.push({ x: cx, y: cy, r: r + 4 });
      scatter(g, lr, area, obs, 26, sc);
      cornerTomatoes(g, lr);
      wholePizza(g, cx, cy, r, seed, mk(kinds), lr.range(0, 6.28));
    } else if (variant === 1) {
      const r = 100, n = lr.pick([6, 8]);
      const rot = lr.range(0, 6.28);
      const pull = lr.int(0, n - 1);
      obs.push({ x: cx, y: cy, r: r + 36 });
      scatter(g, lr, area, obs, 26, sc);
      cornerTomatoes(g, lr);
      slicedPizza(g, cx, cy, r, seed, mk(kinds), n, 5, rot, pull);
    } else if (variant === 2) {
      const r = 90;
      const y1 = 158, y2 = 392;
      obs.push({ x: cx, y: y1, r: r + 4 }, { x: cx, y: y2, r: r + 22 });
      scatter(g, lr, area, obs, 22, sc);
      cornerTomatoes(g, lr);
      wholePizza(g, cx, y1, r, seed, mk(kinds), lr.range(0, 6.28));
      slicedPizza(g, cx, y2, r, seed + 7, mk(lr.pick(TOPPING_SETS)), 6, 4, lr.range(0, 6.28), lr.int(0, 5));
    } else {
      const r = 63;
      const pos = [[cx - 71, 150], [cx + 71, 150 + 0], [cx - 71, 390], [cx + 71, 390]];
      for (const [x, y] of pos) obs.push({ x, y, r: r + 4 });
      obs.push({ x: cx, y: cy, r: 26 });
      const sets = lr.shuffle(TOPPING_SETS);
      scatter(g, lr, area, obs, 22, sc);
      cornerTomatoes(g, lr);
      pos.forEach(([x, y], i) => wholePizza(g, x, y, r, seed + i * 31, mk(sets[i % sets.length]), lr.range(0, 6.28)));
      // центральный клубок из базилика и помидора
      g.save(); g.translate(cx, cy);
      g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5;
      tomato(g, 14); g.restore();
    }
    return { edge: pal.edge, fringe: lighten(pal.white, 0) };
  },
};
