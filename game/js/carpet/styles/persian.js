// Персидский ковёр: пять композиций (медальон, герати, шах-аббаси, чахар-баг, михраб),
// плавные лозы-безье с завитками, многополосная кайма, густое поле с ростками.
import { CW, CH, css, mix, lighten, darken, pickPalette, RNG } from '../kit.js';

const PI = Math.PI, TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- палитры ----------
const PALS = [
  // рубиновая
  { field: [140, 30, 38], fieldL: [168, 48, 52], fieldD: [98, 18, 28], band: [24, 48, 92], band2: [88, 16, 26], a1: [226, 188, 112], a2: [40, 124, 132], a3: [84, 112, 176], ink: [244, 232, 200], dark: [36, 10, 14], edge: [58, 16, 22] },
  // индиго
  { field: [26, 42, 92], fieldL: [48, 68, 122], fieldD: [16, 26, 64], band: [128, 30, 38], band2: [14, 24, 58], a1: [224, 186, 112], a2: [196, 74, 66], a3: [60, 144, 144], ink: [242, 232, 202], dark: [8, 12, 34], edge: [16, 24, 58] },
  // бирюзовая
  { field: [20, 108, 116], fieldL: [44, 138, 142], fieldD: [10, 70, 80], band: [120, 34, 42], band2: [8, 62, 70], a1: [228, 192, 120], a2: [34, 56, 112], a3: [216, 112, 82], ink: [246, 236, 206], dark: [4, 34, 40], edge: [8, 52, 58] },
  // слоновая кость
  { field: [234, 222, 194], fieldL: [246, 238, 214], fieldD: [214, 198, 162], band: [134, 38, 40], band2: [208, 190, 150], a1: [172, 124, 54], a2: [36, 72, 116], a3: [168, 58, 52], ink: [252, 246, 228], dark: [58, 36, 28], edge: [112, 38, 34] },
  // баклажан
  { field: [78, 36, 88], fieldL: [106, 58, 116], fieldD: [50, 20, 60], band: [30, 76, 90], band2: [44, 18, 54], a1: [234, 198, 124], a2: [200, 90, 114], a3: [100, 164, 152], ink: [246, 236, 214], dark: [22, 8, 28], edge: [38, 18, 48] },
  // золотистая (шафран)
  { field: [196, 142, 54], fieldL: [220, 170, 82], fieldD: [150, 100, 34], band: [96, 28, 38], band2: [128, 82, 28], a1: [250, 230, 178], a2: [38, 86, 122], a3: [164, 52, 48], ink: [252, 242, 208], dark: [52, 28, 14], edge: [96, 56, 24] },
  // изумрудная
  { field: [32, 88, 62], fieldL: [56, 116, 84], fieldD: [18, 58, 42], band: [122, 34, 40], band2: [16, 50, 36], a1: [228, 190, 114], a2: [196, 84, 72], a3: [52, 114, 152], ink: [244, 234, 204], dark: [8, 28, 20], edge: [16, 46, 34] },
];

// ---------- базовая графика ----------
function turtle(x, y, a, cmds, step = 1.6) {
  const pts = [{ x, y, a }];
  for (const [L, k0, k1] of cmds) {
    const n = Math.max(1, Math.ceil(L / step)), ds = L / n;
    for (let i = 0; i < n; i++) {
      a += lerp(k0, k1, (i + 0.5) / n) * ds;
      x += Math.cos(a) * ds; y += Math.sin(a) * ds;
      pts.push({ x, y, a });
    }
  }
  return pts;
}

function spline(P, step = 1.6) {
  const out = [], n = P.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    const m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]), a: 0 });
    }
  }
  out.push({ x: P[n - 1][0], y: P[n - 1][1], a: 0 });
  for (let i = 0; i < out.length; i++) {
    const p = out[Math.max(0, i - 1)], q = out[Math.min(out.length - 1, i + 1)];
    out[i].a = Math.atan2(q.y - p.y, q.x - p.x);
  }
  return out;
}

function ribbonPath(g, pts, w0, w1, extra = 0) {
  const n = pts.length;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], w = (lerp(w0, w1, i / (n - 1)) + extra) / 2;
    const x = p.x - Math.sin(p.a) * w, y = p.y + Math.cos(p.a) * w;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  for (let i = n - 1; i >= 0; i--) {
    const p = pts[i], w = (lerp(w0, w1, i / (n - 1)) + extra) / 2;
    g.lineTo(p.x + Math.sin(p.a) * w, p.y - Math.cos(p.a) * w);
  }
  g.closePath();
}
function ribbon(g, pts, w0, w1, fill, dark, outA = 0.6) {
  if (pts.length < 2) return;
  if (dark) { ribbonPath(g, pts, w0, w1, 1.1); g.fillStyle = css(dark, outA); g.fill(); }
  ribbonPath(g, pts, w0, w1, 0); g.fillStyle = css(fill); g.fill();
}

function along(pts, every, off, fn) {
  let acc = off, idx = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc >= every) { acc = 0; fn(pts[i], idx++, i / (pts.length - 1)); }
  }
}

function leaf(g, x, y, a, len, w, fill, ln, bend = 0, rib = true) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(len * 0.2, -w * 1.15 + bend * 0.3, len * 0.66, -w * 0.9 + bend, len, bend * 1.25);
  g.bezierCurveTo(len * 0.66, w * 0.9 + bend, len * 0.2, w * 1.15 + bend * 0.3, 0, 0);
  g.closePath();
  g.fillStyle = css(fill); g.fill();
  g.lineWidth = 0.55; g.strokeStyle = css(ln, 0.85); g.stroke();
  if (rib && len > 9) {
    g.beginPath(); g.moveTo(len * 0.1, bend * 0.15); g.quadraticCurveTo(len * 0.5, bend * 0.6, len * 0.82, bend * 1.05);
    g.lineWidth = 0.45; g.strokeStyle = css(ln, 0.45); g.stroke();
  }
  g.restore();
}

function bloom(g, x, y, r, a, n, c1, c2, c3, ln) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.lineWidth = Math.max(0.45, r * 0.07); g.strokeStyle = css(ln, 0.9);
  const wf = Math.min(1, 4.2 / n + 0.12);
  for (let pass = 0; pass < 2; pass++) {
    const rr = pass ? r * 0.6 : r;
    g.fillStyle = css(pass ? c2 : c1);
    for (let i = 0; i < n; i++) {
      g.save(); g.rotate((i * TAU) / n + (pass ? PI / n : 0));
      g.beginPath(); g.moveTo(0, -rr * 0.1);
      g.bezierCurveTo(rr * 0.8 * wf, -rr * 0.3, rr * 0.62 * wf, -rr * 1.05, 0, -rr);
      g.bezierCurveTo(-rr * 0.62 * wf, -rr * 1.05, -rr * 0.8 * wf, -rr * 0.3, 0, -rr * 0.1);
      g.fill(); g.stroke(); g.restore();
    }
  }
  g.beginPath(); g.arc(0, 0, r * 0.22, 0, TAU); g.fillStyle = css(c3); g.fill(); g.stroke();
  g.restore();
}

