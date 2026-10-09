// Чистая симуляция мойки (без DOM). Сетка клеток; три фазы: пылесос -> средство -> смыв.
import { DIRT, D, NDIRT, ALL_TOOLS, ALL_PRODUCTS, ALL_FILTERS, ALL_MODS, WATER_AFF, STEAM_AFF } from '../data/gear.js';
import { RNG, clamp } from '../util.js';

export const GW = 72;
export const GH = 108;
export const GN = GW * GH;
const BLOCK = 6; // блоки 6x6 для искр «участок чист»
const BW = GW / BLOCK, BH = GH / BLOCK;

// Эффективные характеристики инструмента с учётом модификаторов.
export function resolveTool(id, mods = []) {
  const base = ALL_TOOLS[id];
  const s = { ...base, heat: 1, appeal: 0, filterCap: 1, dwellMul: 1, usageMul: 1, flowMul: 1 };
  for (const mid of mods) {
    const m = ALL_MODS[mid];
    if (!m || m.slot !== slotOf(base)) continue;
    const st = m.stats;
    if (st.radius) s.radius *= st.radius;
    if (st.power) s.power = (s.power ?? 0) * st.power;
    if (st.pressure) s.pressure = (s.pressure ?? 0) * st.pressure;
    if (st.usage) s.usageMul *= st.usage;
    if (st.dwell) s.dwellMul *= st.dwell;
    if (st.flow) s.flowMul *= st.flow;
    if (st.filterCap) s.filterCap *= st.filterCap;
    if (st.heat) s.heat *= st.heat;
    if (st.appeal) s.appeal += st.appeal;
  }
  return s;
}
function slotOf(t) {
  if (t.power !== undefined && t.aff) return 'vacuum';
  if (t.deposit !== undefined) return 'applicator';
  return 'rinse';
}

export class WashEngine {
  /**
   * @param {object} o
   * @param {number} o.limit лимит времени, сек
   * @param {object} o.kit { vacuum, applicator, rinse, mods:{vacuum:[],applicator:[],rinse:[]}, stock:{products:{id:n}, filter, water, steam} }
   * @param {Array}  o.quirks список { id, ... }
   */
  constructor(o) {
    this.W = GW; this.H = GH; this.N = GN;
    this.rng = new RNG(o.seed ?? 1);
    this.limit = o.limit ?? 120;
    this.time = 0;
    this.quirks = o.quirks || [];
    this.dirt = DIRT.map(() => new Float32Array(GN));
    this.loose = DIRT.map(() => new Float32Array(GN));
    this.foam = new Float32Array(GN);
    this.foamProd = new Uint8Array(GN);
    this.foamAge = new Float32Array(GN);
    this.wet = new Float32Array(GN);
    this.stainVar = new Uint8Array(GN);
    this.lit = new Float32Array(GN);
    this.finds = (o.finds || []).map((f) => ({ ...f, revealed: false, collected: false }));
    this.events = [];
    const kit = o.kit;
    this.vac = resolveTool(kit.vacuum, kit.mods?.vacuum);
    this.app = resolveTool(kit.applicator, kit.mods?.applicator);
    this.rin = resolveTool(kit.rinse, kit.mods?.rinse);
    this.stock = {
      products: { ...(kit.stock?.products || {}) },
      water: kit.stock?.water ?? 0,
      steam: kit.stock?.steam ?? 0,
    };
    this.filter = ALL_FILTERS[kit.stock?.filter] || null;
    this.filterLoad = 0;
    this.productList = Object.keys(this.stock.products);
    this.used = { products: {}, water: 0, steam: 0 };
    this.heavy = (this.quirks.find((q) => q.id === 'heavy')?.mul ?? 1) * (o.heavyExtra ?? 1);
    this.rateBoost = kit.bonus?.rate ?? 1;
    this.dryMul = kit.bonus?.dry ?? 1;
    this.initial = 1; // нормирующий вес, считается после заполнения
    this.cleanPct = 0;
    this.blockPrev = new Float32Array(BW * BH);
    this.metricTimer = 0;
    this.ghostTimer = 0;
    this.regrowTimer = 0;
    this.shakeCd = 0;
    this.stats = { strokes: { vacuum: 0, apply: 0, rinse: 0 } };
  }

