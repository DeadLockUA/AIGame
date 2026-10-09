// Резиновые уточки: бело-голубые волны, пузырьки пены, кайма из уточек и пузырьков.
import { CW, CH, css, mix, darken, lighten, pickPalette } from '../kit.js';

const TAU = Math.PI * 2;
const FOAM = [250, 253, 255];

const PALS = [
  { water: [104, 176, 232], water2: [64, 132, 208], deep: [28, 72, 140], duck: [255, 208, 42], duck2: [255, 172, 22], beak: [255, 124, 32], accent: [255, 226, 96], hat: [236, 70, 96], edge: [24, 60, 120] },
  { water: [96, 208, 216], water2: [44, 164, 186], deep: [14, 90, 116], duck: [255, 214, 52], duck2: [255, 178, 28], beak: [255, 118, 40], accent: [255, 232, 110], hat: [255, 110, 90], edge: [10, 72, 94] },
  { water: [70, 112, 200], water2: [42, 76, 166], deep: [20, 36, 96], duck: [255, 204, 36], duck2: [250, 164, 18], beak: [255, 130, 30], accent: [255, 222, 90], hat: [120, 220, 200], edge: [16, 30, 78] },
  { water: [160, 178, 240], water2: [112, 132, 222], deep: [60, 66, 154], duck: [255, 210, 48], duck2: [255, 172, 26], beak: [255, 120, 36], accent: [255, 230, 110], hat: [240, 90, 150], edge: [44, 48, 118] },
  { water: [134, 218, 200], water2: [80, 184, 182], deep: [22, 108, 112], duck: [255, 212, 46], duck2: [255, 174, 24], beak: [255, 126, 34], accent: [255, 232, 100], hat: [226, 72, 100], edge: [14, 84, 88] },
  { water: [120, 190, 244], water2: [76, 146, 226], deep: [40, 90, 170], duck: [255, 220, 70], duck2: [255, 182, 38], beak: [255, 136, 44], accent: [255, 236, 130], hat: [130, 90, 200], edge: [30, 70, 140] },
];

function bubble(g, x, y, r, a = 1) {
  g.beginPath(); g.arc(x, y, r, 0, TAU);
  g.fillStyle = css(FOAM, 0.3 * a); g.fill();
  g.lineWidth = Math.max(0.7, r * 0.15); g.strokeStyle = css(FOAM, 0.95 * a); g.stroke();
  g.beginPath(); g.arc(x - r * 0.34, y - r * 0.34, Math.max(0.6, r * 0.27), 0, TAU);
  g.fillStyle = css(FOAM, 0.95 * a); g.fill();
}

function bubbleGroup(g, x, y, k) {
  bubble(g, x, y, 5.2 * k); bubble(g, x + 6 * k, y - 4.5 * k, 3.4 * k); bubble(g, x - 5 * k, y - 6 * k, 2.6 * k);
}

