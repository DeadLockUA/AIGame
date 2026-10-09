// Волшебный ковёр: круги рун, полумесяцы, звёзды, колбы с зельями, остроконечные шляпы, свитки.
import { CW, CH, css, mix, darken, lighten, pickPalette, star } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { field: [44, 24, 92], field2: [78, 46, 140], border: [26, 14, 60], gold: [236, 190, 86], gold2: [255, 232, 150], hat: [112, 70, 190], parch: [238, 220, 172], edge: [30, 16, 66] },
  { field: [18, 34, 90], field2: [40, 66, 152], border: [10, 18, 56], gold: [238, 196, 92], gold2: [255, 234, 156], hat: [70, 110, 210], parch: [236, 222, 180], edge: [12, 22, 62] },
  { field: [60, 20, 84], field2: [112, 44, 128], border: [34, 10, 52], gold: [240, 186, 94], gold2: [255, 226, 160], hat: [150, 60, 160], parch: [240, 216, 178], edge: [38, 12, 56] },
  { field: [16, 52, 90], field2: [30, 100, 140], border: [8, 28, 58], gold: [232, 196, 100], gold2: [255, 236, 160], hat: [40, 140, 170], parch: [232, 224, 184], edge: [8, 32, 62] },
  { field: [34, 28, 100], field2: [70, 56, 170], border: [18, 14, 64], gold: [242, 198, 96], gold2: [255, 238, 168], hat: [100, 80, 210], parch: [240, 224, 184], edge: [20, 16, 70] },
  { field: [28, 20, 70], field2: [64, 40, 120], border: [74, 28, 100], gold: [228, 182, 90], gold2: [255, 226, 150], hat: [190, 70, 150], parch: [236, 214, 172], edge: [44, 18, 70] },
];
const POTIONS = [[236, 70, 170], [60, 214, 206], [140, 230, 80], [255, 150, 50], [150, 96, 255], [80, 150, 255], [255, 90, 90]];

function glyph(g, x, y, h, rng) {
  const w = h * 0.55, pts = [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0.5, 0], [0.5, 2]];
  g.beginPath();
  if (rng.chance(0.6)) { g.moveTo(x, y - h / 2); g.lineTo(x, y + h / 2); }
  const k = rng.int(2, 3);
  for (let i = 0; i < k; i++) {
    const a = pts[rng.int(0, 7)], b = pts[rng.int(0, 7)];
    if (a === b) continue;
    g.moveTo(x + (a[0] - 0.5) * w, y + (a[1] - 1) * h / 2); g.lineTo(x + (b[0] - 0.5) * w, y + (b[1] - 1) * h / 2);
  }
  g.stroke();
}

function crescent(g, x, y, r, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
  g.beginPath(); g.rect(-r - 1, -r - 1, 2 * r + 2, 2 * r + 2); g.arc(r * 0.42, -r * 0.12, r * 0.84, 0, TAU);
  g.fillStyle = css(col); g.fill('evenodd');
  g.restore();
}

function sparkle(g, x, y, r, col, a = 1) {
  star(g, x, y, r, r * 0.22, 4, -Math.PI / 2);
  g.fillStyle = css(col, a); g.fill();
}