// пальметта-веер, вверх от (0,0)
function fan(g, s, c1, c2, c3, ln, n = 9) {
  const half = (n - 1) / 2;
  const order = [];
  for (let i = 0; i < n; i++) order.push(i);
  order.sort((p, q) => Math.abs(q - half) - Math.abs(p - half));
  for (const i of order) {
    const t = (i - half) / half, L = s * (1 - 0.3 * Math.abs(t));
    g.save(); g.rotate(t * 1.15 - PI / 2);
    leaf(g, 0, 0, 0, L, s * 0.16, i % 2 ? c1 : c2, ln, t * L * 0.12, false);
    g.restore();
  }
  g.beginPath(); g.moveTo(-s * 0.22, s * 0.02); g.quadraticCurveTo(0, s * 0.3, s * 0.22, s * 0.02);
  g.quadraticCurveTo(0, -s * 0.12, -s * 0.22, s * 0.02);
  g.fillStyle = css(c3); g.fill(); g.lineWidth = 0.5; g.strokeStyle = css(ln, 0.9); g.stroke();
}

function lobed(g, rx, ry, n, depth, rot = 0, steps = 160) {
  g.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU, r = 1 - depth + depth * Math.abs(Math.cos((n * a) / 2 + rot));
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.closePath();
}

function stroke(g, col, lw, alpha = 1) { g.strokeStyle = css(col, alpha); g.lineWidth = lw; g.stroke(); }

const bloomCols = (pal, i) => [[pal.a1, pal.ink, pal.a3], [pal.a3, pal.ink, pal.a1], [pal.ink, pal.a2, pal.a1], [pal.a2, pal.a1, pal.ink]][((i % 4) + 4) % 4];

// ---------- растущая лоза ----------
function volute(s, sc, k) {
  return [[12 * sc, s * k, s * 0.1 / sc], [20 * sc, s * 0.1 / sc, s * 0.3 / sc], [12 * sc, s * 0.3 / sc, s * 0.6 / sc]];
}

function grow(g, r, pal, x, y, a, len, depth, sc, o = {}) {
  const k = r.range(0.02, 0.034) / sc * (o.kk || 1);
  let sgn = o.sgn || (r.chance(0.5) ? 1 : -1);
  const segs = []; let tot = 0;
  while (tot < len) { const L = r.range(28, 44) * sc; segs.push([L, sgn * k, sgn * k]); sgn = -sgn; tot += L; }
  const endKind = o.end || r.pick(['volute', 'volute', 'bloom', 'fan']);
  if (endKind === 'volute') segs.push(...volute(-sgn, sc, k));
  const pts = turtle(x, y, a, segs);
  const stemC = o.stem || pal.a1;
  ribbon(g, pts, 3.0 * sc, endKind === 'volute' ? 0.8 : 1.4 * sc, stemC, pal.dark);
  const bi = o.bi || 0;
  let side = r.chance(0.5) ? 1 : -1;
  const every = 15 * sc;
  along(pts, every, 4, (p, i, t) => {
    const s = i % 2 ? 1 : -1;
    const L = (9 + 4 * (1 - t)) * sc;
    leaf(g, p.x, p.y, p.a + s * 0.95, L, L * 0.34, i % 4 < 2 ? pal.a2 : pal.a3, pal.dark, s * L * 0.18);
  });
  if (depth > 0) {
    along(pts, 46 * sc, 20 * sc, (p, i, t) => {
      if (t > 0.88) return;
      side = -side;
      grow(g, r, pal, p.x, p.y, p.a + side * 1.05, len * 0.5, depth - 1, sc * 0.78, { sgn: side, end: depth > 1 ? undefined : r.pick(['bloom', 'volute', 'fan']), bi: bi + i });
      if (r.chance(0.7)) { const c = bloomCols(pal, bi + i); bloom(g, p.x, p.y, 4.2 * sc, p.a, 5, c[0], c[1], c[2], pal.dark); }
    });
  }
  const e = pts[pts.length - 1];
  if (endKind === 'bloom') {
    const c = bloomCols(pal, bi + 1);
    bloom(g, e.x, e.y, 8.5 * sc, e.a + PI / 2, 6, c[0], c[1], c[2], pal.dark);
  } else if (endKind === 'fan') {
    g.save(); g.translate(e.x, e.y); g.rotate(e.a + PI / 2);
    fan(g, 17 * sc, pal.a1, pal.ink, pal.a3, pal.dark, 7);
    g.restore();
  } else {
    // почка в центре завитка
    const q = pts[pts.length - 1];
    g.beginPath(); g.arc(q.x, q.y, 1.8 * sc, 0, TAU); g.fillStyle = css(pal.a3); g.fill();
  }
}

// ---------- густое поле: мелкие ростки и цветочки ----------
function ground(g, pal, r, x, y, w, h, step = 12.5, k = 0.22) {
  const lightField = pal.field[0] + pal.field[1] + pal.field[2] > 520;
  const c1 = lightField ? mix(pal.field, pal.dark, 0.2) : mix(pal.field, pal.a1, k);
  const c2 = lightField ? mix(pal.field, pal.a2, 0.28) : mix(pal.field, pal.dark, 0.28);
  const c3 = lightField ? mix(pal.field, pal.a3, 0.3) : mix(pal.field, pal.ink, k * 0.75);
  let row = 0;
  for (let yy = y + step / 2; yy < y + h; yy += step, row++) {
    for (let xx = x + step / 2 + (row % 2) * (step / 2); xx < x + w; xx += step) {
      const px = xx + r.range(-2.5, 2.5), py = yy + r.range(-2.5, 2.5), a = r.range(0, TAU);
      const t = r.next();
      g.save(); g.translate(px, py); g.rotate(a);
      if (t < 0.45) {
        // росток: стебелёк и два листика
        g.beginPath(); g.moveTo(0, 3); g.quadraticCurveTo(1, 0, 0, -3);
        stroke(g, c1, 0.9, 0.9);
        for (const s of [-1, 1]) {
          g.beginPath(); g.moveTo(0, -0.5); g.quadraticCurveTo(s * 3.6, -1.2, s * 3.8, -4.2); g.quadraticCurveTo(s * 0.8, -3.2, 0, -0.5);
          g.fillStyle = css(c1, 0.95); g.fill();
        }
      } else if (t < 0.8) {
        // цветочек из четырёх точек
        g.fillStyle = css(c3, 0.95); g.beginPath();
        for (let i = 0; i < 4; i++) { const b = (i * PI) / 2; g.moveTo(Math.cos(b) * 2.1 + 1.25, Math.sin(b) * 2.1); g.arc(Math.cos(b) * 2.1, Math.sin(b) * 2.1, 1.25, 0, TAU); }
        g.fill();
        g.beginPath(); g.arc(0, 0, 0.9, 0, TAU); g.fillStyle = css(c2, 0.95); g.fill();
      } else {
        // листик-капля
        g.beginPath(); g.moveTo(0, 3.2); g.bezierCurveTo(3.2, 1, 2.2, -2.6, 0, -4); g.bezierCurveTo(-2.2, -2.6, -3.2, 1, 0, 3.2);
        g.fillStyle = css(c2, 0.9); g.fill();
        g.beginPath(); g.moveTo(0, 2); g.lineTo(0, -2.4); stroke(g, c1, 0.6, 0.8);
      }
      g.restore();
    }
  }
}