/** Резиновая уточка в профиле, смотрит вправо при dir=1. s — масштаб (тело ~2s шириной). */
function duck(g, pal, x, y, s, dir, acc = null, rot = 0, ripple = true) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * dir, s);
  if (ripple) {
    for (const [k, a] of [[1.55, 0.9], [1.95, 0.5]]) {
      g.beginPath(); g.ellipse(0, 0.66, k, k * 0.2, 0, 0, TAU);
      g.lineWidth = 0.07; g.strokeStyle = css(FOAM, a); g.stroke();
    }
    g.beginPath(); g.ellipse(0, 0.66, 1.3, 0.16, 0, 0, TAU);
    g.fillStyle = css(FOAM, 0.4); g.fill();
  }
  const line = darken(pal.duck2, 0.5);
  const body = () => { g.beginPath(); g.ellipse(0, 0, 1, 0.72, 0, 0, TAU); };
  const tail = () => {
    g.beginPath(); g.moveTo(-0.7, -0.5);
    g.quadraticCurveTo(-1.15, -0.45, -1.4, -1.0);
    g.quadraticCurveTo(-0.9, -0.95, -0.4, -0.75); g.closePath();
  };
  const head = () => { g.beginPath(); g.arc(0.6, -0.82, 0.47, 0, TAU); };
  // контур, затем заливка
  g.lineJoin = 'round'; g.lineWidth = 0.12; g.strokeStyle = css(line);
  body(); g.stroke(); tail(); g.stroke(); head(); g.stroke();
  const gr = g.createLinearGradient(0, -0.72, 0, 0.72);
  gr.addColorStop(0, css(lighten(pal.duck, 0.25))); gr.addColorStop(0.55, css(pal.duck)); gr.addColorStop(1, css(pal.duck2));
  body(); g.fillStyle = gr; g.fill();
  tail(); g.fillStyle = css(pal.duck); g.fill();
  head(); g.fillStyle = css(lighten(pal.duck, 0.1)); g.fill();
  // блик на голове и теле
  g.lineCap = 'round'; g.strokeStyle = css(FOAM, 0.8); g.lineWidth = 0.07;
  g.beginPath(); g.arc(0.6, -0.82, 0.34, Math.PI * 1.15, Math.PI * 1.5); g.stroke();
  g.beginPath(); g.arc(0, 0, 0.82, Math.PI * 1.1, Math.PI * 1.3); g.stroke();
  // клюв
  g.beginPath(); g.moveTo(0.98, -0.94);
  g.quadraticCurveTo(1.5, -1.0, 1.58, -0.8);
  g.quadraticCurveTo(1.42, -0.6, 0.98, -0.68); g.closePath();
  g.fillStyle = css(pal.beak); g.fill(); g.lineWidth = 0.06; g.strokeStyle = css(darken(pal.beak, 0.45)); g.stroke();
  g.beginPath(); g.moveTo(1.02, -0.79); g.quadraticCurveTo(1.3, -0.78, 1.5, -0.78);
  g.lineWidth = 0.035; g.stroke();
  // щека и глаз
  g.beginPath(); g.arc(0.74, -0.68, 0.1, 0, TAU); g.fillStyle = 'rgba(255,110,120,0.45)'; g.fill();
  g.beginPath(); g.arc(0.78, -0.96, 0.078, 0, TAU); g.fillStyle = '#2a1a14'; g.fill();
  g.beginPath(); g.arc(0.8, -0.99, 0.028, 0, TAU); g.fillStyle = '#fff'; g.fill();
  // крыло
  g.beginPath(); g.ellipse(-0.14, 0.04, 0.58, 0.34, -0.28, 0, TAU);
  g.fillStyle = css(pal.duck2); g.fill(); g.lineWidth = 0.06; g.strokeStyle = css(line); g.stroke();
  g.beginPath(); g.arc(-0.2, 0.0, 0.3, 0.3, 1.5); g.lineWidth = 0.04; g.stroke();
  if (acc === 'hat') {
    g.beginPath(); g.moveTo(0.36, -1.22); g.lineTo(0.84, -1.27); g.lineTo(0.62, -1.95); g.closePath();
    g.fillStyle = css(pal.hat); g.fill(); g.lineWidth = 0.05; g.strokeStyle = css(darken(pal.hat, 0.4)); g.stroke();
    g.beginPath(); g.moveTo(0.46, -1.5); g.lineTo(0.76, -1.53); g.lineWidth = 0.07; g.strokeStyle = css(FOAM); g.stroke();
    g.beginPath(); g.arc(0.62, -1.97, 0.09, 0, TAU); g.fillStyle = css(FOAM); g.fill();
  } else if (acc === 'bow') {
    g.fillStyle = css(pal.hat); g.strokeStyle = css(darken(pal.hat, 0.4)); g.lineWidth = 0.05;
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(0.22, -0.42); g.lineTo(0.22 + sx * 0.3, -0.62); g.lineTo(0.22 + sx * 0.3, -0.22); g.closePath(); g.fill(); g.stroke();
    }
    g.beginPath(); g.arc(0.22, -0.42, 0.075, 0, TAU); g.fill(); g.stroke();
  } else if (acc === 'glasses') {
    g.beginPath(); g.arc(0.8, -0.95, 0.19, 0, TAU); g.fillStyle = '#1c2438'; g.fill();
    g.lineWidth = 0.05; g.strokeStyle = css(FOAM); g.stroke();
    g.beginPath(); g.moveTo(0.62, -0.97); g.lineTo(0.3, -0.98); g.stroke();
    g.beginPath(); g.arc(0.85, -1.0, 0.05, 0, TAU); g.fillStyle = css(FOAM); g.fill();
  }
  g.restore();
}

