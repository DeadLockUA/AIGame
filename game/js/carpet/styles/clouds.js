// Облака: небесный градиент, пухлые облака, солнце, радуга, птички. Кайма из волн-облачков.
import { CW, CH, css, mix, darken, lighten, pickPalette, star, mirrorX } from '../kit.js';

const TAU = Math.PI * 2;

const PALS = [
  { top: [255, 190, 208], bot: [255, 236, 204], cloud: [255, 255, 255], shade: [238, 204, 232], ink: [196, 130, 176], sun: [255, 214, 120], border: [244, 148, 182], border2: [255, 226, 238], edge: [190, 100, 140] },
  { top: [112, 184, 250], bot: [214, 238, 255], cloud: [255, 255, 255], shade: [188, 214, 246], ink: [96, 142, 214], sun: [255, 226, 108], border: [88, 148, 226], border2: [226, 242, 255], edge: [56, 100, 176] },
  { top: [150, 120, 214], bot: [255, 194, 154], cloud: [255, 232, 232], shade: [232, 172, 202], ink: [150, 96, 160], sun: [255, 172, 100], border: [122, 92, 184], border2: [255, 214, 196], edge: [90, 62, 140] },
  { top: [140, 224, 214], bot: [255, 246, 216], cloud: [255, 255, 255], shade: [186, 226, 226], ink: [80, 160, 160], sun: [255, 210, 108], border: [88, 190, 180], border2: [232, 252, 244], edge: [50, 130, 126] },
  { top: [176, 166, 240], bot: [252, 218, 238], cloud: [255, 252, 255], shade: [214, 196, 240], ink: [136, 110, 200], sun: [255, 220, 130], border: [142, 120, 212], border2: [240, 230, 255], edge: [100, 78, 170] },
  { top: [38, 48, 108], bot: [128, 112, 194], cloud: [214, 212, 248], shade: [140, 136, 196], ink: [80, 80, 150], sun: [255, 244, 200], border: [34, 40, 92], border2: [150, 150, 220], edge: [20, 26, 62] },
];

const RAINBOW = [[255, 112, 120], [255, 168, 92], [255, 224, 104], [128, 214, 134], [100, 180, 240], [172, 132, 232]];

function line(g, col, w, a = 1) { g.lineWidth = w; g.strokeStyle = css(col, a); g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }

const SHAPES = [
  [[-0.27, 0.15], [-0.07, 0.25], [0.17, 0.2], [0.34, 0.13]],
  [[-0.3, 0.12], [-0.12, 0.2], [0.04, 0.27], [0.24, 0.18], [0.38, 0.1]],
  [[-0.2, 0.2], [0.05, 0.26], [0.3, 0.16]],
];