function fieldBase(g, pal, r, F, tint = 1) {
  const gr = g.createRadialGradient(F.cx, F.cy, 10, F.cx, F.cy, Math.max(F.w, F.h) * 0.62);
  gr.addColorStop(0, css(pal.fieldL)); gr.addColorStop(0.55, css(pal.field)); gr.addColorStop(1, css(pal.fieldD));
  g.fillStyle = gr; g.fillRect(F.x, F.y, F.w, F.h);
  ground(g, pal, r, F.x, F.y, F.w, F.h, 12.5, 0.2 * tint);
}

// ---------- кайма ----------
function ringLine(g, o, t, col) {
  g.fillStyle = css(col);
  g.beginPath(); g.rect(o, o, CW - 2 * o, CH - 2 * o); g.rect(o + t, o + t, CW - 2 * o - 2 * t, CH - 2 * o - 2 * t); g.fill('evenodd');
}
function ringFill(g, o, w, col) { ringLine(g, o, w, col); }

function ring(g, o, w, side, corner) {
  const specs = [
    [o + w, o, 0, CW - 2 * (o + w)], [CW - o, o + w, PI / 2, CH - 2 * (o + w)],
    [CW - o - w, CH - o, PI, CW - 2 * (o + w)], [o, CH - o - w, -PI / 2, CH - 2 * (o + w)],
  ];
  specs.forEach(([x, y, a, len], i) => {
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.rect(-0.3, 0, len + 0.6, w); g.clip();
    side(g, len, w, i);
    g.restore();
  });
  for (const [x, y] of [[o, o], [CW - o - w, o], [CW - o - w, CH - o - w], [o, CH - o - w]]) {
    g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, w); g.clip();
    corner(g, w);
    g.restore();
  }
}

function rep(len, per, fn) {
  const n = Math.max(1, Math.round(len / per)), s = len / n;
  for (let i = 0; i < n; i++) fn((i + 0.5) * s, s, i, n);
}

function sineVine(len, w, n, amp, phase = 0) {
  const pts = [], m = Math.ceil(len / 1.6);
  for (let i = 0; i <= m; i++) { const x = (i / m) * len; pts.push({ x, y: w / 2 + amp * Math.sin((x / len) * n * TAU + phase), a: 0 }); }
  for (let i = 0; i <= m; i++) { const p = pts[Math.max(0, i - 1)], q = pts[Math.min(m, i + 1)]; pts[i].a = Math.atan2(q.y - p.y, q.x - p.x); }
  return pts;
}

const GUARDS = [
  // зубчики
  (g, pal, len, w) => {
    rep(len, w * 0.95, (x, s, i) => {
      g.beginPath(); g.moveTo(x - s / 2, 0); g.lineTo(x + s / 2, 0); g.lineTo(x, w * 0.92); g.closePath();
      g.fillStyle = css(i % 2 ? pal.a1 : pal.ink); g.fill();
      g.beginPath(); g.moveTo(x, w); g.lineTo(x - s / 2 + s * 0.02, w * 0.1); g.lineTo(x + s / 2 - s * 0.02, w * 0.1); g.closePath();
      g.fillStyle = css(i % 2 ? pal.a2 : pal.a3, 0.0); g.fill();
      if (i % 2) { g.beginPath(); g.arc(x, w * 0.4, w * 0.12, 0, TAU); g.fillStyle = css(pal.band2); g.fill(); }
    });
  },
  // волна с точками
  (g, pal, len, w) => {
    const n = Math.max(2, Math.round(len / (w * 2.4)));
    const pts = sineVine(len, w, n, w * 0.24);
    ribbon(g, pts, 1.9, 1.9, pal.a1, pal.dark, 0.5);
    for (let i = 0; i < n * 2; i++) {
      const x = ((i + 0.5) / (n * 2)) * len, up = i % 2 ? -1 : 1;
      const y = w / 2 + up * w * 0.24 * -1;
      g.beginPath(); g.arc(x, w / 2 - up * w * 0.24 * -1 * 0 + (up > 0 ? -w * 0.3 : w * 0.3), w * 0.1, 0, TAU);
      g.fillStyle = css(i % 2 ? pal.ink : pal.a3); g.fill();
    }
  },
  // верёвка
  (g, pal, len, w) => {
    rep(len, w * 0.8, (x, s, i) => {
      g.beginPath(); g.moveTo(x - s * 0.7, w); g.lineTo(x - s * 0.1, w); g.lineTo(x + s * 0.7, 0); g.lineTo(x + s * 0.1, 0); g.closePath();
      g.fillStyle = css(i % 2 ? pal.a1 : pal.a2); g.fill();
      g.lineWidth = 0.5; g.strokeStyle = css(pal.dark, 0.6); g.stroke();
    });
  },
  // мелкие цветочки
  (g, pal, len, w) => {
    rep(len, w * 1.35, (x, s, i) => {
      const c = bloomCols(pal, i);
      bloom(g, x, w / 2, w * 0.36, 0, 5, c[0], c[1], c[2], pal.dark);
      g.beginPath(); g.arc(x + s / 2, w / 2, w * 0.08, 0, TAU); g.fillStyle = css(pal.a1); g.fill();
      leaf(g, x + s * 0.2, w / 2, 0, w * 0.2, w * 0.07, pal.a3, pal.dark, 0, false);
    });
  },
];

