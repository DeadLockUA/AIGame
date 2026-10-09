// Отрисовка ковра во время мойки: база, влага, грязь, пена, находки, тьма, частицы.
import { GW, GH, GN } from './engine.js';
import { DIRT, NDIRT, STAIN_COLORS, ALL_PRODUCTS } from '../data/gear.js';
import { renderCarpet, FRINGE, CW, CH } from '../carpet/render.js';
import { Particles, star4 } from './fx.js';
import { RNG, clamp, smoothstep } from '../util.js';

export const TOTAL_H = CH + FRINGE * 2;

export class WashView {
  constructor(canvas, engine, spec) {
    this.canvas = canvas; this.g = canvas.getContext('2d');
    this.eng = engine; this.spec = spec;
    this.fx = new Particles();
    this.noise = new Float32Array(GN);
    const r = new RNG(spec.seed ^ 0x1234);
    for (let i = 0; i < GN; i++) this.noise[i] = 0.82 + r.next() * 0.3;
    this.layer = {};
    for (const k of ['dirt', 'foam', 'wet', 'dark']) {
      const c = document.createElement('canvas'); c.width = GW; c.height = GH;
      this.layer[k] = { c, g: c.getContext('2d'), id: null };
      this.layer[k].id = this.layer[k].g.createImageData(GW, GH);
    }
    this.cursor = null; // { x, y, r (px), phase, down }
    this.dark = engine.quirks.some((q) => q.id === 'dark');
    this.time = 0;
    this.collecting = [];
    this.setSize(canvas.width, canvas.height, 1);
  }

  setSize(w, h, scale) {
    this.scale = scale;
    this.W = w; this.H = h; // размер в device-пикселях
    this.carpet = renderCarpet(this.spec, Math.max(1, Math.min(2, w / CW)));
    this.sx = w / CW; this.sy = h / TOTAL_H;
  }

  // сетка -> пиксели канваса
  gx(x) { return (x / GW) * CW * this.sx; }
  gy(y) { return (FRINGE + (y / GH) * CH) * this.sy; }
  // пиксели канваса -> сетка
  toGrid(px, py) { return [(px / this.sx / CW) * GW, ((py / this.sy - FRINGE) / CH) * GH]; }

  sway(t) {
    const q = this.eng.quirks.find((q) => q.id === 'sway');
    return q ? Math.sin(t * q.speed) * q.amp * GW : 0;
  }

  updateLayers() {
    const e = this.eng;
    const dirt = this.layer.dirt.id.data, foam = this.layer.foam.id.data, wet = this.layer.wet.id.data, dark = this.layer.dark.id.data;
    const prods = e.productList.map((id) => ALL_PRODUCTS[id]);
    for (let i = 0; i < GN; i++) {
      // грязь
      let ar = 0, ag = 0, ab = 0, inv = 1, wsum = 0;
      for (let t = 0; t < NDIRT; t++) {
        const a = e.dirt[t][i];
        if (a <= 0.015) continue;
        const v = smoothstep(0.03, 0.55, a) * DIRT[t].alpha;
        let c = DIRT[t].color;
        if (t === 5) c = STAIN_COLORS[e.stainVar[i] % 3];
        ar += c[0] * v; ag += c[1] * v; ab += c[2] * v; wsum += v;
        inv *= 1 - v;
      }
      const o = i * 4;
      if (wsum > 0) {
        const n = this.noise[i];
        dirt[o] = Math.min(255, (ar / wsum) * n); dirt[o + 1] = Math.min(255, (ag / wsum) * n); dirt[o + 2] = Math.min(255, (ab / wsum) * n);
        dirt[o + 3] = (1 - inv) * 255 * (0.9 + (n - 0.82) * 0.4);
      } else dirt[o + 3] = 0;
      // пена
      const f = e.foam[i];
      if (f > 0.03) {
        const pidx = e.foamProd[i];
        const prod = pidx ? prods[pidx - 1] : null;
        let r = 255, gg = 255, b = 255;
        if (prod) {
          const dwell = prod.dwell * e.app.dwellMul;
          const df = clamp(e.foamAge[i] / dwell, 0, 1);
          const k = 0.15 + 0.85 * df;
          r = 255 + (prod.color[0] * 0.78 - 255) * k; gg = 255 + (prod.color[1] * 0.78 - 255) * k; b = 255 + (prod.color[2] * 0.78 - 255) * k;
        }
        const hh = Math.imul(i ^ (i >>> 5), 2654435761) ^ Math.imul(i >>> 3, 374761393);
        const hi = ((hh >>> 8) & 0xffff) / 65535;
        const sparkle = hi > 0.93 && f > 0.18 ? 1 : 0;
        foam[o] = sparkle ? 255 : r; foam[o + 1] = sparkle ? 255 : gg; foam[o + 2] = sparkle ? 255 : b;
        foam[o + 3] = smoothstep(0.02, 0.2, f) * (sparkle ? 255 : 238);
      } else foam[o + 3] = 0;
      // влага
      const w = e.wet[i];
      wet[o] = 24; wet[o + 1] = 52; wet[o + 2] = 96; wet[o + 3] = w * 78;
      // тьма
      if (this.dark) { dark[o] = 8; dark[o + 1] = 6; dark[o + 2] = 18; dark[o + 3] = 238 * (1 - Math.min(1, e.lit[i] * 1.4)); }
    }
    for (const k of ['dirt', 'foam', 'wet']) this.layer[k].g.putImageData(this.layer[k].id, 0, 0);
    if (this.dark) this.layer.dark.g.putImageData(this.layer.dark.id, 0, 0);
  }