function cloudPath(g, w, shape) {
  const R = (x, y, ww, h, r) => { r = Math.min(r, ww / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + h, r); g.arcTo(x + ww, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath(); };
  g.beginPath();
  R(-0.44 * w, -0.17 * w, 0.88 * w, 0.17 * w, 0.085 * w);
  for (const [x, r] of SHAPES[shape]) { g.moveTo(x * w + r * w, -r * w * 0.95); g.arc(x * w, -r * w * 0.95, r * w, 0, TAU); }
}

/** Пухлое облако; низ на y=0, центр по x=0. face — «каваи»-лицо. */
function cloud(g, w, pal, shape = 0, face = false, tint = null) {
  const c = tint || pal.cloud;
  const lw = Math.max(1.2, w * 0.022);
  cloudPath(g, w, shape); line(g, pal.ink, lw * 2.4, 0.55);
  cloudPath(g, w, shape); g.fillStyle = css(c); g.fill();
  g.save(); cloudPath(g, w, shape); g.clip();
  const gr = g.createLinearGradient(0, -w * 0.4, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, css(pal.shade, 0.95));
  g.fillStyle = gr; g.fillRect(-w, -w * 0.5, w * 2, w * 0.5);
  // мягкие внутренние дуги
  g.strokeStyle = css(pal.shade, 0.7); g.lineWidth = lw;
  for (const [x, r] of SHAPES[shape]) { g.beginPath(); g.arc(x * w, -r * w * 0.95, r * w * 0.78, 0.3, 1.2); g.stroke(); }
  g.restore();
  // блик
  const [x0, r0] = SHAPES[shape][1];
  g.beginPath(); g.arc(x0 * w, -r0 * w * 0.95, r0 * w * 0.72, Math.PI * 1.1, Math.PI * 1.45); line(g, [255, 255, 255], lw * 1.4, 0.85);
  if (face) {
    const s = w * 0.07, y = -w * 0.15;
    for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * w * 0.12, y, s * 0.55, 0, TAU); g.fillStyle = css(darken(pal.ink, 0.35)); g.fill(); g.beginPath(); g.arc(sx * w * 0.12 - s * 0.15, y - s * 0.2, s * 0.18, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.ellipse(sx * w * 0.22, y + s * 0.9, s * 0.7, s * 0.42, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.55)'; g.fill(); }
    g.beginPath(); g.arc(0, y + s * 0.5, s * 0.55, 0.2, Math.PI - 0.2); line(g, darken(pal.ink, 0.35), Math.max(1, s * 0.3));
  }
}

function sun(g, R, pal, rays = 14) {
  const lw = Math.max(1.2, R * 0.05);
  // волнистые лучи
  g.beginPath();
  const n = rays * 2;
  for (let i = 0; i <= n * 4; i++) {
    const a = (i / (n * 4)) * TAU, r = R * (1.28 + 0.2 * Math.max(0, Math.sin(a * rays)));
    i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0);
  }
  g.closePath(); g.fillStyle = css(mix(pal.sun, [255, 150, 90], 0.25), 0.9); g.fill(); line(g, mix(pal.sun, [190, 90, 60], 0.5), lw);
  const gr = g.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
  gr.addColorStop(0, css(lighten(pal.sun, 0.45))); gr.addColorStop(1, css(pal.sun));
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = gr; g.fill(); line(g, mix(pal.sun, [190, 90, 60], 0.5), lw);
  for (const sx of [-1, 1]) {
    g.beginPath(); g.arc(sx * R * 0.34, -R * 0.08, R * 0.08, 0, TAU); g.fillStyle = css([110, 60, 50]); g.fill();
    g.beginPath(); g.arc(sx * R * 0.34 - R * 0.025, -R * 0.11, R * 0.028, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.ellipse(sx * R * 0.52, R * 0.2, R * 0.12, R * 0.07, 0, 0, TAU); g.fillStyle = 'rgba(255,120,120,0.5)'; g.fill();
  }
  g.beginPath(); g.arc(0, R * 0.08, R * 0.24, 0.2, Math.PI - 0.2); line(g, [110, 60, 50], R * 0.06);
}

function moon(g, R, pal) {
  const lw = Math.max(1.2, R * 0.05);
  g.beginPath(); g.arc(0, 0, R * 1.5, 0, TAU); const gl = g.createRadialGradient(0, 0, R, 0, 0, R * 1.6); gl.addColorStop(0, css(pal.sun, 0.45)); gl.addColorStop(1, css(pal.sun, 0)); g.fillStyle = gl; g.fill();
  g.beginPath(); g.arc(0, 0, R, Math.PI * 0.35, Math.PI * 1.65, false); g.arc(R * 0.42, -R * 0.12, R * 0.82, Math.PI * 1.45, Math.PI * 0.55, true); g.closePath();
  g.fillStyle = css(pal.sun); g.fill(); line(g, mix(pal.sun, pal.ink, 0.5), lw);
  g.beginPath(); g.arc(-R * 0.5, -R * 0.05, R * 0.06, 0, TAU); g.fillStyle = css([90, 80, 120]); g.fill();
  g.beginPath(); g.arc(-R * 0.62, R * 0.28, R * 0.18, 0.3, Math.PI - 0.3); line(g, [90, 80, 120], R * 0.05);
}

function rainbow(g, cx, cy, R, band, pal, alpha = 1, order = RAINBOW) {
  g.lineCap = 'butt';
  order.forEach((c, i) => {
    g.beginPath(); g.arc(cx, cy, R - i * band, Math.PI, TAU); g.lineWidth = band + 0.8; g.strokeStyle = css(pal.night ? darken(c, 0.15) : c, alpha); g.stroke();
  });
  g.beginPath(); g.arc(cx, cy, R + band * 0.5, Math.PI, TAU); line(g, pal.ink, 1.4, 0.5);
  g.beginPath(); g.arc(cx, cy, R - order.length * band + band * 0.5, Math.PI, TAU); line(g, pal.ink, 1.4, 0.5);
}

function bird(g, x, y, s, col, flap = 0.4) {
  g.beginPath(); g.moveTo(x - s, y - s * flap); g.quadraticCurveTo(x - s * 0.5, y - s * flap * 1.9, x, y); g.quadraticCurveTo(x + s * 0.5, y - s * flap * 1.9, x + s, y - s * flap);
  line(g, col, Math.max(1.2, s * 0.18));
}

function sparkle(g, x, y, r, col, a = 1) {
  star(g, x, y, r, r * 0.28, 4, -Math.PI / 2); g.fillStyle = css(col, a); g.fill();
}

function balloon(g, s, c1, c2, pal) {
  const lw = Math.max(1, s * 0.03);
  g.strokeStyle = css(pal.ink, 0.9); g.lineWidth = lw;
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * s * 0.3, s * 0.55); g.lineTo(sx * s * 0.12, s * 0.9); g.stroke(); }
  g.beginPath(); g.rect(-s * 0.14, s * 0.9, s * 0.28, s * 0.2); g.fillStyle = css([186, 132, 92]); g.fill(); line(g, [100, 60, 40], lw);
  g.beginPath(); g.moveTo(0, -s * 0.62); g.bezierCurveTo(s * 0.62, -s * 0.62, s * 0.62, s * 0.2, s * 0.3, s * 0.55); g.lineTo(-s * 0.3, s * 0.55); g.bezierCurveTo(-s * 0.62, s * 0.2, -s * 0.62, -s * 0.62, 0, -s * 0.62); g.closePath();
  g.fillStyle = css(c1); g.fill();
  g.save(); g.clip();
  for (let i = -3; i <= 3; i += 2) { g.beginPath(); g.ellipse(i * s * 0.1, -s * 0.05, s * 0.1, s * 0.7, 0, 0, TAU); g.fillStyle = css(c2); g.fill(); }
  g.beginPath(); g.ellipse(-s * 0.25, -s * 0.2, s * 0.08, s * 0.25, 0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill();
  g.restore();
  g.beginPath(); g.moveTo(0, -s * 0.62); g.bezierCurveTo(s * 0.62, -s * 0.62, s * 0.62, s * 0.2, s * 0.3, s * 0.55); g.lineTo(-s * 0.3, s * 0.55); g.bezierCurveTo(-s * 0.62, s * 0.2, -s * 0.62, -s * 0.62, 0, -s * 0.62); g.closePath();
  line(g, pal.ink, lw * 1.4);
}