const MAINS = [
  // вьющаяся лоза с цветами и пальметтами
  (g, pal, len, w) => {
    const n = Math.max(3, Math.round(len / 46));
    const A = w * 0.2;
    const pts = sineVine(len, w, n, A);
    ribbon(g, pts, 2.6, 2.6, pal.a1, pal.dark, 0.6);
    for (let i = 0; i < n; i++) {
      const x1 = ((i + 0.25) / n) * len, x2 = ((i + 0.75) / n) * len, P = len / n;
      const c = bloomCols(pal, i);
      bloom(g, x1, w / 2 + A, w * 0.27, 0, 6, c[0], c[1], c[2], pal.dark);
      g.save(); g.translate(x2, w / 2 - A * 0.4); fan(g, w * 0.34, pal.a1, pal.ink, pal.a3, pal.dark, 7); g.restore();
      for (const s of [-1, 1]) {
        leaf(g, ((i + 0.5 + s * 0.05) / n) * len, w / 2, s > 0 ? -0.25 : PI + 0.25, P * 0.22, P * 0.06, i % 2 ? pal.a2 : pal.a3, pal.dark, s * 1.2);
      }
      g.beginPath(); g.arc(((i) / n) * len, w / 2, 1.8, 0, TAU); g.fillStyle = css(pal.ink); g.fill();
    }
  },
  // чередование больших цветов и ланцетных листьев
  (g, pal, len, w) => {
    rep(len, 40, (x, s, i) => {
      const c = bloomCols(pal, i);
      g.beginPath(); g.moveTo(x - s / 2, w / 2); g.lineTo(x + s / 2, w / 2); stroke(g, pal.a1, 1.6);
      bloom(g, x, w / 2, w * 0.36, i * 0.3, 8, c[0], c[1], c[2], pal.dark);
      for (const sy of [-1, 1]) {
        leaf(g, x + s * 0.5 - s * 0.32, w / 2 + sy * w * 0.34, sy * 0.0 + (sy > 0 ? -0.55 : 0.55), s * 0.46, w * 0.12, sy > 0 ? pal.a2 : pal.a3, pal.dark, sy * 2.2);
        leaf(g, x + s * 0.5 + s * 0.32, w / 2 + sy * w * 0.34, PI + (sy > 0 ? 0.55 : -0.55), s * 0.46, w * 0.12, sy > 0 ? pal.a3 : pal.a2, pal.dark, -sy * 2.2);
      }
      g.beginPath(); g.arc(x + s / 2, w / 2, w * 0.1, 0, TAU); g.fillStyle = css(pal.ink); g.fill(); stroke(g, pal.dark, 0.6);
    });
  },
  // встречные пальметты (шах-аббаси)
  (g, pal, len, w) => {
    const P = 36;
    const n = Math.max(2, Math.round(len / P)) * 2;
    const s = len / n;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * s, up = i % 2;
      g.save();
      if (up) { g.translate(x, w * 0.97); } else { g.translate(x, w * 0.03); g.scale(1, -1); }
      fan(g, w * 0.78, i % 4 < 2 ? pal.a1 : pal.ink, i % 4 < 2 ? pal.ink : pal.a1, pal.a3, pal.dark, 7);
      g.restore();
      const cx = x + s / 2;
      g.beginPath(); g.arc(cx, w / 2, w * 0.1, 0, TAU); g.fillStyle = css(i % 2 ? pal.a2 : pal.a3); g.fill(); stroke(g, pal.dark, 0.6);
      leaf(g, x + s * 0.12, up ? w * 0.3 : w * 0.7, 0, s * 0.8, w * 0.07, pal.a2, pal.dark, up ? -2 : 2, false);
    }
  },
];

function paintBorder(g, pal, rng) {
  const main = rng.int(0, MAINS.length - 1);
  const gA = rng.int(0, GUARDS.length - 1);
  let gB = rng.int(0, GUARDS.length - 1); if (gB === gA) gB = (gB + 1) % GUARDS.length;
  g.fillStyle = css(pal.band); g.fillRect(0, 0, CW, CH);
  let o = 4;
  const L = (t, col) => { ringLine(g, o, t, col); o += t; };
  const guard = (w, fnIdx) => {
    ringFill(g, o, w, pal.band2);
    ring(g, o, w, (gg, len, ww) => GUARDS[fnIdx](gg, pal, len, ww), (gg, ww) => {
      gg.fillStyle = css(pal.band2); gg.fillRect(0, 0, ww, ww);
      bloom(gg, ww / 2, ww / 2, ww * 0.42, 0, 6, pal.a1, pal.ink, pal.a3, pal.dark);
    });
    o += w;
  };
  L(2.5, pal.dark); L(1.2, pal.a1);
  guard(8.5, gA);
  L(1.4, pal.a1); L(1, pal.dark);
  const mw = 30;
  ring(g, o, mw, (gg, len, ww) => MAINS[main](gg, pal, len, ww), (gg, ww) => {
    gg.fillStyle = css(pal.dark, 0.55); gg.fillRect(0, 0, ww, ww);
    gg.beginPath(); gg.arc(ww / 2, ww / 2, ww * 0.46, 0, TAU); gg.fillStyle = css(pal.band); gg.fill(); stroke(gg, pal.a1, 1.1);
    bloom(gg, ww / 2, ww / 2, ww * 0.4, 0.2, 8, pal.a1, pal.ink, pal.a3, pal.dark);
  });
  o += mw;
  L(1, pal.dark); L(1.4, pal.a1);
  guard(8.5, gB);
  L(1.2, pal.a1); L(1.6, pal.dark);
  return o;
}