function lifebuoy(g, pal, x, y, r) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.arc(0, 0, r + 3, 0, TAU); g.fillStyle = css(pal.deep, 0.3); g.fill();
  for (let i = 0; i < 4; i++) {
    g.beginPath(); g.arc(0, 0, r, i * Math.PI / 2, (i + 1) * Math.PI / 2); g.arc(0, 0, r * 0.52, (i + 1) * Math.PI / 2, i * Math.PI / 2, true); g.closePath();
    g.fillStyle = i % 2 ? css(FOAM) : '#e8454f'; g.fill();
  }
  g.lineWidth = 1.4; g.strokeStyle = css(darken(pal.deep, 0.2));
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.52, 0, TAU); g.stroke();
  g.restore();
}

function waves(g, pal, fx, fy, fw, fh, R) {
  g.fillStyle = css(pal.water2); g.fillRect(fx, fy, fw, fh);
  const rows = Math.ceil(fh / (R * 0.5)) + 3;
  const cols = Math.ceil(fw / (R * 2)) + 2;
  for (let r = 0; r < rows; r++) {
    const y = fy - R * 0.4 + r * R * 0.5;
    const base = mix(pal.water, pal.water2, (r % 4) / 5);
    for (let c = -1; c < cols; c++) {
      const x = fx + c * R * 2 + (r % 2) * R;
      g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = css(base); g.fill();
      g.lineWidth = 1.4; g.strokeStyle = css(FOAM, 0.9); g.stroke();
      for (const k of [0.74, 0.48]) {
        g.beginPath(); g.arc(x, y, R * k, 0, TAU);
        g.fillStyle = css(k > 0.6 ? lighten(base, 0.22) : lighten(base, 0.4)); g.fill();
        g.lineWidth = 1.2; g.strokeStyle = css(FOAM, 0.85); g.stroke();
      }
      g.beginPath(); g.arc(x, y, R * 0.2, 0, TAU); g.fillStyle = css(FOAM, 0.9); g.fill();
    }
  }
}