  // Вызывать после заполнения грязью.
  finalize() {
    this.initial = Math.max(1e-6, this.remainingWeight());
    this.initialDirtTypes = DIRT.map((_, t) => this.dirt[t].reduce((a, b) => a + b, 0));
    this.updateMetrics(true);
  }

  remainingWeight() {
    let s = 0;
    for (let t = 0; t < NDIRT; t++) {
      const a = this.dirt[t]; let sum = 0;
      for (let i = 0; i < GN; i++) sum += a[i];
      s += sum * DIRT[t].weight;
    }
    let f = 0;
    for (let i = 0; i < GN; i++) f += this.foam[i];
    return s + f * 0.12;
  }

  cellDirt(i) {
    let s = 0;
    for (let t = 0; t < NDIRT; t++) s += this.dirt[t][i];
    return s;
  }

  updateMetrics(first = false) {
    this.cleanPct = clamp(100 * (1 - this.remainingWeight() / this.initial), 0, 100);
    // блоки
    for (let by = 0; by < BH; by++) {
      for (let bx = 0; bx < BW; bx++) {
        let s = 0;
        for (let y = 0; y < BLOCK; y++) {
          const row = (by * BLOCK + y) * GW + bx * BLOCK;
          for (let x = 0; x < BLOCK; x++) s += this.cellDirt(row + x);
        }
        const bi = by * BW + bx;
        const prev = this.blockPrev[bi];
        const thr = BLOCK * BLOCK * 0.06;
        if (!first && prev > thr * 2.5 && s < thr) {
          this.events.push({ type: 'sparkle', x: (bx + 0.5) * BLOCK, y: (by + 0.5) * BLOCK });
        }
        this.blockPrev[bi] = s;
      }
    }
    // находки
    for (const f of this.finds) {
      if (f.revealed) continue;
      let s = 0, n = 0;
      const r = f.r;
      for (let y = Math.max(0, Math.floor(f.y - r)); y <= Math.min(GH - 1, Math.ceil(f.y + r)); y++) {
        for (let x = Math.max(0, Math.floor(f.x - r)); x <= Math.min(GW - 1, Math.ceil(f.x + r)); x++) {
          if ((x - f.x) ** 2 + (y - f.y) ** 2 <= r * r) { s += this.cellDirt(y * GW + x); n++; }
        }
      }
      if (n && s / n < 0.1) {
        f.revealed = true;
        this.events.push({ type: 'found', find: f });
      }
    }
  }