// ---------- композиции ----------
function medallionPiece(g, pal, R, ry) {
  g.save(); g.scale(1, ry / R);
  lobed(g, R * 1.1, R * 1.1, 8, 0.15); g.fillStyle = css(pal.dark, 0.38); g.fill();
  g.restore();
  // подвески
  for (const s of [-1, 1]) {
    g.save(); g.scale(1, s); g.translate(0, ry * 0.9);
    const pw = R * 0.26, ph = R * 0.62;
    g.beginPath(); g.moveTo(-pw, 0); g.bezierCurveTo(-pw, ph * 0.5, -pw * 0.25, ph * 0.55, 0, ph);
    g.bezierCurveTo(pw * 0.25, ph * 0.55, pw, ph * 0.5, pw, 0); g.closePath();
    g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.a1, 1.8);
    g.beginPath(); g.moveTo(-pw * 0.5, 0); g.bezierCurveTo(-pw * 0.5, ph * 0.35, -pw * 0.1, ph * 0.4, 0, ph * 0.72);
    g.bezierCurveTo(pw * 0.1, ph * 0.4, pw * 0.5, ph * 0.35, pw * 0.5, 0); g.closePath();
    g.fillStyle = css(pal.a1); g.fill(); stroke(g, pal.dark, 0.8);
    g.beginPath(); g.arc(0, ph * 0.22, pw * 0.2, 0, TAU); g.fillStyle = css(pal.a3); g.fill();
    g.restore();
  }
  const k = ry / R;
  g.save(); g.scale(1, k);
  lobed(g, R, R, 8, 0.13); g.fillStyle = css(pal.a2); g.fill(); stroke(g, pal.a1, 2.2);
  lobed(g, R * 0.86, R * 0.86, 8, 0.1, 0.0); g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.dark, 0.9);
  // гирлянда
  const nb = 16;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * TAU, rr = R * 0.73;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    leaf(g, x, y, a + PI / 2 + 0.2, R * 0.12, R * 0.04, pal.a2, pal.dark, 0, false);
    leaf(g, x, y, a - PI / 2 - 0.2, R * 0.12, R * 0.04, pal.a2, pal.dark, 0, false);
  }
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * TAU, rr = R * 0.73;
    const c = bloomCols(pal, i);
    bloom(g, Math.cos(a) * rr, Math.sin(a) * rr, R * 0.075, a, 5, c[0], c[1], c[2], pal.dark);
  }
  lobed(g, R * 0.6, R * 0.6, 8, 0.1, 0.5); g.fillStyle = css(pal.fieldD); g.fill(); stroke(g, pal.a1, 1.4);
  g.restore();
  // внутренняя розетка
  g.save(); g.scale(1, k);
  for (let i = 0; i < 8; i++) {
    g.save(); g.rotate((i * TAU) / 8); g.translate(0, -R * 0.2);
    leaf(g, 0, 0, -PI / 2, R * 0.34, R * 0.09, i % 2 ? pal.a1 : pal.ink, pal.dark, 0);
    g.restore();
  }
  bloom(g, 0, 0, R * 0.36, 0.2, 12, pal.a3, pal.a1, pal.ink, pal.dark);
  bloom(g, 0, 0, R * 0.2, 0, 8, pal.ink, pal.a2, pal.a1, pal.dark);
  g.restore();
}

function cornerPiece(g, pal, x, y, R) {
  g.save(); g.translate(x, y);
  lobed(g, R * 1.08, R * 1.08, 6, 0.14); g.fillStyle = css(pal.dark, 0.35); g.fill();
  lobed(g, R, R, 6, 0.14); g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.a1, 1.8);
  lobed(g, R * 0.72, R * 0.72, 6, 0.1, 0.3); g.fillStyle = css(pal.a2); g.fill(); stroke(g, pal.ink, 0.9, 0.8);
  lobed(g, R * 0.5, R * 0.5, 6, 0.08); g.fillStyle = css(pal.fieldD); g.fill(); stroke(g, pal.a1, 1);
  bloom(g, 0, 0, R * 0.34, 0.1, 8, pal.a1, pal.ink, pal.a3, pal.dark);
  g.restore();
}

function compMedallion(g, pal, rng, F) {
  fieldBase(g, pal, rng.fork('g'), F);
  const R = rng.range(62, 70), ry = R * 1.4;
  const hw = F.w / 2, hh = F.h / 2, seed = rng.s;
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    g.save(); g.translate(F.cx, F.cy); g.scale(sx, sy);
    const r = new RNG(seed);
    grow(g, r, pal, R * 0.5, ry * 0.45, r.range(0.1, 0.5), 190, 2, 1.15, { sgn: 1, end: 'bloom' });
    grow(g, r, pal, R * 0.3, ry * 0.8, r.range(1.0, 1.5), 170, 2, 1.1, { sgn: -1, end: 'fan' });
    grow(g, r, pal, R * 0.6, ry * 0.7, r.range(0.5, 0.9), 150, 1, 1.0, { sgn: 1, end: 'bloom' });
    grow(g, r, pal, R * 0.85, 4, r.range(-0.3, 0.1), 110, 2, 1.0, { sgn: 1 });
    grow(g, r, pal, hw - 14, hh - 74, -PI / 2 - 0.4, 80, 1, 0.9, { sgn: -1, end: 'volute' });
    g.restore();
  }
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    g.save(); g.translate(F.cx, F.cy); g.scale(sx, sy);
    cornerPiece(g, pal, hw - 4, hh - 4, 50);
    // боковые полумедальоны
    g.save(); g.translate(0, hh - 1); lobed(g, 40, 24, 6, 0.14); g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.a1, 1.5);
    bloom(g, 0, 0, 14, 0, 8, pal.a1, pal.ink, pal.a3, pal.dark); g.restore();
    g.save(); g.translate(hw - 2, 0); lobed(g, 22, 34, 6, 0.14); g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.a1, 1.5);
    bloom(g, 0, 0, 13, 0, 8, pal.a1, pal.ink, pal.a3, pal.dark); g.restore();
    g.restore();
  }
  g.save(); g.translate(F.cx, F.cy); medallionPiece(g, pal, R, ry); g.restore();
}