function border(g, pal) {
  g.fillStyle = css(pal.deep); g.fillRect(0, 0, CW, CH);
  // фактура: мелкие точки-пузырьки
  g.fillStyle = css(FOAM, 0.1);
  for (let y = 8; y < CH; y += 9) for (let x = 8 + ((y / 9) % 2) * 4.5; x < CW; x += 9) {
    if (x < 46 || x > CW - 46 || y < 46 || y > CH - 46) { g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
  }
  const line = (o, w, c, a = 1) => { g.strokeStyle = css(c, a); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); };
  line(9, 2, pal.accent); line(12.5, 1, FOAM, 0.8); line(39.5, 1, FOAM, 0.8); line(43, 2, pal.accent);
  const c0 = 26, W = CW - 2 * c0, H = CH - 2 * c0, per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [c0 + t, c0, 0, 1, 0];
    t -= W; if (t < H) return [c0 + W, c0 + t, -1, 0, 1];
    t -= H; if (t < W) return [c0 + W - t, c0 + H, 0, -1, 2];
    t -= W; return [c0, c0 + H - t, 1, 0, 3];
  };
  // волнистая линия
  const N = 600;
  g.strokeStyle = css(FOAM, 0.9); g.lineWidth = 1.8; g.lineJoin = 'round'; g.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * per, [x, y, nx, ny] = pt(t);
    const off = Math.sin((t / 29) * TAU) * 5;
    const px = x + nx * off, py = y + ny * off;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.stroke();
  // предметы по сторонам
  const sides = [[W, 0, 0], [H, W, 1], [W, W + H, 2], [H, 2 * W + H, 3]];
  let k = 0;
  for (const [len, off0, side] of sides) {
    const m = 24, n = 2 * Math.round((len - 2 * m) / 66) + 1, step = (len - 2 * m) / (n - 1);
    for (let i = 0; i < n; i++, k++) {
      const [x, y, , , sd] = pt(off0 + m + i * step);
      if (i % 2 === 0) {
        // уточка: «плывёт» по часовой стрелке, подпрыгивая на волне
        const rot = sd * Math.PI / 2;
        duck(g, pal, x, y, 8.4, 1, null, rot, false);
      } else bubbleGroup(g, x, y, 1.15);
    }
  }
  // угловые пузыри с мини-уточкой
  const cs = [[c0, c0], [CW - c0, c0], [CW - c0, CH - c0], [c0, CH - c0]];
  cs.forEach(([x, y], i) => {
    g.beginPath(); g.arc(x, y, 15.5, 0, TAU); g.fillStyle = css(pal.water2); g.fill();
    g.lineWidth = 2; g.strokeStyle = css(FOAM); g.stroke();
    g.beginPath(); g.arc(x, y, 11, 0, TAU); g.lineWidth = 1; g.strokeStyle = css(FOAM, 0.7); g.stroke();
    duck(g, pal, x, y + 1, 5.6, 1, null, i * Math.PI / 2, false);
    g.beginPath(); g.arc(x - 8, y - 9, 2, 0, TAU); g.fillStyle = css(FOAM, 0.95); g.fill();
  });
  return 46;
}

function sprinkle(g, rng, fx, fy, fw, fh, n, avoid) {
  for (let i = 0; i < n; i++) {
    const r = rng.range(2.2, 6.5), x = rng.range(fx + 8, fx + fw - 8), y = rng.range(fy + 8, fy + fh - 8);
    if (avoid && avoid(x, y, r)) continue;
    bubble(g, x, y, r);
  }
}

const ACCS = [null, null, 'hat', 'bow', 'glasses'];