function runeCircle(g, cx, cy, R, pal, rng) {
  g.save(); g.translate(cx, cy);
  const gr = g.createRadialGradient(0, 0, 4, 0, 0, R);
  gr.addColorStop(0, css(darken(pal.field, 0.45), 0.9)); gr.addColorStop(0.75, css(pal.field2, 0.55)); gr.addColorStop(1, css(darken(pal.field, 0.3), 0.8));
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = gr; g.fill();
  g.strokeStyle = css(pal.gold);
  for (const [r, w] of [[R, 2.6], [R - 5, 1], [R - 28, 1.2], [R - 32, 2]]) {
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.lineWidth = w; g.stroke();
  }
  // руны в кольце
  const n = Math.round(R * 0.22);
  g.lineCap = 'round'; g.lineWidth = 1.5; g.strokeStyle = css(pal.gold2);
  for (let i = 0; i < n; i++) {
    g.save(); g.rotate((i / n) * TAU); g.translate(0, -(R - 16.5));
    glyph(g, 0, 0, 13, rng);
    g.restore();
  }
  // звезда-пентаграмма
  const [pn, pk] = rng.pick([[5, 2], [7, 2], [7, 3], [8, 3], [9, 4]]);
  const rr = R - 33;
  g.beginPath();
  for (let i = 0; i <= pn; i++) {
    const a = -Math.PI / 2 + ((i * pk) % pn) * TAU / pn;
    if (i === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath(); g.lineWidth = 1.8; g.strokeStyle = css(pal.gold); g.stroke();
  g.beginPath(); g.arc(0, 0, rr * 0.38, 0, TAU); g.lineWidth = 1.4; g.stroke();
  for (let i = 0; i < pn; i++) {
    const a = -Math.PI / 2 + i * TAU / pn;
    g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, 4, 0, TAU); g.fillStyle = css(pal.gold2); g.fill();
    g.lineWidth = 1; g.strokeStyle = css(darken(pal.border, 0.2)); g.stroke();
  }
  g.restore();
}

/** Колба: основание в (x,y), высота h. kind 0 круглая, 1 коническая, 2 пробирка. */
function flask(g, x, y, h, col, kind, pal) {
  g.save(); g.translate(x, y); g.scale(h, h);
  const aura = g.createRadialGradient(0, -0.4, 0.05, 0, -0.4, 0.85);
  aura.addColorStop(0, css(col, 0.42)); aura.addColorStop(1, css(col, 0));
  g.fillStyle = aura; g.beginPath(); g.arc(0, -0.4, 0.85, 0, TAU); g.fill();
  const nw = kind === 2 ? 0.075 : 0.085, r = 0.34, cy = -0.34;
  const glass = () => {
    g.beginPath();
    if (kind === 0) {
      const d = Math.asin(nw / r);
      g.moveTo(-nw, -0.9); g.lineTo(-nw, cy - Math.cos(d) * r);
      g.arc(0, cy, r, -Math.PI / 2 - d, -Math.PI / 2 + d, true);
      g.lineTo(nw, -0.9); g.closePath();
    } else if (kind === 1) {
      g.moveTo(-0.3, 0); g.lineTo(0.3, 0); g.lineTo(nw, -0.56); g.lineTo(nw, -0.9); g.lineTo(-nw, -0.9); g.lineTo(-nw, -0.56); g.closePath();
    } else {
      g.moveTo(-0.15, -0.74); g.lineTo(-0.15, -0.08); g.quadraticCurveTo(-0.15, 0, -0.07, 0); g.lineTo(0.07, 0);
      g.quadraticCurveTo(0.15, 0, 0.15, -0.08); g.lineTo(0.15, -0.74); g.lineTo(0.08, -0.78); g.lineTo(0.08, -0.9); g.lineTo(-0.08, -0.9); g.lineTo(-0.08, -0.78); g.closePath();
    }
  };
  glass(); g.fillStyle = 'rgba(210,230,255,0.22)'; g.fill();
  g.save(); glass(); g.clip();
  const lvl = kind === 0 ? -0.5 : kind === 1 ? -0.3 : -0.5;
  const lg = g.createLinearGradient(-0.3, 0, 0.3, 0);
  lg.addColorStop(0, css(lighten(col, 0.3))); lg.addColorStop(0.55, css(col)); lg.addColorStop(1, css(darken(col, 0.3)));
  g.beginPath(); g.moveTo(-0.5, lvl); g.bezierCurveTo(-0.2, lvl - 0.05, -0.1, lvl + 0.05, 0.5, lvl - 0.02); g.lineTo(0.5, 0.1); g.lineTo(-0.5, 0.1); g.closePath();
  g.fillStyle = lg; g.fill();
  g.lineWidth = 0.02; g.strokeStyle = css(lighten(col, 0.65), 0.9); g.stroke();
  for (const [bx, by, br] of [[-0.07, lvl + 0.1, 0.035], [0.06, lvl + 0.18, 0.026], [0.0, lvl + 0.04, 0.02]]) {
    g.beginPath(); g.arc(bx, Math.min(by, -0.04), br, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
  }
  g.restore();
  glass(); g.lineWidth = 0.034; g.lineJoin = 'round'; g.strokeStyle = css(mix(pal.gold2, [255, 255, 255], 0.3), 0.95); g.stroke();
  // губа и пробка
  g.fillStyle = css(pal.gold); g.fillRect(-nw - 0.025, -0.93, 2 * nw + 0.05, 0.04);
  g.beginPath(); g.moveTo(-nw + 0.01, -0.93); g.lineTo(-nw - 0.005, -1.04); g.lineTo(nw + 0.005, -1.04); g.lineTo(nw - 0.01, -0.93); g.closePath();
  g.fillStyle = '#a8703c'; g.fill(); g.lineWidth = 0.014; g.strokeStyle = '#4a2a14'; g.stroke();
  // блик
  g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.03;
  g.beginPath();
  if (kind === 0) g.arc(0, cy, r * 0.78, Math.PI * 0.62, Math.PI * 0.85); else { g.moveTo(-0.1, -0.12); g.lineTo(-0.1, kind === 2 ? -0.62 : -0.22); }
  g.stroke();
  g.restore();
}

/** Остроконечная шляпа: основание (поля) в (x,y), высота s. */
function hat(g, x, y, s, col, pal, tilt = 0) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  g.beginPath(); g.ellipse(0, -0.06, 0.66, 0.15, 0, 0, TAU);
  g.fillStyle = css(darken(col, 0.45)); g.fill(); g.lineWidth = 0.025; g.strokeStyle = css(pal.gold); g.stroke();
  const cone = () => {
    g.beginPath(); g.moveTo(-0.42, -0.1);
    g.bezierCurveTo(-0.36, -0.5, -0.12, -0.8, 0.3, -1.0);
    g.bezierCurveTo(0.22, -0.7, 0.4, -0.4, 0.42, -0.1);
    g.quadraticCurveTo(0, 0.05, -0.42, -0.1); g.closePath();
  };
  cone(); g.fillStyle = css(col); g.fill();
  g.save(); cone(); g.clip();
  const sh = g.createLinearGradient(-0.4, 0, 0.45, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0.22)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = sh; g.fillRect(-1, -1.1, 2, 1.3);
  g.fillStyle = css(darken(col, 0.4)); g.fillRect(-0.5, -0.27, 1, 0.16);
  g.fillStyle = css(pal.gold); g.fillRect(-0.5, -0.275, 1, 0.014); g.fillRect(-0.5, -0.125, 1, 0.014);
  for (const [sx, sy, sr] of [[-0.05, -0.52, 0.06], [0.14, -0.7, 0.04], [-0.14, -0.7, 0.035]]) sparkle(g, sx, sy, sr, pal.gold2);
  crescent(g, 0.12, -0.42, 0.06, 0.4, pal.gold2);
  g.restore();
  cone(); g.lineWidth = 0.025; g.lineJoin = 'round'; g.strokeStyle = css(darken(col, 0.6)); g.stroke();
  // пряжка
  g.fillStyle = css(pal.gold); g.fillRect(-0.07, -0.265, 0.14, 0.13);
  g.fillStyle = css(darken(col, 0.4)); g.fillRect(-0.04, -0.24, 0.08, 0.08);
  g.restore();
}

/** Свиток: центр (x,y), высота L. */
function scroll(g, x, y, L, rot, pal, ribbon) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(L, L);
  const w = 0.34, h = 0.5;
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(-w + 0.03, -h + 0.04, 2 * w, 2 * h);
  const pg = g.createLinearGradient(-w, 0, w, 0);
  pg.addColorStop(0, css(darken(pal.parch, 0.1))); pg.addColorStop(0.5, css(lighten(pal.parch, 0.2))); pg.addColorStop(1, css(darken(pal.parch, 0.14)));
  g.fillStyle = pg; g.fillRect(-w, -h, 2 * w, 2 * h);
  g.lineWidth = 0.016; g.strokeStyle = css(darken(pal.parch, 0.55)); g.strokeRect(-w, -h, 2 * w, 2 * h);
  // валики
  for (const sy of [-1, 1]) {
    g.beginPath(); g.ellipse(0, sy * h, w + 0.05, 0.075, 0, 0, TAU);
    g.fillStyle = css(darken(pal.parch, 0.08)); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(w + 0.05, sy * h, 0.03, 0.075, 0, 0, TAU); g.fillStyle = css(darken(pal.parch, 0.4)); g.fill();
    g.beginPath(); g.ellipse(-w - 0.05, sy * h, 0.03, 0.075, 0, 0, TAU); g.fill();
  }
  // строки рун
  g.strokeStyle = css(mix(pal.field, [0, 0, 0], 0.2), 0.8); g.lineWidth = 0.022; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const yy = -h + 0.14 + i * 0.1, len = 0.46 - (i % 3) * 0.08;
    g.setLineDash([0.035, 0.03]); g.beginPath(); g.moveTo(-w + 0.08, yy); g.lineTo(-w + 0.08 + len, yy); g.stroke();
  }
  g.setLineDash([]);
  // лента и печать
  g.fillStyle = css(ribbon); g.fillRect(-w - 0.02, 0.18, 2 * w + 0.04, 0.07);
  g.beginPath(); g.arc(0, 0.215, 0.07, 0, TAU); g.fillStyle = css(darken(ribbon, 0.2)); g.fill();
  sparkle(g, 0, 0.215, 0.055, pal.gold2);
  g.restore();
}

