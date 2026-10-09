// Персидский ковёр: лепная кайма, центральный медальон, арабески в поле, угловые четверти.
import { CW, CH, css, darken, lighten, mix, pickPalette, polar, star, rosette, palmette, vine, quad, alongRect, petalPath, lozenge, RNG } from '../kit.js';

const PALS = [
  { field: [122, 27, 34], field2: [150, 44, 50], border: [20, 50, 90], accent: [217, 179, 107], accent2: [45, 122, 130], ink: [242, 228, 192], dark: [42, 13, 16], edge: [60, 19, 22] },
  { field: [23, 40, 79], field2: [40, 62, 112], border: [122, 27, 34], accent: [217, 179, 107], accent2: [155, 58, 58], ink: [240, 228, 196], dark: [10, 18, 40], edge: [18, 28, 58] },
  { field: [15, 76, 85], field2: [28, 100, 108], border: [122, 42, 42], accent: [226, 190, 120], accent2: [190, 90, 70], ink: [244, 232, 200], dark: [6, 36, 42], edge: [10, 52, 58] },
  { field: [233, 223, 199], field2: [220, 206, 176], border: [138, 47, 42], accent: [184, 137, 61], accent2: [44, 91, 110], ink: [59, 42, 34], dark: [90, 60, 40], edge: [110, 40, 36] },
  { field: [56, 46, 92], field2: [78, 64, 120], border: [170, 120, 60], accent: [232, 200, 130], accent2: [120, 170, 150], ink: [244, 236, 214], dark: [24, 18, 44], edge: [36, 28, 66] },
];

function medallion(g, pal, R, rng) {
  const sy = 1.42;
  g.save(); g.scale(1, sy);
  // ореол
  polar(g, 0, 0, 0, (a) => R * 1.12 * (1 + 0.07 * Math.cos(8 * a)));
  g.fillStyle = css(pal.dark, 0.35); g.fill();
  // основной лепестковый контур
  polar(g, 0, 0, 0, (a) => R * (1 + 0.1 * Math.cos(8 * a) + 0.04 * Math.cos(16 * a)));
  g.fillStyle = css(pal.accent2); g.fill();
  g.lineWidth = 2.4; g.strokeStyle = css(pal.accent); g.stroke();
  polar(g, 0, 0, 0, (a) => R * 0.84 * (1 + 0.08 * Math.cos(8 * a + 0.4)));
  g.fillStyle = css(mix(pal.field, pal.dark, 0.15)); g.fill();
  g.lineWidth = 1.2; g.strokeStyle = css(pal.ink, 0.75); g.stroke();
  g.restore();

  g.save(); g.scale(1, sy);
  // звезда
  star(g, 0, 0, R * 0.74, R * 0.5, 16, 0);
  g.fillStyle = css(pal.border); g.fill();
  g.lineWidth = 1.2; g.strokeStyle = css(pal.accent); g.stroke();
  star(g, 0, 0, R * 0.48, R * 0.3, 8, Math.PI / 8);
  g.fillStyle = css(pal.accent); g.fill();
  g.lineWidth = 1; g.strokeStyle = css(pal.dark, 0.7); g.stroke();
  g.restore();
  // розетка в центре
  rosette(g, 0, 0, R * 0.42, 12, pal.field2, pal.ink, pal.accent2);
  // кольцо мелких пальметт
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.save(); g.translate(Math.cos(a) * R * 0.66, Math.sin(a) * R * 0.66 * sy); g.rotate(a + Math.PI / 2);
    palmette(g, R * 0.15, pal.ink, pal.accent, pal.dark);
    g.restore();
  }
  // подвески сверху и снизу
  for (const s of [-1, 1]) {
    g.save(); g.translate(0, s * R * sy * 1.18); g.scale(1, s);
    lozenge(g, 0, 0, R * 0.2, R * 0.34); g.fillStyle = css(pal.accent); g.fill();
    g.lineWidth = 1.2; g.strokeStyle = css(pal.dark); g.stroke();
    lozenge(g, 0, 0, R * 0.09, R * 0.17); g.fillStyle = css(pal.field2); g.fill();
    g.restore();
  }
}