export default {
  id: 'ducks',
  name: 'Уточки',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = border(g, pal);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    const cx = CW / 2, cy = CH / 2;
    const comp = rng.int(0, 2);
    const R = rng.pick([20, 22, 24]);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    waves(g, pal, fx, fy, fw, fh, R);
    const spots = []; // занятые области для пузырьков
    const near = (x, y, r) => spots.some(([sx, sy, sr]) => Math.hypot(sx - x, sy - y) < sr + r);
    const pr = rng.fork('ducks');

    if (comp === 0) {
      // шахматная сетка уточек
      const cols = rng.pick([2, 3]);
      const sx = fw / cols, rows = cols === 2 ? 4 : 5, sy = fh / rows;
      const s = cols === 2 ? 36 : 24;
      const flip = rng.chance(0.5) ? 1 : -1;
      for (let c = 0; c < cols; c++) {
        for (let r = -1; r <= rows; r++) {
          const x = fx + sx * (c + 0.5), y = fy + sy * (r + 0.5 + (c % 2) * 0.5);
          if (y < fy + 6 || y > fy + fh - 6) continue;
          const dir = ((c + r) % 2 ? 1 : -1) * flip;
          spots.push([x, y, s * 1.4]);
          duck(g, pal, x, y, s * pr.range(0.94, 1.06), dir, pr.chance(0.45) ? pr.pick(ACCS) : null);
        }
      }
      // дополнительная утка-крупняк по центру при 3 колонках не нужна; пузырьки в промежутках
      sprinkle(g, pr, fx, fy, fw, fh, 46, near);
    } else if (comp === 1) {
      // медальон: большая уточка в круге пены
      const Rm = 104;
      g.beginPath(); g.arc(cx, cy, Rm + 6, 0, TAU); g.fillStyle = css(pal.deep, 0.35); g.fill();
      g.beginPath(); g.arc(cx, cy, Rm, 0, TAU); g.fillStyle = css(lighten(pal.water, 0.35)); g.fill();
      for (let i = 0; i < 4; i++) {
        g.beginPath(); g.arc(cx, cy, Rm - 8 - i * 17, 0, TAU);
        g.lineWidth = 2.2 - i * 0.3; g.strokeStyle = css(FOAM, 0.95 - i * 0.12); g.stroke();
      }
      const nb = 22;
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * TAU;
        bubble(g, cx + Math.cos(a) * (Rm + 3), cy + Math.sin(a) * (Rm + 3), i % 2 ? 6 : 8.5);
      }
      spots.push([cx, cy, Rm + 12]);
      duck(g, pal, cx - 2, cy + 8, 56, pr.chance(0.5) ? 1 : -1, pr.pick(['hat', 'bow', 'glasses']));
      // мини-утки по углам
      for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const x = cx + sx * (fw / 2 - 34), y = cy + sy * (fh / 2 - 38);
        spots.push([x, y, 40]);
        duck(g, pal, x, y, 20, -sx, pr.chance(0.5) ? pr.pick(ACCS) : null);
      }
      // уточки поменьше между ними на осях
      for (const sy of [-1, 1]) {
        const x = cx, y = cy + sy * (fh / 2 - 34);
        spots.push([x, y, 30]);
        duck(g, pal, x, y, 14, sy, null);
      }
      sprinkle(g, pr, fx, fy, fw, fh, 40, near);
    } else {
      // мама-утка и вереница утят по извилистой дорожке
      const up = rng.chance(0.5);
      const mx = cx + (up ? -34 : 34), my = up ? fy + 96 : fy + fh - 96, dirM = up ? 1 : -1;
      // дорожка из пены
      const path = (t) => [cx + Math.sin(t * 5.2 + (up ? 0 : Math.PI)) * 62, up ? fy + 150 + t * (fh - 190) : fy + fh - 150 - t * (fh - 190)];
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [w, a] of [[26, 0.28], [16, 0.35]]) {
        g.beginPath();
        for (let i = 0; i <= 60; i++) { const [x, y] = path(i / 60); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.lineWidth = w; g.strokeStyle = css(FOAM, a); g.stroke();
      }
      const kids = 7;
      for (let i = 0; i < kids; i++) {
        const t = (i + 0.5) / kids, [x, y] = path(t), [x2] = path(t + 0.01);
        spots.push([x, y, 26]);
        duck(g, pal, x, y, 15 + (up ? -i : i - kids) * 0.0 + 1.2 * Math.sin(i), x2 > x ? 1 : -1, i === kids - 1 ? 'hat' : null);
      }
      spots.push([mx, my, 72]);
      duck(g, pal, mx, my, 52, dirM, 'bow');
      for (const sy of [-1, 1]) for (const sx of [-1, 1]) {
        const x = cx + sx * (fw / 2 - 26), y = up ? (sy < 0 ? fy + 34 : fy + fh - 34) : (sy < 0 ? fy + 34 : fy + fh - 34);
        if (Math.hypot(y - my, x - mx) < 100) continue;
        spots.push([x, y, 26]);
        if (sx * sy > 0) lifebuoy(g, pal, x, y, 21); else bubbleGroup(g, x, y, 1.9);
      }
      sprinkle(g, pr, fx, fy, fw, fh, 36, near);
    }
    g.restore();
    return { edge: pal.edge, fringe: [250, 246, 226] };
  },
};