function backdrop(g, pal, rng, fx, fy, fw, fh) {
  g.fillStyle = css(pal.field); g.fillRect(fx, fy, fw, fh);
  // «туманности»
  for (let i = 0; i < 7; i++) {
    const x = rng.range(fx, fx + fw), y = rng.range(fy, fy + fh), r = rng.range(70, 130);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, css(rng.chance(0.5) ? pal.field2 : mix(pal.field2, pal.hat, 0.5), 0.5)); gr.addColorStop(1, css(pal.field2, 0));
    g.fillStyle = gr; g.fillRect(fx, fy, fw, fh);
  }
  // тонкая решётка из ромбов
  g.strokeStyle = css(pal.gold, 0.1); g.lineWidth = 1;
  g.beginPath();
  for (let k = -fh; k < fw + fh; k += 22) { g.moveTo(fx + k, fy); g.lineTo(fx + k + fh, fy + fh); g.moveTo(fx + k, fy + fh); g.lineTo(fx + k + fh, fy); }
  g.stroke();
  // россыпь звёздочек
  for (let i = 0; i < 70; i++) {
    const x = rng.range(fx + 4, fx + fw - 4), y = rng.range(fy + 4, fy + fh - 4);
    if (rng.chance(0.3)) sparkle(g, x, y, rng.range(2.5, 5), pal.gold2, rng.range(0.4, 0.9));
    else { g.beginPath(); g.arc(x, y, rng.range(0.6, 1.4), 0, TAU); g.fillStyle = css(pal.gold2, rng.range(0.3, 0.8)); g.fill(); }
  }
}