function skyBg(g, B, pal, rng) {
  const gr = g.createLinearGradient(0, B.y, 0, B.y + B.h); gr.addColorStop(0, css(pal.top)); gr.addColorStop(1, css(pal.bot));
  g.fillStyle = gr; g.fillRect(B.x, B.y, B.w, B.h);
  // мягкие горизонтальные «полосы» неба
  for (let i = 0; i < 7; i++) {
    const y = B.y + (i + 0.5) * B.h / 7;
    g.beginPath(); g.moveTo(B.x, y);
    for (let x = B.x; x <= B.x + B.w; x += 8) g.lineTo(x, y + Math.sin(x * 0.04 + i * 1.7) * 3);
    g.lineTo(B.x + B.w, y + 14); g.lineTo(B.x, y + 14); g.closePath();
    g.fillStyle = css(pal.night ? [255, 255, 255] : [255, 255, 255], 0.06); g.fill();
  }
  // звёздочки / крапинки
  const n = pal.night ? 46 : 26;
  for (let i = 0; i < n; i++) {
    const x = rng.range(B.x + 6, B.x + B.w - 6), y = rng.range(B.y + 6, B.y + B.h - 6);
    if (pal.night || rng.chance(0.5)) sparkle(g, x, y, rng.range(1.6, pal.night ? 4 : 3.4), pal.night ? [255, 244, 200] : [255, 255, 255], pal.night ? 0.9 : 0.8);
    else { g.beginPath(); g.arc(x, y, rng.range(1, 2), 0, TAU); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill(); }
  }
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
  const gr = g.createLinearGradient(0, 0, 0, CH); gr.addColorStop(0, css(lighten(pal.border, 0.1))); gr.addColorStop(1, css(darken(pal.border, 0.1)));
  g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
  // волны
  g.save(); g.beginPath(); g.rect(0, 0, CW, CH); g.rect(x0 + 3, x0 + 3, CW - 2 * x0 - 6, CH - 2 * x0 - 6); g.clip('evenodd');
  g.strokeStyle = css(pal.border2, 0.35); g.lineWidth = 1.4;
  for (let y = 0; y < CH; y += 6) { g.beginPath(); for (let x = 0; x <= CW; x += 6) { const yy = y + Math.sin(x * 0.2 + y * 0.3) * 1.6; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
  g.restore();
  for (const [o, w, c] of [[x0, 2.5, pal.border2], [x0 + 3.5, 1.5, darken(pal.border, 0.4)], [x0 + band, 1.5, darken(pal.border, 0.4)], [x0 + band + 3, 2.5, pal.border2]]) { g.strokeStyle = css(c); g.lineWidth = w; g.strokeRect(o, o, CW - 2 * o, CH - 2 * o); }
  const ink = darken(pal.border, 0.38);
  const bump = (x, y, r, col) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = css(col); g.fill(); };
  const row = (x, y, r, col, lw) => { g.beginPath(); g.arc(x, y, r, 0, TAU); line(g, ink, lw, 0.75); };
  walk(15, 31, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    // задний ряд (крупнее) и передний ряд, внутрь ковра — «волна» облачков
    g.beginPath(); g.arc(0, 0, 10.5, 0, TAU); line(g, ink, 3.2, 0.7);
    g.beginPath(); g.arc(0, 0, 10.5, 0, TAU); g.fillStyle = css(mix(pal.border2, pal.cloud, 0.2 + 0.3 * ((i % 3) / 2))); g.fill();
    g.restore();
  });
  walk(15, 31, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang); g.translate(7.5, 0); g.rotate(0);
    g.restore();
  });
  // передняя волна: полукруги, выглядывающие снизу
  walk(15, 31, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    const col = [pal.cloud, mix(pal.border2, pal.cloud, 0.5)][i % 2];
    g.beginPath(); g.arc(0, 0, 7.6, 0, TAU); g.fillStyle = css(col); g.fill();
    g.beginPath(); g.arc(0, 0, 7.6, Math.PI * 0.15, Math.PI * 0.85); line(g, pal.shade, 1.6, 0.9);
    g.beginPath(); g.arc(-1.8, -2.4, 2.4, Math.PI, Math.PI * 1.5); line(g, [255, 255, 255], 1.1, 0.9);
    g.restore();
  });
  // цветные бусины между облачками (радужные или звёздочки)
  walk(30, 40, (x, y, ang, i) => {
    g.save(); g.translate(x, y); g.rotate(ang); g.translate(0, 0);
    if (variant === 1) { g.beginPath(); g.arc(0, -0.5, 2.8, 0, TAU); g.fillStyle = css(RAINBOW[i % 6]); g.fill(); line(g, ink, 0.8, 0.8); }
    else sparkle(g, 0, 0, 4, RAINBOW[i % 6], 0.95);
    g.restore();
  });
  // уголки: мини-солнышки / луны
  const cc = x0 + band / 2 + 2;
  for (const [x, y] of [[cc, cc], [CW - cc, cc], [cc, CH - cc], [CW - cc, CH - cc]]) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.arc(0, 0, 17, 0, TAU); g.fillStyle = css(pal.border2); g.fill(); line(g, darken(pal.border, 0.4), 1.6);
    if (pal.night) moon(g, 9, pal); else sun(g, 8.5, pal, 10);
    g.restore();
  }
  return x0 + band + 7;
}