  drawBody(g, withFoam, withDark) {
    const bx = 0, by = FRINGE * this.sy, bw = CW * this.sx, bh = CH * this.sy;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'medium';
    g.save();
    g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
    g.drawImage(this.layer.wet.c, bx, by, bw, bh);
    g.drawImage(this.layer.dirt.c, bx, by, bw, bh);
    if (withFoam) g.drawImage(this.layer.foam.c, bx, by, bw, bh);
    if (withDark && this.dark) g.drawImage(this.layer.dark.c, bx, by, bw, bh);
    g.restore();
  }

  /** Кадр «до»: ковёр с грязью, без пены. */
  snapshotBefore() {
    this.updateLayers();
    const c = document.createElement('canvas'); c.width = this.carpet.width; c.height = this.carpet.height;
    const g = c.getContext('2d');
    g.drawImage(this.carpet, 0, 0);
    const keep = [this.sx, this.sy];
    this.sx = c.width / CW; this.sy = c.height / TOTAL_H;
    this.drawBody(g, false, false);
    [this.sx, this.sy] = keep;
    return c;
  }

  /** Текущий вид ковра (с остатками грязи, без пены). */
  snapshotNow() {
    this.updateLayers();
    const c = document.createElement('canvas'); c.width = this.carpet.width; c.height = this.carpet.height;
    const g = c.getContext('2d');
    g.drawImage(this.carpet, 0, 0);
    const keep = [this.sx, this.sy];
    this.sx = c.width / CW; this.sy = c.height / TOTAL_H;
    this.drawBody(g, false, false);
    [this.sx, this.sy] = keep;
    return c;
  }

  addEvents(events) {
    for (const ev of events) {
      if (ev.type === 'sparkle') this.fx.sparkle(this.gx(ev.x), this.gy(ev.y));
    }
  }

  emit(phase, fxres, px, py, dt) {
    const e = this.eng;
    const rate = Math.min(1, (fxres?.rate ?? 0));
    const n = dt * 60 * (0.4 + rate);
    const prod = null;
    for (let i = 0; i < n; i++) {
      if (phase === 'vacuum' && Math.random() < 0.5) this.fx.dust(px + (Math.random() - 0.5) * 60, py + (Math.random() - 0.5) * 60, px, py);
      else if (phase === 'apply' && Math.random() < 0.45) this.fx.bubble(px, py, '255,255,255');
      else if (phase === 'rinse') {
        if (e.rin.steam) { if (Math.random() < 0.5) this.fx.steam(px, py); }
        else if (Math.random() < 0.9) this.fx.drop(px, py);
      }
    }
  }

  render(dt, t, state) {
    this.time = t;
    const g = this.g;
    this.fx.update(dt);
    this.updateLayers();
    const off = this.eng.quirks.some((q) => q.id === 'sway') ? this.sway(t) / GW * CW * this.sx : 0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.W, this.H);
    g.save();
    g.translate(off, 0);
    g.drawImage(this.carpet, 0, 0, this.W, this.H);
    this.drawBody(g, true, true);
    // находки
    for (const f of this.eng.finds) {
      if (!f.revealed || f.collected) continue;
      const x = this.gx(f.x), y = this.gy(f.y);
      const p = 0.5 + 0.5 * Math.sin(t * 5);
      const R = 18 + p * 5;
      const gr = g.createRadialGradient(x, y, 2, x, y, R + 12);
      gr.addColorStop(0, 'rgba(255,240,150,.95)'); gr.addColorStop(1, 'rgba(255,240,150,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R + 12, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(x, y, 15, 0, 6.3); g.fill();
      g.font = '18px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#000'; g.fillText(f.emoji || '✨', x, y + 1);
      g.fillStyle = 'rgba(255,226,120,1)'; star4(g, x + 14, y - 14, 5 + p * 2);
    }
    this.fx.draw(g);
    g.restore();
    // курсор
    if (this.cursor) {
      const c = this.cursor;
      g.strokeStyle = c.down ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.55)';
      g.lineWidth = 2; g.setLineDash([6, 5]);
      g.beginPath(); g.arc(c.x, c.y, c.r, 0, 6.3); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fill();
    }
    // летящие находки
    for (let i = this.collecting.length - 1; i >= 0; i--) {
      const c = this.collecting[i];
      c.t += dt * 1.6;
      const k = Math.min(1, c.t);
      const e = k * k * (3 - 2 * k);
      const x = c.x + (c.tx - c.x) * e, y = c.y + (c.ty - c.y) * e - Math.sin(k * Math.PI) * 40;
      g.font = `${22 * (1 - k * 0.5)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#000'; g.fillText(c.emoji, x, y);
      if (k >= 1) this.collecting.splice(i, 1);
    }
  }
}