function border(g, pal, rng) {
  g.fillStyle = css(pal.border); g.fillRect(0, 0, CW, CH);
  // фоновая россыпь
  for (let y = 10; y < CH; y += 12) for (let x = 10 + ((y / 12) % 2) * 6; x < CW; x += 12) {
    if (x < 46 || x > CW - 46 || y < 46 || y > CH - 46) { g.beginPath(); g.arc(x, y, 0.9, 0, TAU); g.fillStyle = css(pal.gold, 0.22); g.fill(); }
  }
  const line = (o, w, c, a = 1) => { g.strokeStyle = css(c, a); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); };
  line(9, 2.4, pal.gold); line(13, 1, pal.gold, 0.7); line(39, 1, pal.gold, 0.7); line(43, 2.4, pal.gold);
  const c0 = 26, W = CW - 2 * c0, H = CH - 2 * c0, per = 2 * (W + H);
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [c0 + t, c0, 0];
    t -= W; if (t < H) return [c0 + W, c0 + t, 1];
    t -= H; if (t < W) return [c0 + W - t, c0 + H, 2];
    t -= W; return [c0, c0 + H - t, 3];
  };
  const sides = [[W, 0], [H, W], [W, W + H], [H, 2 * W + H]];
  const grng = rng.fork('border');
  for (const [len, off] of sides) {
    const m = 27, n = 4 * Math.round((len - 2 * m) / 92) + 1, step = (len - 2 * m) / (n - 1);
    for (let i = 0; i < n; i++) {
      const [x, y, sd] = pt(off + m + i * step), rot = sd * Math.PI / 2;
      g.save(); g.translate(x, y); g.rotate(rot);
      if (i % 4 === 0) { crescent(g, 0, 0, 9, -Math.PI / 2 + 0.4, pal.gold); sparkle(g, 2, -1, 3, pal.gold2); }
      else if (i % 4 === 2) { star(g, 0, 0, 9.5, 4, 5); g.fillStyle = css(pal.gold2); g.fill(); g.lineWidth = 0.8; g.strokeStyle = css(pal.border); g.stroke(); }
      else { g.lineWidth = 1.3; g.lineCap = 'round'; g.strokeStyle = css(pal.gold); glyph(g, 0, 0, 11, grng); }
      g.restore();
    }
  }
  for (const [x, y] of [[c0, c0], [CW - c0, c0], [CW - c0, CH - c0], [c0, CH - c0]]) {
    g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fillStyle = css(pal.field); g.fill(); g.lineWidth = 2; g.strokeStyle = css(pal.gold); g.stroke();
    star(g, x, y, 14, 6, 8, 0); g.fillStyle = css(pal.gold); g.fill();
    star(g, x, y, 8, 3.2, 8, Math.PI / 8); g.fillStyle = css(pal.hat); g.fill();
    g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fillStyle = css(pal.gold2); g.fill();
  }
  return 46;
}