function compHerati(g, pal, rng, F) {
  fieldBase(g, pal, rng.fork('g'), F, 0.7);
  const nc = rng.pick([3, 4]);
  const cw = F.w / (nc - 0.0) * (nc === 3 ? 0.95 : 1);
  const ch = cw * rng.range(1.25, 1.5);
  const r = rng.fork('h');
  const diam = (cx, cy, kind, i, j) => {
    // ромб с выгнутыми сторонами
    const hx = cw / 2, hy = ch / 2, b = cw * 0.1;
    g.beginPath();
    g.moveTo(cx - hx, cy);
    g.quadraticCurveTo(cx - hx / 2 + b, cy - hy / 2 + b * 0.5 * 0 - b, cx, cy - hy);
    g.quadraticCurveTo(cx + hx / 2 - b, cy - hy / 2 - b, cx + hx, cy);
    g.quadraticCurveTo(cx + hx / 2 - b, cy + hy / 2 + b, cx, cy + hy);
    g.quadraticCurveTo(cx - hx / 2 + b, cy + hy / 2 + b, cx - hx, cy);
    g.closePath();
    g.fillStyle = css(kind ? pal.fieldD : pal.band, kind ? 0.5 : 0.78); g.fill();
    stroke(g, pal.a1, 1.4);
  };
  const rangeI = Math.ceil(F.w / cw) + 1, rangeJ = Math.ceil(F.h / ch) + 1;
  const items = [];
  for (let j = -rangeJ; j <= rangeJ; j++) for (let i = -rangeI; i <= rangeI; i++) {
    for (const kind of [0, 1]) {
      const cx = F.cx + i * cw + (kind ? cw / 2 : 0), cy = F.cy + j * ch + (kind ? ch / 2 : 0);
      if (cx < F.x - cw * 0.5 || cx > F.x + F.w + cw * 0.5 || cy < F.y - ch * 0.5 || cy > F.y + F.h + ch * 0.5) continue;
      items.push([cx, cy, kind, i, j]);
    }
  }
  for (const [cx, cy, kind, i, j] of items) if (!kind) diam(cx, cy, 0, i, j);
  // листья «саз» внутри промежуточных ромбов
  for (const [cx, cy, kind, i, j] of items) {
    if (!kind) continue;
    const col = (i + j) % 2 ? [pal.a2, pal.a3] : [pal.a3, pal.a2];
    leaf(g, cx, cy, 0, cw * 0.36, cw * 0.07, col[0], pal.dark, 3);
    leaf(g, cx, cy, PI, cw * 0.36, cw * 0.07, col[0], pal.dark, -3);
    leaf(g, cx, cy, -PI / 2, ch * 0.34, cw * 0.07, col[1], pal.dark, 3);
    leaf(g, cx, cy, PI / 2, ch * 0.34, cw * 0.07, col[1], pal.dark, -3);
    const c = bloomCols(pal, i + j);
    bloom(g, cx, cy, cw * 0.1, 0, 6, c[0], c[1], c[2], pal.dark);
  }
  for (const [cx, cy, kind, i, j] of items) {
    if (kind) continue;
    // розетка
    const c = bloomCols(pal, i + j + 1);
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2 + PI / 4;
      leaf(g, cx + Math.cos(a) * cw * 0.1, cy + Math.sin(a) * cw * 0.1 * (ch / cw), a, cw * 0.17, cw * 0.04, pal.a1, pal.dark, 1, false);
    }
    bloom(g, cx, cy, cw * 0.27, 0.2, 10, c[0], c[1], c[2], pal.dark);
    bloom(g, cx, cy, cw * 0.14, 0, 6, c[2], c[1], c[0], pal.dark);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const mx = cx + sx * cw * 0.3, my = cy + sy * ch * 0.3;
      bloom(g, mx, my, cw * 0.065, 0, 5, pal.a1, pal.ink, pal.a3, pal.dark);
    }
    // вершины ромба
    for (const [dx, dy] of [[cw / 2, 0], [-cw / 2, 0], [0, ch / 2], [0, -ch / 2]]) {
      const px = cx + dx, py = cy + dy;
      g.beginPath(); g.arc(px, py, cw * 0.045, 0, TAU); g.fillStyle = css(pal.ink); g.fill(); stroke(g, pal.dark, 0.6);
    }
  }
}

function compShah(g, pal, rng, F) {
  fieldBase(g, pal, rng.fork('g'), F);
  const S = (F.h / 2 - 30) / 2, X = F.w * 0.3, hw = F.w / 2;
  const seed = rng.s;
  const half = () => {
    const r = new RNG(seed);
    // широкие вьющиеся стебли-арабески между цветами
    for (let k = -2; k < 2; k++) {
      const y0 = k * S;
      const P = [[0, y0], [X * 0.5, y0 + S * 0.12], [X * 1.02, y0 + S * 0.5], [X * 0.5, y0 + S * 0.88], [0, y0 + S]];
      const pts = spline(P);
      const flip = k % 2 ? 1 : -1;
      ribbon(g, pts, 4.6, 4.6, pal.a1, pal.dark, 0.65);
      along(pts, 20, 6, (p, i) => {
        const s = i % 2 ? 1 : -1;
        leaf(g, p.x, p.y, p.a + s * 0.95, 15, 5.2, i % 4 < 2 ? pal.a2 : pal.a3, pal.dark, s * 3);
      });
      for (const t of [0.28, 0.72]) {
        const p = pts[Math.floor(pts.length * t)];
        g.save(); g.translate(p.x, p.y); g.rotate(p.a + (t < 0.5 ? -1 : 1) * (PI / 2) * flip);
        fan(g, 30, pal.a1, pal.ink, pal.a3, pal.dark, 9); g.restore();
      }
      // завитки наружу, к краям поля
      const m = pts[Math.floor(pts.length * 0.5)];
      grow(g, r, pal, m.x, m.y, flip > 0 ? -0.5 : 0.5, 70, 1, 1.0, { sgn: flip, end: 'volute', kk: 0.8 });
      grow(g, r, pal, m.x, m.y, flip > 0 ? 0.5 : -0.5, 60, 1, 0.9, { sgn: -flip, end: 'bloom', kk: 0.8 });
    }
    // краевые лозы
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      grow(g, r, pal, hw - 8, k * S * 0.9 + S * 0.35, -PI / 2, 70, 1, 0.85, { sgn: k > 0 ? 1 : -1, end: 'fan', kk: 0.8 });
    }
    for (let k = -2; k <= 2; k++) {
      const yy = k * S;
      leaf(g, 0, yy, -0.95, 36, 7.5, pal.a2, pal.dark, 5);
      leaf(g, 0, yy, 0.95, 36, 7.5, pal.a3, pal.dark, -5);
      bloom(g, 0, yy, 27, k * 0.1, 12, pal.a1, pal.ink, pal.a3, pal.dark);
      bloom(g, 0, yy, 18, 0, 10, pal.a3, pal.a1, pal.ink, pal.dark);
      bloom(g, 0, yy, 9, 0, 8, pal.ink, pal.a2, pal.a1, pal.dark);
    }
    for (let k = -2; k < 2; k++) {
      const yy = (k + 0.5) * S;
      grow(g, r, pal, X + 14, yy, -0.25 + (k % 2) * 0.5, 62, 1, 0.95, { sgn: k % 2 ? 1 : -1, end: 'volute', kk: 0.8 });
      g.save(); g.translate(X + 18, yy); g.rotate(PI / 2); fan(g, 26, pal.a1, pal.ink, pal.a3, pal.dark, 7); g.restore();
      leaf(g, 0, yy, -0.6, 22, 5, pal.a2, pal.dark, 3); leaf(g, 0, yy, PI + 0.6, 22, 5, pal.a3, pal.dark, -3);
      bloom(g, 0, yy, 9, 0, 6, pal.a1, pal.ink, pal.a3, pal.dark);
      g.save(); g.translate(X, yy);
      for (let q = 0; q < 6; q++) leaf(g, 0, 0, (q * TAU) / 6 + 0.3, 32, 6.5, q % 2 ? pal.a2 : pal.a3, pal.dark, 3);
      g.restore();
      bloom(g, X, yy, 21, 0.2, 10, pal.ink, pal.a1, pal.a3, pal.dark);
      bloom(g, X, yy, 12, 0, 8, pal.a3, pal.a2, pal.ink, pal.dark);
      bloom(g, X, yy, 5.5, 0, 6, pal.a1, pal.ink, pal.a3, pal.dark);
    }
  };
  g.save(); g.translate(F.cx, F.cy); half(); g.restore();
  g.save(); g.translate(F.cx, F.cy); g.scale(-1, 1); half(); g.restore();
}