// ---- Композиции ----

function cloudRow(g, rng, pal, B, y, wMin, wMax, step, tint, face) {
  let x = B.x - 10;
  while (x < B.x + B.w + 10) {
    const w = rng.range(wMin, wMax);
    g.save(); g.translate(x + w * 0.4, y + rng.range(-4, 4)); cloud(g, w, pal, rng.int(0, 2), face && rng.chance(0.35), tint); g.restore();
    x += w * step;
  }
}

function compRainbow(g, rng, pal, B) {
  const cx = CW / 2, by = B.y + B.h * 0.64;
  // светило
  const sx = rng.chance(0.5) ? -1 : 1;
  g.save(); g.translate(cx + sx * 76, B.y + 56); if (pal.night) moon(g, 26, pal); else sun(g, 24, pal, 12); g.restore();
  // птицы
  for (let i = 0; i < 4; i++) bird(g, cx - sx * (40 + i * 22), B.y + 40 + (i % 2) * 22 + i * 6, 8 - i * 1, pal.night ? [220, 220, 255] : mix(pal.ink, [255, 255, 255], 0.1));
  // дальние облака
  g.save(); g.translate(cx - sx * 64, B.y + 130); cloud(g, 74, pal, 0, true); g.restore();
  g.save(); g.translate(cx + sx * 70, B.y + 150); cloud(g, 56, pal, 2, false); g.restore();
  // радуга
  rainbow(g, cx, by, 120, 14, pal);
  // облака у основания, закрывают концы радуги
  cloudRow(g, rng.fork('r1'), pal, B, by + 20, 70, 100, 0.55, mix(pal.cloud, pal.shade, 0.25), false);
  for (const sgn of [-1, 1]) { g.save(); g.translate(cx + sgn * 112, by + 18); cloud(g, 96, pal, sgn > 0 ? 1 : 0, true); g.restore(); }
  cloudRow(g, rng.fork('r2'), pal, B, by + 74, 80, 118, 0.62, null, true);
  cloudRow(g, rng.fork('r3'), pal, B, by + 130, 90, 130, 0.64, lighten(pal.cloud, 0.0), true);
  cloudRow(g, rng.fork('r4'), pal, B, B.y + B.h + 10, 100, 140, 0.62, null, false);
}