function border(g, pal, rng) {
  const x0 = 6, band = 40;
  // фон каймы
  g.fillStyle = css(pal.border); g.fillRect(0, 0, CW, CH);
  // тонкие полосы
  const lines = [[6, 3, pal.accent], [10, 2, pal.dark], [x0 + band + 1, 2, pal.dark], [x0 + band + 4, 3, pal.accent]];
  for (const [o, w, c] of lines) {
    g.strokeStyle = css(c); g.lineWidth = w;
    g.strokeRect(o + w / 2, o + w / 2, CW - 2 * o - w, CH - 2 * o - w);
  }
  // лоза по центру каймы
  const cx0 = x0 + band / 2 + 1;
  const path = [];
  const W = CW - 2 * cx0, H = CH - 2 * cx0;
  const per = 2 * (W + H);
  const N = 54;
  const pt = (t) => {
    t = ((t % per) + per) % per;
    if (t < W) return [cx0 + t, cx0, 0, 1];
    t -= W; if (t < H) return [cx0 + W, cx0 + t, -1, 0];
    t -= H; if (t < W) return [cx0 + W - t, cx0 + H, 0, -1];
    t -= W; return [cx0, cx0 + H - t, 1, 0];
  };
  g.strokeStyle = css(pal.accent, 0.9); g.lineWidth = 2;
  g.beginPath();
  for (let i = 0; i <= N * 8; i++) {
    const t = (i / (N * 8)) * per;
    const [x, y, nx, ny] = pt(t);
    const off = Math.sin((i / 8) * Math.PI) * 8;
    const px = x + nx * off, py = y + ny * off;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.stroke();
  for (let i = 0; i < N; i++) {
    const [x, y, nx, ny] = pt(((i + 0.5) / N) * per);
    const side = i % 2 ? 1 : -1;
    g.save(); g.translate(x + nx * side * 9, y + ny * side * 9);
    g.rotate(Math.atan2(ny, nx) + (side > 0 ? 0 : Math.PI) - Math.PI / 2 + Math.PI);
    if (i % 3 === 0) { rosette(g, 0, 0, 9, 8, pal.accent2, pal.ink, pal.accent); }
    else { palmette(g, 12, pal.accent, pal.ink, pal.dark); }
    g.restore();
  }
  // угловые розетки
  for (const [x, y] of [[x0 + band / 2 + 1, x0 + band / 2 + 1], [CW - x0 - band / 2 - 1, x0 + band / 2 + 1], [x0 + band / 2 + 1, CH - x0 - band / 2 - 1], [CW - x0 - band / 2 - 1, CH - x0 - band / 2 - 1]]) {
    g.beginPath(); g.arc(x, y, 17, 0, Math.PI * 2); g.fillStyle = css(pal.dark); g.fill();
    rosette(g, x, y, 15, 12, pal.accent, pal.dark, pal.accent2);
  }
  return x0 + band + 7;
}

export default {
  id: 'persian',
  name: 'Персидский',
  paint(g, rng) {
    const pal = pickPalette(rng, PALS);
    const inset = border(g, pal, rng);
    const fx = inset, fy = inset, fw = CW - 2 * inset, fh = CH - 2 * inset;
    // поле
    g.fillStyle = css(pal.field); g.fillRect(fx, fy, fw, fh);
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    // решётка из ромбиков
    g.fillStyle = css(pal.field2, 0.55);
    for (let y = fy; y < fy + fh; y += 14) for (let x = fx + ((y / 14) % 2) * 7; x < fx + fw; x += 14) {
      lozenge(g, x, y, 2.6, 3.6); g.fill();
    }
    const cx = CW / 2, cy = CH / 2;
    const seed = rng.s;
    // арабески по четвертям
    quad(g, cx, cy, (q) => {
      const r = new RNG(seed);
      const hw = fw / 2, hh = fh / 2;
      for (let k = 0; k < 4; k++) {
        const pts = [];
        let x = r.range(20, 70), y = r.range(30, 120) + k * 20;
        const steps = 8;
        for (let i = 0; i < steps; i++) {
          pts.push([x, y]);
          x += r.range(14, 28) * (k % 2 ? 1 : 0.8);
          y += r.range(18, 34);
          x = Math.min(x, hw - 6); y = Math.min(y, hh - 6);
        }
        const flowerCols = [pal.accent, pal.field];
        vine(q, pts, pal.accent, k % 2 ? pal.accent2 : mix(pal.accent, pal.ink, 0.4), flowerCols, 2);
      }
      // угловая четверть-медальон
      q.save(); q.translate(hw, hh);
      q.beginPath(); q.arc(0, 0, 54, Math.PI, Math.PI * 1.5); q.lineTo(0, 0); q.closePath();
      q.fillStyle = css(pal.accent2, 0.9); q.fill(); q.lineWidth = 2; q.strokeStyle = css(pal.accent); q.stroke();
      q.beginPath(); q.arc(0, 0, 38, Math.PI, Math.PI * 1.5); q.lineTo(0, 0); q.closePath();
      q.fillStyle = css(pal.border); q.fill(); q.strokeStyle = css(pal.ink, 0.7); q.lineWidth = 1; q.stroke();
      rosette(q, -18, -18, 15, 10, pal.accent, pal.dark, pal.ink);
      q.restore();
      // боковые ромбы
      q.save(); q.translate(hw - 14, 0);
      lozenge(q, 0, 0, 12, 22); q.fillStyle = css(pal.accent); q.fill(); q.lineWidth = 1.2; q.strokeStyle = css(pal.dark); q.stroke();
      lozenge(q, 0, 0, 6, 12); q.fillStyle = css(pal.accent2); q.fill();
      q.restore();
    });
    // медальон
    g.save(); g.translate(cx, cy);
    medallion(g, pal, 84, rng);
    g.restore();
    g.restore();
    return { edge: pal.edge, fringe: [240, 232, 212] };
  },
};