function cypress(g, pal, x, y, h, w, col) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(w * 1.5, -h * 0.02, w * 1.2, -h * 0.65, w * 0.12, -h * 0.9);
  g.bezierCurveTo(w * 0.15, -h * 1.0, w * 0.05, -h * 1.04, -w * 0.3, -h * 1.0);
  g.bezierCurveTo(-w * 0.9, -h * 0.7, -w * 1.5, -h * 0.02, 0, 0);
  g.closePath();
  g.fillStyle = css(col); g.fill(); stroke(g, pal.dark, 0.9);
  g.save(); g.clip();
  g.strokeStyle = css(pal.dark, 0.5); g.lineWidth = 0.8;
  for (let i = 0; i < 9; i++) {
    const yy = -h * (0.06 + i * 0.1);
    for (let j = -2; j <= 2; j++) {
      const xx = j * w * 0.7 + (i % 2) * w * 0.35;
      g.beginPath(); g.arc(xx, yy, w * 0.35, 0.15, PI - 0.15); g.stroke();
    }
  }
  g.beginPath(); g.moveTo(-w * 0.35, -h * 0.05); g.quadraticCurveTo(-w * 0.1, -h * 0.5, -w * 0.15, -h * 0.9);
  stroke(g, pal.ink, 1.6, 0.4);
  g.restore();
  g.beginPath(); g.ellipse(0, 2, w * 1.5, 3.5, 0, 0, TAU); g.fillStyle = css(pal.dark, 0.5); g.fill();
  g.restore();
}

function compGarden(g, pal, rng, F) {
  const ch = 15;
  const hw = F.w / 2, hh = F.h / 2;
  const gar = [[F.x, F.y], [F.cx + ch / 2, F.y], [F.x, F.cy + ch / 2], [F.cx + ch / 2, F.cy + ch / 2]];
  const gw = hw - ch / 2, gh = hh - ch / 2;
  const seed = rng.s;
  const treeCols = [pal.a2, pal.a3];
  gar.forEach(([x, y], gi) => {
    g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, gw, gh); g.clip();
    const gr = g.createRadialGradient(gw / 2, gh * 0.5, 6, gw / 2, gh * 0.5, gh * 0.75);
    gr.addColorStop(0, css(gi % 3 === 0 ? pal.fieldL : pal.field)); gr.addColorStop(1, css(pal.fieldD));
    g.fillStyle = gr; g.fillRect(0, 0, gw, gh);
    ground(g, pal, new RNG(seed + 11 + gi), 0, 0, gw, gh, 12, 0.22);
    // узкая клумба-кайма
    const r = new RNG(seed);
    for (let k = 0; k < 4; k++) {
      const bx = gw * (0.16 + k * 0.226), c = bloomCols(pal, k + gi);
      leaf(g, bx, gh - 6, -PI / 2 - 0.5, 15, 4.5, pal.a2, pal.dark, 2, false);
      leaf(g, bx, gh - 6, -PI / 2 + 0.5, 15, 4.5, pal.a3, pal.dark, -2, false);
      bloom(g, bx, gh - 22, 7, 0, 6, c[0], c[1], c[2], pal.dark);
    }
    // кипарисы
    cypress(g, pal, gw * 0.15, gh * 0.84, gh * 0.5, 9.5, treeCols[gi % 2]);
    cypress(g, pal, gw * 0.85, gh * 0.84, gh * 0.5, 9.5, treeCols[gi % 2]);
    // цветущее дерево по центру
    for (const sx of [-1, 1]) {
      g.save(); g.translate(gw / 2, 0); g.scale(sx, 1);
      const rr = new RNG(seed + 5 + gi);
      grow(g, rr, pal, 0, gh * 0.86, -PI / 2 + 0.18, gh * 0.8, 2, 1.05, { sgn: -1, end: 'bloom', kk: 0.55, bi: gi });
      grow(g, rr, pal, 0, gh * 0.86, -PI / 2 + 0.6, gh * 0.3, 1, 0.85, { sgn: 1, end: 'fan', kk: 0.7 });
      g.restore();
    }
    g.beginPath(); g.ellipse(gw / 2, gh * 0.87, 14, 4.5, 0, 0, TAU); g.fillStyle = css(pal.dark, 0.45); g.fill();
    // рамка сада
    g.beginPath(); g.rect(2, 2, gw - 4, gh - 4); stroke(g, pal.a1, 1.5);
    g.beginPath(); g.rect(4.8, 4.8, gw - 9.6, gh - 9.6); stroke(g, pal.dark, 0.8, 0.6);
    g.restore();
  });
  // каналы
  const water = mix(pal.a2, pal.dark, 0.1);
  const chan = (x, y, w, h, vert) => {
    g.fillStyle = css(water); g.fillRect(x, y, w, h);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.strokeStyle = css(lighten(water, 0.4), 0.7); g.lineWidth = 0.9;
    const L = vert ? h : w;
    for (let t = 6; t < L; t += 11) {
      for (const off of [0.28, 0.72]) {
        g.beginPath();
        const px = vert ? x + w * off : x + t, py = vert ? y + t : y + h * off;
        if (vert) { g.moveTo(px - 3, py); g.quadraticCurveTo(px, py - 3, px + 3, py); } else { g.moveTo(px, py - 3); g.quadraticCurveTo(px + 3, py, px, py + 3); }
        g.stroke();
      }
    }
    g.restore();
    g.strokeStyle = css(pal.a1); g.lineWidth = 1.5;
    if (vert) { g.strokeRect(x - 0.5, y, w + 1, h); } else { g.strokeRect(x, y - 0.5, w, h + 1); }
  };
  chan(F.cx - ch / 2, F.y, ch, F.h, true);
  chan(F.x, F.cy - ch / 2, F.w, ch, false);
  g.save(); g.translate(F.cx, F.cy);
  lobed(g, 40, 40, 8, 0.14); g.fillStyle = css(pal.dark, 0.5); g.fill();
  lobed(g, 36, 36, 8, 0.14); g.fillStyle = css(pal.band); g.fill(); stroke(g, pal.a1, 2);
  lobed(g, 27, 27, 8, 0.1, 0.4); g.fillStyle = css(water); g.fill(); stroke(g, pal.ink, 0.9, 0.8);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 0, 8 + i * 5, 0.4 + i, 1.8 + i); stroke(g, lighten(water, 0.5), 0.8, 0.7); }
  bloom(g, 0, 0, 14, 0.2, 8, pal.a1, pal.ink, pal.a3, pal.dark);
  g.restore();
}