function compSun(g, rng, pal, B) {
  const cx = CW / 2, cy = CH / 2;
  // угловые радуги
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
    g.translate(cx + sx * B.w / 2, cy + sy * B.h / 2); g.scale(-sx, -sy);
    // четверть-радуга вокруг угла
    RAINBOW.forEach((c, i) => { g.beginPath(); g.arc(0, 0, 76 - i * 10, 0, Math.PI / 2); g.lineWidth = 10.8; g.lineCap = 'butt'; g.strokeStyle = css(pal.night ? darken(c, 0.15) : c); g.stroke(); });
    g.restore();
  }
  // лучи
  g.save(); g.translate(cx, cy);
  for (let i = 0; i < 24; i++) { g.save(); g.rotate(i * TAU / 24); g.beginPath(); g.moveTo(0, 0); g.lineTo(-12, -300); g.lineTo(12, -300); g.closePath(); g.fillStyle = css([255, 255, 255], i % 2 ? 0.1 : 0.2); g.fill(); g.restore(); }
  g.restore();
  // кольцо облаков
  const N = 10;
  const ring = [];
  for (let i = 0; i < N; i++) { const a = (i / N) * TAU - Math.PI / 2; ring.push([cx + Math.cos(a) * 92, cy + Math.sin(a) * 178, i]); }
  ring.sort((a, b) => a[1] - b[1]);
  for (const [x, y, i] of ring) { g.save(); g.translate(x, y + 18); cloud(g, 78, pal, i % 3, i % 3 === 0, i % 2 ? null : mix(pal.cloud, pal.shade, 0.15)); g.restore(); }
  // центральный диск
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.arc(0, 0, 104, 0, TAU); g.fillStyle = css(pal.cloud, 0.28); g.fill();
  g.beginPath(); g.arc(0, 0, 92, 0, TAU); g.fillStyle = css(pal.sun, 0.25); g.fill();
  g.beginPath(); g.arc(0, 0, 80, 0, TAU); g.setLineDash([3, 6]); line(g, pal.ink, 1.6, 0.6); g.setLineDash([]);
  if (pal.night) moon(g, 56, pal); else sun(g, 52, pal, 14);
  g.restore();
  for (let i = 0; i < 5; i++) bird(g, cx - 60 + i * 30, cy - 130 - (i % 2) * 14, 7, pal.night ? [220, 220, 255] : pal.ink);
}