  // Количество шагов интерполяции и вес шага.
  _samples(x0, y0, x1, y1, r) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    return Math.max(1, Math.ceil(dist / (r * 0.7)));
  }

  /**
   * Применяет инструмент вдоль отрезка. ctx: { product, held (сек без движения), speed (клеток/сек) }
   * Возвращает { fx, rate, empty } для звука, вибро и частиц.
   */
  apply(phase, x0, y0, x1, y1, dt, ctx = {}) {
    if (this.time >= this.limit + 9999) return null;
    const tool = phase === 'vacuum' ? this.vac : phase === 'apply' ? this.app : this.rin;
    const n = this._samples(x0, y0, x1, y1, tool.radius);
    const w = dt / n;
    let rate = 0, empty = false;
    for (let k = 0; k < n; k++) {
      const t = n === 1 ? 1 : (k + 1) / n;
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      this._markLit(x, y, tool.radius);
      let res;
      if (phase === 'vacuum') res = this._vacuum(x, y, w);
      else if (phase === 'apply') res = this._applyProduct(x, y, w, ctx);
      else res = this._rinse(x, y, w, ctx);
      rate += res.rate; if (res.empty) empty = true;
    }
    this.stats.strokes[phase] += dt;
    return { fx: phase, rate: rate / Math.max(dt, 1e-6), empty };
  }

  _markLit(x, y, r) {
    if (!this.quirks.some((q) => q.id === 'dark')) return;
    const rr = Math.ceil(r * 1.8);
    for (let j = Math.max(0, Math.floor(y - rr)); j <= Math.min(GH - 1, Math.ceil(y + rr)); j++) {
      for (let i = Math.max(0, Math.floor(x - rr)); i <= Math.min(GW - 1, Math.ceil(x + rr)); i++) {
        const d = Math.hypot(i - x, j - y);
        if (d <= rr) { const v = 1 - d / rr * 0.4; if (v > this.lit[j * GW + i]) this.lit[j * GW + i] = v; }
      }
    }
  }

  _forCells(x, y, r, fn) {
    const j0 = Math.max(0, Math.floor(y - r)), j1 = Math.min(GH - 1, Math.ceil(y + r));
    const i0 = Math.max(0, Math.floor(x - r)), i1 = Math.min(GW - 1, Math.ceil(x + r));
    const r2 = r * r;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const d2 = (i - x) ** 2 + (j - y) ** 2;
        if (d2 > r2) continue;
        const q = d2 / r2;
        fn(j * GW + i, (1 - q) * 1.5 + 0.02);
      }
    }
  }

  _vacuum(x, y, w) {
    const v = this.vac;
    const clog = this.filter ? 1 - 0.55 * clamp(this.filterLoad / (this.filter.cap * v.filterCap), 0, 1) : 0.85;
    const q = this.filter ? this.filter.quality : 0.85;
    const base = v.power * q * clog * 5.0 * w;
    let removed = 0;
    this._forCells(x, y, v.radius, (i, k) => {
      const dry = 1 - this.wet[i] * 0.85;
      for (let t = 0; t < 3; t++) {
        const a = this.dirt[t][i];
        if (a <= 0) continue;
        const rem = Math.min(a, base * v.aff[t] * k * dry);
        this.dirt[t][i] -= rem;
        this.loose[t][i] = Math.min(this.loose[t][i], this.dirt[t][i]);
        removed += rem * DIRT[t].weight;
      }
      if (this.foam[i] > 0) this.foam[i] = Math.max(0, this.foam[i] - base * 0.4 * k);
    });
    this.filterLoad += removed * 0.35;
    return { rate: removed / Math.max(w, 1e-6) * 0.02 + 0.05, empty: false };
  }

  _applyProduct(x, y, w, ctx) {
    const pid = ctx.product;
    const prod = ALL_PRODUCTS[pid];
    if (!prod) return { rate: 0, empty: true };
    const have = this.stock.products[pid] || 0;
    if (have <= 0) return { rate: 0, empty: true };
    const a = this.app;
    const pidx = this.productList.indexOf(pid) + 1; // 0 = нет
    const dep = a.deposit * 1.4 * w;
    let cells = 0, scrubbed = 0;
    const scrubF = 1 + (a.scrub - 1) * clamp((ctx.speed ?? 0) / (a.radius * 4), 0, 1);
    this._forCells(x, y, a.radius, (i, k) => {
      const add = dep * k;
      if (this.foamProd[i] !== pidx && this.foam[i] > 0.1) this.foamAge[i] *= 0.5;
      this.foamProd[i] = pidx;
      this.foam[i] = Math.min(1, this.foam[i] + add);
      cells += add;
      if (scrubF > 1 && this.foam[i] > 0.1) {
        for (let t = 0; t < NDIRT; t++) {
          const room = this.dirt[t][i] - this.loose[t][i];
          if (room <= 0) continue;
          const ld = Math.min(room, prod.rate * prod.aff[t] * (scrubF - 1) * 0.55 * k * w);
          this.loose[t][i] += ld; scrubbed += ld;
        }
      }
    });
    const cost = cells * 0.0025 * a.usageMul * a.usage * this.heavy;
    const take = Math.min(have, cost);
    this.stock.products[pid] = have - take;
    this.used.products[pid] = (this.used.products[pid] || 0) + take;
    return { rate: cells / Math.max(w, 1e-6) * 0.01 + scrubbed * 0.2, empty: false };
  }

  _rinse(x, y, w, ctx) {
    const r = this.rin;
    const held = clamp(ctx.held ?? 0, 0, 1.2);
    const boost = 1 + clamp(held / 1.0, 0, 1);
    const steam = r.steam;
    const have = steam ? this.stock.steam : this.stock.water;
    const use = r.flow * r.flowMul * boost * 2.5 * w * this.heavy;
    let flowF = 1, empty = false;
    if (have <= 0) { flowF = 0.18; empty = true; }
    else {
      const take = Math.min(have, use);
      if (steam) { this.stock.steam -= take; this.used.steam += take; }
      else { this.stock.water -= take; this.used.water += take; }
    }
    const p = r.pressure * boost * flowF * w * 3.0;
    let removed = 0;
    this._forCells(x, y, r.radius, (i, k) => {
      const pk = p * k;
      for (let t = 0; t < NDIRT; t++) {
        const a = this.dirt[t][i];
        if (a <= 0) continue;
        const lo = this.loose[t][i];
        // смывается разрыхлённое
        let rem = Math.min(lo, pk * 1.4);
        // не разрыхлённое смывается слабо
        const free = a - lo;
        if (free > 0) {
          let aff = steam ? STEAM_AFF[t] * r.heat : WATER_AFF[t];
          rem += Math.min(free, pk * aff * 0.5);
        }
        rem = Math.min(rem, a);
        if (rem > 0) {
          this.dirt[t][i] -= rem;
          this.loose[t][i] = Math.max(0, lo - Math.min(lo, rem));
          removed += rem * DIRT[t].weight;
        }
        // сухое под водой превращается в грязь
        if (t < 2 && !steam) {
          const conv = Math.min(this.dirt[t][i], pk * 0.55);
          if (conv > 0) {
            this.dirt[t][i] -= conv;
            this.loose[t][i] = Math.min(this.loose[t][i], this.dirt[t][i]);
            this.dirt[D.mud][i] += conv * 0.85;
          }
        }
      }
      if (this.foam[i] > 0) this.foam[i] = Math.max(0, this.foam[i] - pk * 1.8);
      this.wet[i] = Math.min(1, this.wet[i] + pk * (steam ? 0.15 : 0.6));
    });
    return { rate: removed / Math.max(w, 1e-6) * 0.02 + 0.08 * flowF, empty, steam };
  }

  /** Внешний шаг симуляции: разрыхление, высыхание, квирки. */
  tick(dt) {
    this.time += dt;
    // разрыхление пеной
    for (let i = 0; i < GN; i++) {
      const f = this.foam[i];
      if (f < 0.04) continue;
      const pidx = this.foamProd[i];
      if (!pidx) continue;
      const prod = ALL_PRODUCTS[this.productList[pidx - 1]];
      if (!prod) continue;
      this.foamAge[i] += dt;
      const dwell = prod.dwell * this.app.dwellMul;
      const df = clamp(this.foamAge[i] / dwell, 0, 1);
      if (df < 0.15) continue;
      const rate = prod.rate * this.rateBoost * df * Math.sqrt(f) * dt * 0.8;
      for (let t = 0; t < NDIRT; t++) {
        const room = this.dirt[t][i] - this.loose[t][i];
        if (room <= 0) continue;
        this.loose[t][i] += Math.min(room, rate * prod.aff[t]);
      }
      this.foam[i] = Math.max(0, f - dt * 0.006);
    }
    // высыхание
    for (let i = 0; i < GN; i++) if (this.wet[i] > 0) this.wet[i] = Math.max(0, this.wet[i] - dt * 0.025 * this.dryMul);
    // свет в «темноте»
    if (this.quirks.some((q) => q.id === 'dark')) {
      for (let i = 0; i < GN; i++) if (this.lit[i] > 0) this.lit[i] = Math.max(0, this.lit[i] - dt * 0.14);
    }
    if (this.shakeCd > 0) this.shakeCd -= dt;
    this._quirks(dt);
    this.metricTimer += dt;
    if (this.metricTimer >= 0.25) { this.metricTimer = 0; this.updateMetrics(); }
  }

  _quirks(dt) {
    for (const q of this.quirks) {
      if (q.id === 'regrow') {
        this.regrowTimer += dt;
        if (this.regrowTimer >= (q.every ?? 2.5)) {
          this.regrowTimer = 0;
          this._blob(this.rng.range(4, GW - 4), this.rng.range(4, GH - 4), q.size ?? 5, D[q.type ?? 'mold'], q.amount ?? 0.5);
          this.events.push({ type: 'regrow' });
        }
      } else if (q.id === 'ghosts') {
        this.ghostTimer += dt;
        if (this.ghostTimer >= (q.every ?? 6)) {
          this.ghostTimer = 0;
          const t = D[this.rng.pick(q.types ?? ['dust', 'mud', 'stain'])];
          this._blob(this.rng.range(6, GW - 6), this.rng.range(6, GH - 6), q.size ?? 7, t, 0.8);
          this.events.push({ type: 'ghost' });
        }
      } else if (q.id === 'foamy') {
        this._diffuseFoam(dt * (q.rate ?? 0.6));
      }
    }
  }

  _blob(cx, cy, r, t, amt) {
    this._forCells(cx, cy, r, (i, k) => {
      this.dirt[t][i] = Math.min(1, this.dirt[t][i] + amt * k);
    });
  }

  _diffuseFoam(f) {
    const tmp = this.foam.slice();
    for (let y = 1; y < GH - 1; y++) {
      for (let x = 1; x < GW - 1; x++) {
        const i = y * GW + x;
        const avg = (tmp[i - 1] + tmp[i + 1] + tmp[i - GW] + tmp[i + GW]) * 0.25;
        this.foam[i] = clamp(tmp[i] + (avg - tmp[i]) * f, 0, 1);
        if (this.foam[i] > 0.05 && !this.foamProd[i]) this.foamProd[i] = this.foamProd[i - 1] || this.foamProd[i + 1] || 1;
      }
    }
  }

  /** Наклон телефона (gx,gy в -1..1): пена и вода стекают, жидкая грязь размазывается. */
  applyTilt(gx, gy, dt) {
    const s = clamp(Math.hypot(gx, gy), 0, 1);
    if (s < 0.08) return;
    const move = s * dt * 3.2;
    const dx = Math.sign(gx) * (Math.abs(gx) > 0.25 ? 1 : 0);
    const dy = Math.sign(gy) * (Math.abs(gy) > 0.25 ? 1 : 0);
    if (!dx && !dy) return;
    const arrays = [this.foam, this.wet];
    for (const arr of arrays) {
      const src = arr.slice();
      for (let y = 1; y < GH - 1; y++) {
        for (let x = 1; x < GW - 1; x++) {
          const i = y * GW + x;
          const from = (y - dy) * GW + (x - dx);
          const flow = src[from] * move * 0.5;
          arr[i] = clamp(arr[i] + flow - src[i] * move * 0.5, 0, 1);
        }
      }
    }
    // направление пены (какой продукт) переносится вслед
    for (let y = 1; y < GH - 1; y++) {
      for (let x = 1; x < GW - 1; x++) {
        const i = y * GW + x;
        if (this.foam[i] > 0.04 && !this.foamProd[i]) this.foamProd[i] = this.foamProd[(y - dy) * GW + (x - dx)] || 1;
      }
    }
  }

  /** Встряска: небольшое разрыхление под пеной (кулдаун 4 сек). */
  shake() {
    if (this.shakeCd > 0) return false;
    this.shakeCd = 4;
    for (let i = 0; i < GN; i++) {
      if (this.foam[i] < 0.1) continue;
      const prod = ALL_PRODUCTS[this.productList[this.foamProd[i] - 1]];
      if (!prod) continue;
      for (let t = 0; t < NDIRT; t++) {
        const room = this.dirt[t][i] - this.loose[t][i];
        if (room > 0) this.loose[t][i] += Math.min(room, 0.12 * prod.aff[t]);
      }
      this.foamAge[i] += 0.8;
    }
    this._diffuseFoam(0.5);
    this.events.push({ type: 'shake' });
    return true;
  }

  collectFind(idx) {
    const f = this.finds[idx];
    if (!f || !f.revealed || f.collected) return null;
    f.collected = true;
    return f;
  }

  collectAllRevealed() {
    const out = [];
    for (const f of this.finds) if (f.revealed && !f.collected) { f.collected = true; out.push(f); }
    return out;
  }

  addTime(sec) { this.limit += sec; }
  get timeLeft() { return Math.max(0, this.limit - this.time); }
  drainEvents() { const e = this.events; this.events = []; return e; }
}
