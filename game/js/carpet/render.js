// Сборка ковра: стиль рисует тело, затем ткань, кромка, свет и бахрома.
import { RNG, hashString } from '../util.js';
import { CW, CH, css, hex, darken, lighten, mix } from './kit.js';
import { STYLES } from './styles/index.js';

export const FRINGE = 24;
export { CW, CH };

let weaveTile = null;
function getWeave(scale) {
  const key = Math.max(1, Math.round(scale));
  if (weaveTile && weaveTile.key === key) return weaveTile.pat;
  const c = document.createElement('canvas');
  c.width = c.height = 3 * key;
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(0,0,0,0.10)';
  g.fillRect(0, 0, c.width, key * 0.9);
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.fillRect(0, key * 1.5, c.width, key * 0.7);
  g.fillStyle = 'rgba(0,0,0,0.06)';
  g.fillRect(0, 0, key * 0.8, c.height);
  weaveTile = { key, pat: g.createPattern(c, 'repeat') };
  return weaveTile.pat;
}

function makeNoise(seed, size = 160) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const id = g.createImageData(size, size);
  const rng = new RNG(seed);
  for (let i = 0; i < size * size; i++) {
    const v = rng.next() * 255;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
    id.data[i * 4 + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  return c;
}
let noiseCanvas = null;

/**
 * Рисует ковёр. spec: { style, seed }. Возвращает canvas размером (CW*scale) x ((CH+2*FRINGE)*scale).
 * Тело ковра начинается на y=FRINGE.
 */
export function renderCarpet(spec, scale = 2) {
  const style = STYLES[spec.style] || STYLES.persian;
  const rng = new RNG(spec.seed ?? hashString(spec.style));
  const c = document.createElement('canvas');
  c.width = Math.round(CW * scale);
  c.height = Math.round((CH + FRINGE * 2) * scale);
  const g = c.getContext('2d');
  g.scale(scale, scale);
  g.lineJoin = 'round'; g.lineCap = 'round';

  // тело
  g.save();
  g.translate(0, FRINGE);
  g.beginPath(); g.rect(0, 0, CW, CH); g.clip();
  const info = style.paint(g, rng, spec) || {};
  const edge = info.edge || [60, 40, 30];

  // ткань
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = getWeave(scale);
  g.save(); g.scale(1 / Math.max(1, Math.round(scale)), 1 / Math.max(1, Math.round(scale)));
  g.fillRect(0, 0, CW * Math.max(1, Math.round(scale)), CH * Math.max(1, Math.round(scale)));
  g.restore();
  if (!noiseCanvas) noiseCanvas = makeNoise(77);
  g.globalAlpha = 0.07; g.globalCompositeOperation = 'overlay';
  g.drawImage(noiseCanvas, 0, 0, CW, CH);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';

  // мягкий свет и объём
  const sheen = g.createLinearGradient(0, 0, CW, CH);
  sheen.addColorStop(0, 'rgba(255,255,255,0.13)');
  sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.16)');
  g.fillStyle = sheen; g.fillRect(0, 0, CW, CH);
  const vig = g.createRadialGradient(CW / 2, CH / 2, CH * 0.28, CW / 2, CH / 2, CH * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.20)');
  g.fillStyle = vig; g.fillRect(0, 0, CW, CH);

  // кромка (оверлок)
  const e = 5;
  g.fillStyle = css(edge); g.fillRect(0, 0, CW, e); g.fillRect(0, CH - e, CW, e);
  g.fillRect(0, 0, e, CH); g.fillRect(CW - e, 0, e, CH);
  g.strokeStyle = css(lighten(edge, 0.25), 0.55); g.lineWidth = 0.8;
  for (let x = 2; x < CW; x += 4) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 1.6, e); g.stroke();
    g.beginPath(); g.moveTo(x, CH); g.lineTo(x + 1.6, CH - e); g.stroke();
  }
  for (let y = 2; y < CH; y += 4) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(e, y + 1.6); g.stroke();
    g.beginPath(); g.moveTo(CW, y); g.lineTo(CW - e, y + 1.6); g.stroke();
  }
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
  g.strokeRect(e + 0.5, e + 0.5, CW - 2 * e - 1, CH - 2 * e - 1);
  g.restore();

  // бахрома (сверху и снизу)
  const fr = new RNG((spec.seed ?? 1) ^ 0xf00d);
  const fc = info.fringe || [236, 226, 204];
  for (const top of [true, false]) {
    for (let x = 3; x < CW - 2; x += 2.6) {
      const len = FRINGE * fr.range(0.62, 0.98);
      const sway = fr.range(-3.2, 3.2);
      const y0 = top ? FRINGE + 1 : FRINGE + CH - 1;
      const dir = top ? -1 : 1;
      const col = mix(fc, [150, 130, 100], fr.range(0, 0.35));
      g.strokeStyle = css(col, 0.95); g.lineWidth = fr.range(1, 1.6);
      g.beginPath(); g.moveTo(x, y0);
      g.bezierCurveTo(x + sway * 0.3, y0 + dir * len * 0.35, x + sway, y0 + dir * len * 0.7, x + sway * 1.3, y0 + dir * len);
      g.stroke();
    }
    // тень от края на бахроме
    const sh = g.createLinearGradient(0, top ? FRINGE : FRINGE + CH, 0, top ? FRINGE - 7 : FRINGE + CH + 7);
    sh.addColorStop(0, 'rgba(0,0,0,0.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, top ? FRINGE - 7 : FRINGE + CH, CW, 7);
  }
  return c;
}

export function carpetBodyRect(scale) {
  return { x: 0, y: FRINGE * scale, w: CW * scale, h: CH * scale };
}