function compLayers(g, rng, pal, B) {
  const cx = CW / 2;
  const hy = B.y + 170;
  rainbow(g, cx + rng.range(-20, 20), hy + 40, 100, 12, pal, 0.95);
  g.save(); g.translate(B.x + 56, B.y + 46); if (pal.night) moon(g, 22, pal); else sun(g, 20, pal, 12); g.restore();
  // воздушный шар
  g.save(); g.translate(cx + rng.range(10, 50), B.y + 90); g.rotate(rng.range(-0.1, 0.1)); balloon(g, 70, pal.night ? [255, 120, 180] : [255, 120, 120], pal.night ? [255, 220, 100] : [255, 232, 130], pal); g.restore();
  for (let i = 0; i < 3; i++) bird(g, B.x + 40 + i * 24, B.y + 150 - (i % 2) * 10, 7 - i, pal.night ? [220, 220, 255] : pal.ink);
  // слои облаков
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y = hy + 40 + r * ((B.y + B.h - hy - 20) / (rows - 1));
    const k = r / (rows - 1);
    cloudRow(g, rng.fork('l' + r), pal, B, y, 60 + k * 60, 88 + k * 60, 0.55, mix(pal.cloud, pal.shade, 0.35 - k * 0.3), k > 0.2);
  }
}

export default {
  id: 'clouds',
  name: 'Облака',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    pal.night = pal.top[2] < 130 && pal.top[0] < 80;
    const variant = rng.int(0, 2);
    const inset = border(g, pal, rng, variant);
    const B = { x: inset, y: inset, w: CW - 2 * inset, h: CH - 2 * inset };
    g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
    skyBg(g, B, pal, rng.fork('sky'));
    [compRainbow, compSun, compLayers][variant](g, rng.fork('comp'), pal, B);
    g.restore();
    g.strokeStyle = css(darken(pal.border, 0.45)); g.lineWidth = 2; g.strokeRect(B.x - 1, B.y - 1, B.w + 2, B.h + 2);
    return { edge: pal.edge, fringe: mix(pal.border2, [255, 255, 255], 0.4) };
  },
};