function compMihrab(g, pal, rng, F) {
  const cx = F.cx, seed = rng.s;
  fieldBase(g, pal, rng.fork('g'), F, 0.9);
  g.fillStyle = css(pal.dark, pal.field[0] + pal.field[1] + pal.field[2] > 520 ? 0.14 : 0.3); g.fillRect(F.x, F.y, F.w, F.h);
  const nw = F.w * 0.34, apex = F.y + 70, shoulder = F.y + 176, bottom = F.y + F.h - 54;
  const arch = () => {
    g.beginPath(); g.moveTo(cx - nw, bottom); g.lineTo(cx - nw, shoulder);
    g.bezierCurveTo(cx - nw, shoulder - 60, cx - 16, apex + 36, cx, apex);
    g.bezierCurveTo(cx + 16, apex + 36, cx + nw, shoulder - 60, cx + nw, shoulder);
    g.lineTo(cx + nw, bottom); g.closePath();
  };
  // арабески в углах (за аркой)
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx, 0); g.scale(sx, 1);
    const r = new RNG(seed);
    grow(g, r, pal, nw * 0.7, shoulder - 24, -PI / 2 + 0.3, 90, 2, 0.95, { sgn: 1, end: 'bloom' });
    grow(g, r, pal, nw + 8, shoulder + 40, -PI / 2 - 0.2, 70, 1, 0.85, { sgn: -1, end: 'fan' });
    grow(g, r, pal, nw + 4, bottom - 20, -PI / 2, 80, 1, 0.8, { sgn: 1, end: 'volute' });
    g.restore();
  }
  // ниша
  arch(); g.fillStyle = css(pal.dark, 0.4); g.save(); g.translate(2, 3); g.fill(); g.restore();
  arch(); g.lineWidth = 11; g.strokeStyle = css(pal.band); g.stroke();
  arch(); g.lineWidth = 11; g.strokeStyle = css(pal.a1); g.lineWidth = 12.5; g.stroke();
  arch(); g.lineWidth = 9.5; g.strokeStyle = css(pal.band); g.stroke();
  arch();
  const gr = g.createLinearGradient(0, apex, 0, bottom);
  gr.addColorStop(0, css(pal.field)); gr.addColorStop(0.55, css(pal.fieldL)); gr.addColorStop(1, css(pal.field));
  g.fillStyle = gr; g.fill();
  g.save(); arch(); g.clip();
  ground(g, pal, new RNG(seed + 3), cx - nw, apex, nw * 2, bottom - apex, 12.5, 0.2);
  // дерево жизни
  for (const sx of [-1, 1]) {
    g.save(); g.translate(cx, 0); g.scale(sx, 1);
    const r = new RNG(seed + 5);
    grow(g, r, pal, 0, bottom - 18, -PI / 2 + 0.3, 260, 2, 1.35, { sgn: -1, end: 'bloom', kk: 0.8 });
    grow(g, r, pal, 0, bottom - 18, -PI / 2 + 0.8, 130, 1, 1.15, { sgn: 1, end: 'fan', kk: 0.8 });
    grow(g, r, pal, 0, bottom - 18, -PI / 2 + 0.05, 150, 1, 1.15, { sgn: 1, end: 'bloom', kk: 0.6 });
    g.restore();
  }
  // лампа
  g.beginPath(); g.moveTo(cx, apex + 4); g.lineTo(cx, apex + 38); stroke(g, pal.a1, 1.4);
  g.save(); g.translate(cx, apex + 38);
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(14, 6, 12, 24, 0, 36); g.bezierCurveTo(-12, 24, -14, 6, 0, 0); g.closePath();
  g.fillStyle = css(pal.a1); g.fill(); stroke(g, pal.dark, 0.9);
  g.beginPath(); g.arc(0, 15, 4, 0, TAU); g.fillStyle = css(pal.a3); g.fill();
  g.beginPath(); g.moveTo(0, 36); g.lineTo(0, 44); g.arc(0, 46, 2.2, 0, TAU); g.fillStyle = css(pal.a1); g.fill();
  g.restore();
  g.restore();
  // колонны
  for (const sx of [-1, 1]) {
    const x = cx + sx * (nw + 14);
    g.fillStyle = css(pal.a2); g.fillRect(x - 4, shoulder - 30, 8, bottom - shoulder + 30);
    stroke(g, pal.dark, 0.8); g.strokeRect(x - 4, shoulder - 30, 8, bottom - shoulder + 30);
    bloom(g, x, shoulder - 34, 8, 0, 6, pal.a1, pal.ink, pal.a3, pal.dark);
    bloom(g, x, bottom + 4, 8, 0, 6, pal.a1, pal.ink, pal.a3, pal.dark);
  }
  // основание
  g.fillStyle = css(pal.band); g.fillRect(F.x, bottom + 14, F.w, F.y + F.h - bottom - 14);
  g.beginPath(); g.moveTo(F.x, bottom + 14); g.lineTo(F.x + F.w, bottom + 14); stroke(g, pal.a1, 2);
  const by = bottom + 14 + (F.y + F.h - bottom - 14) / 2;
  rep(F.w, 30, (x, s, i) => {
    const c = bloomCols(pal, i);
    bloom(g, F.x + x, by, 10, i * 0.2, 8, c[0], c[1], c[2], pal.dark);
  });
  // верхняя панель
  g.fillStyle = css(pal.band); g.fillRect(F.x, F.y, F.w, 26);
  g.beginPath(); g.moveTo(F.x, F.y + 26); g.lineTo(F.x + F.w, F.y + 26); stroke(g, pal.a1, 2);
  rep(F.w, 22, (x, s, i) => {
    const c = bloomCols(pal, i);
    bloom(g, F.x + x, F.y + 13, 7, 0, 6, c[0], c[1], c[2], pal.dark);
  });
}

const COMPS = [compMedallion, compHerati, compShah, compGarden, compMihrab];

export default {
  id: 'persian',
  name: 'Персидский',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = paintBorder(g, pal, rng);
    const F = { x: inset, y: inset, w: CW - 2 * inset, h: CH - 2 * inset };
    F.cx = F.x + F.w / 2; F.cy = F.y + F.h / 2;
    g.fillStyle = css(pal.field); g.fillRect(F.x, F.y, F.w, F.h);
    g.save(); g.beginPath(); g.rect(F.x, F.y, F.w, F.h); g.clip();
    const comp = rng.int(0, COMPS.length - 1);
    COMPS[comp](g, pal, rng.fork('comp'), F);
    g.restore();
    return { edge: pal.edge, fringe: [240, 232, 212] };
  },
};