export default {
  id: 'wizard',
  name: 'Волшебник',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    const cx = CW / 2, cy = CH / 2;
    const comp = rng.int(0, 2);
    const pr = rng.fork('wiz');
    const pot = () => pr.pick(POTIONS);
    const hatCols = [pal.hat, mix(pal.hat, pal.field2, 0.5), [200, 70, 150], [60, 160, 190], [90, 70, 190]];
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    backdrop(g, pal, pr.fork('bg'), fx, fy, fw, fh);

    if (comp === 0) {
      // медальон с кругом рун и шляпой
      runeCircle(g, cx, cy, 112, pal, pr);
      sparkle(g, cx, cy, 16, pal.gold2, 0.5);
      hat(g, cx, cy + 52, 108, pr.pick(hatCols), pal, pr.range(-0.08, 0.08));
      // луна и звёзды сверху
      crescent(g, cx, fy + 52, 30, pr.range(-0.5, 0.5) - 0.3, pal.gold);
      sparkle(g, cx + 36, fy + 40, 7, pal.gold2); sparkle(g, cx - 38, fy + 62, 5, pal.gold2);
      // углы: колбы (сверху) и свитки (снизу)
      for (const sx of [-1, 1]) {
        flask(g, cx + sx * (fw / 2 - 30), fy + 118, 82, pot(), pr.int(0, 2), pal);
        scroll(g, cx + sx * (fw / 2 - 38), fy + fh - 78, 80, sx * pr.range(0.1, 0.3), pal, pot());
      }
      // нижний ряд колб
      for (let i = -1; i <= 1; i++) flask(g, cx + i * 46, fy + fh - 12, 50 + (i === 0 ? 14 : 0), pot(), (i + 3) % 3, pal);
    } else if (comp === 1) {
      // шкаф с полками
      const rows = 4, sp = fh / rows;
      for (let r = 0; r < rows; r++) {
        const base = fy + sp * (r + 1) - 10;
        // подложка и полка
        g.fillStyle = css(darken(pal.field, 0.35), 0.45); g.fillRect(fx, base - sp + 14, fw, sp - 14);
        const pg = g.createLinearGradient(0, base, 0, base + 10);
        pg.addColorStop(0, css(mix(pal.gold, [120, 70, 30], 0.5))); pg.addColorStop(1, css(mix(pal.gold, [60, 30, 10], 0.7)));
        g.fillStyle = pg; g.fillRect(fx, base, fw, 10);
        g.fillStyle = css(pal.gold, 0.9); g.fillRect(fx, base, fw, 1.6);
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(fx, base + 10, fw, 4);
        // содержимое
        const kind = (r + pr.int(0, 3)) % 4;
        const n = kind === 1 ? 3 : 4;
        for (let i = 0; i < n; i++) {
          const x = fx + fw * (i + 0.5) / n + pr.range(-4, 4);
          if (kind === 1) hat(g, x, base + 2, pr.range(66, 86), pr.pick(hatCols), pal, pr.range(-0.12, 0.12));
          else if (kind === 3 && i % 2 === 0) scroll(g, x, base - 40, pr.range(60, 72), pr.range(-0.25, 0.25), pal, pot());
          else flask(g, x, base, pr.range(54, 82), pot(), pr.int(0, 2), pal);
        }
        if (r === 0 || r === 2) { crescent(g, fx + fw - 18, base - sp + 32, 9, 0.4, pal.gold); sparkle(g, fx + 20, base - sp + 30, 6, pal.gold2); }
      }
    } else {
      // шахматная решётка предметов с кругом рун за ними
      g.globalAlpha = 0.5; runeCircle(g, cx, cy, 120, pal, pr); g.globalAlpha = 1;
      sparkle(g, cx, cy, 20, pal.gold2, 0.9);
      const rows = 6, sy = fh / rows, sx = fw / 3;
      let k = pr.int(0, 3);
      for (let r = 0; r < rows; r++) {
        const odd = r % 2, cnt = odd ? 2 : 3;
        for (let c = 0; c < cnt; c++) {
          const x = fx + sx * (c + (odd ? 1 : 0.5)), y = fy + sy * (r + 0.5);
          const t = (k++) % 4;
          if (t === 0) hat(g, x, y + 30, 62, pr.pick(hatCols), pal, pr.range(-0.1, 0.1));
          else if (t === 1) flask(g, x, y + 33, 68, pot(), pr.int(0, 2), pal);
          else if (t === 2) scroll(g, x, y, 64, pr.range(-0.2, 0.2), pal, pot());
          else { crescent(g, x, y, 25, pr.range(-0.5, 0.5) - 0.4, pal.gold); sparkle(g, x + 18, y - 18, 6, pal.gold2); }
        }
        if (!odd) { sparkle(g, fx + 12, fy + sy * (r + 1), 5, pal.gold2); sparkle(g, fx + fw - 12, fy + sy * (r + 1), 5, pal.gold2); }
        else { sparkle(g, fx + sx * 0.5, fy + sy * (r + 0.5), 6, pal.gold2, 0.8); sparkle(g, fx + sx * 2.5, fy + sy * (r + 0.5), 6, pal.gold2, 0.8); }
      }
    }
    g.restore();
    return { edge: pal.edge, fringe: pal.gold2 };
  },
};
