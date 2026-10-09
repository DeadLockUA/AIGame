// Бот-игрок для балансировки и тестов проходимости. Работает с чистым движком.
import { WashEngine, GW, GH } from '../wash/engine.js';
import { fillDirt } from '../wash/dirtgen.js';
import { DIRT, NDIRT, ALL_PRODUCTS } from '../data/gear.js';

const LANE = (r) => Math.max(2, r * 1.5);

function bandDirt(eng, y0, y1, types) {
  let s = 0;
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(GH, Math.ceil(y1)); y++) {
    for (let x = 0; x < GW; x++) {
      const i = y * GW + x;
      for (const t of types) s += eng.dirt[t][i] * DIRT[t].weight;
    }
  }
  return s;
}

class Pointer {
  constructor(eng, speed) { this.eng = eng; this.x = 0; this.y = 0; this.speed = speed; this.dt = 1 / 30; }
  get over() { return this.eng.time >= this.eng.limit + (this.eng.grace ?? 0); }
  moveTo(tx, ty, phase, ctx = {}, stamp = true) {
    const e = this.eng;
    while (!this.over) {
      const dx = tx - this.x, dy = ty - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * this.dt;
      let nx = tx, ny = ty;
      if (dist > step) { nx = this.x + dx / dist * step; ny = this.y + dy / dist * step; }
      if (stamp) e.apply(phase, this.x, this.y, nx, ny, this.dt, { ...ctx, speed: this.speed, held: 0 });
      e.tick(this.dt);
      this.x = nx; this.y = ny;
      if (dist <= step) return true;
    }
    return false;
  }
  wait(sec) {
    for (let t = 0; t < sec && !this.over; t += this.dt) this.eng.tick(this.dt);
  }
}

function dominantProduct(eng, y0, y1) {
  let best = null, bestV = 0;
  for (const pid of eng.productList) {
    if ((eng.stock.products[pid] || 0) <= 0) continue;
    const p = ALL_PRODUCTS[pid];
    let v = 0;
    for (let t = 3; t < NDIRT; t++) {
      let s = 0;
      for (let y = Math.max(0, Math.floor(y0)); y < Math.min(GH, Math.ceil(y1)); y++) for (let x = 0; x < GW; x++) s += eng.dirt[t][y * GW + x];
      v += s * DIRT[t].weight * p.aff[t] * p.rate;
    }
    v /= Math.pow(p.price, 0.7);
    if (v > bestV) { bestV = v; best = pid; }
  }
  return best;
}

function sweep(ptr, phase, rad, types, ctxFn, opts = {}) {
  const eng = ptr.eng;
  const lane = LANE(rad);
  let dir = 1;
  for (let y = rad * 0.8; y < GH + lane; y += lane) {
    const yy = Math.min(GH - 1, y);
    if (bandDirt(eng, yy - lane / 2 - rad * 0.3, yy + lane / 2 + rad * 0.3, types) < (opts.skip ?? 0.6)) continue;
    const ctx = ctxFn(yy);
    if (ctx === null) continue;
    const xa = dir > 0 ? rad * 0.5 : GW - rad * 0.5, xb = dir > 0 ? GW - rad * 0.5 : rad * 0.5;
    ptr.moveTo(xa, yy, phase, ctx, false);
    if (!ptr.moveTo(xb, yy, phase, ctx, true)) return false;
    dir = -dir;
  }
  return true;
}

/**
 * Проходит ковёр. Возвращает { time, clean, used, done, eng }.
 * o: { profile, seed, kit, limit, speed (клеток/с), quirks, finds, target, grace }
 */
export function runBot(o) {
  const eng = new WashEngine({ limit: o.limit ?? 300, kit: o.kit, quirks: o.quirks, seed: o.seed, finds: o.finds });
  eng.grace = o.grace ?? 0;
  fillDirt(eng, o.profile, o.seed);
  const ptr = new Pointer(eng, o.speed ?? 40);
  const target = o.target ?? 96;
  const wetTypes = [3, 4, 5, 6, 7], dryTypes = [0, 1, 2];
  const guard = () => !ptr.over && eng.cleanPct < target;
  const phases = [];
  const mark = (n) => { eng.updateMetrics(); phases.push({ n, t: +eng.time.toFixed(1), c: +eng.cleanPct.toFixed(1) }); };

  for (let pass = 0; pass < 3 && guard(); pass++) {
    if (!sweep(ptr, 'vacuum', eng.vac.radius, dryTypes, () => ({}), { skip: pass === 0 ? 0.4 : 1.2 })) break;
    mark('vac' + pass);
    if (bandDirt(eng, 0, GH, dryTypes) < eng.initial * 0.02) break;
  }
  for (let round = 0; round < 3 && guard(); round++) {
    if (round === 0 || bandDirt(eng, 0, GH, wetTypes) > eng.initial * 0.03) {
      const ok = sweep(ptr, 'apply', eng.app.radius, wetTypes, (yy) => {
        const pid = dominantProduct(eng, yy - 4, yy + 4);
        return pid ? { product: pid } : null;
      }, { skip: round === 0 ? 0.5 : 1.0 });
      mark('app' + round);
      if (!ok) break;
    }
    ptr.wait(1.5);
    for (let rp = 0; rp < 2 && guard(); rp++) {
      if (!sweep(ptr, 'rinse', eng.rin.radius, [...wetTypes, ...dryTypes], () => ({}), { skip: rp === 0 ? 0.3 : 1.2 })) break;
      mark('rin' + round + rp);
    }
  }
  eng.updateMetrics();
  eng.collectAllRevealed();
  return { time: eng.time, clean: eng.cleanPct, used: eng.used, done: eng.cleanPct >= target, eng, phases };
}
