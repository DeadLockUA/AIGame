// Генерация грязи на ковре по профилю. Профиль: { layers: [{ type, cover (0..1), amt (0..1) }], finds: [] }
import { D } from '../data/gear.js';
import { RNG, Noise2D, smoothstep, clamp } from '../util.js';
import { GW, GH } from './engine.js';

function add(eng, t, i, v) {
  const a = eng.dirt[t];
  a[i] = Math.min(1, Math.max(a[i], 0) + v);
}

function disc(eng, t, cx, cy, r, amt, rng, ragged = 0.35, variant = -1) {
  const rr = Math.ceil(r * (1 + ragged));
  for (let y = Math.max(0, Math.floor(cy - rr)); y <= Math.min(GH - 1, Math.ceil(cy + rr)); y++) {
    for (let x = Math.max(0, Math.floor(cx - rr)); x <= Math.min(GW - 1, Math.ceil(cx + rr)); x++) {
      const d = Math.hypot(x - cx, y - cy);
      const ang = Math.atan2(y - cy, x - cx);
      const wob = 1 + ragged * 0.5 * Math.sin(ang * 3 + cx) * Math.cos(ang * 2 + cy);
      const edge = d / (r * wob);
      if (edge < 1) {
        const i = y * GW + x;
        add(eng, t, i, amt * (1 - edge * edge * 0.55));
        if (variant >= 0) eng.stainVar[i] = variant;
      }
    }
  }
}

const FILL = {
  dust(eng, rng, noise, L) {
    const { cover, amt } = L;
    const base = amt * 0.18;
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const n = noise.fbm(x / 14, y / 14, 3);
        const m = smoothstep(1 - cover - 0.12, 1 - cover + 0.12, n);
        const v = base + amt * 0.82 * m;
        if (v > 0.02) add(eng, D.dust, y * GW + x, v);
      }
    }
  },
  hair(eng, rng, noise, L) {
    const n = Math.round(L.cover * 90) + 4;
    for (let s = 0; s < n; s++) {
      let x = rng.range(2, GW - 2), y = rng.range(2, GH - 2);
      let a = rng.range(0, Math.PI * 2);
      const len = rng.int(7, 22);
      const curl = rng.range(-0.22, 0.22);
      for (let k = 0; k < len; k++) {
        x += Math.cos(a); y += Math.sin(a); a += curl;
        const xi = Math.round(x), yi = Math.round(y);
        if (xi < 0 || yi < 0 || xi >= GW || yi >= GH) break;
        add(eng, D.hair, yi * GW + xi, L.amt * 0.9);
        if (rng.chance(0.4)) add(eng, D.hair, clamp(yi + 1, 0, GH - 1) * GW + xi, L.amt * 0.4);
      }
    }
  },
  sand(eng, rng, noise, L) {
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const mask = smoothstep(1 - L.cover - 0.1, 1 - L.cover + 0.15, noise.fbm(x / 20 + 9, y / 20 + 3, 2));
        if (mask <= 0) continue;
        const sp = noise.at(x * 1.7, y * 1.7);
        if (sp > 0.38) add(eng, D.sand, y * GW + x, L.amt * mask * (0.5 + sp * 0.5));
      }
    }
  },
  mud(eng, rng, noise, L) {
    // следы ботинок вдоль пути и брызги
    const steps = Math.round(L.cover * 14) + 2;
    let x = rng.range(10, GW - 10), y = rng.range(10, GH - 10);
    let a = rng.range(0, Math.PI * 2);
    for (let s = 0; s < steps; s++) {
      a += rng.range(-0.5, 0.5);
      x = clamp(x + Math.cos(a) * 9, 6, GW - 6); y = clamp(y + Math.sin(a) * 9, 6, GH - 6);
      const side = s % 2 ? 1 : -1;
      const px = x + Math.cos(a + Math.PI / 2) * 3 * side, py = y + Math.sin(a + Math.PI / 2) * 3 * side;
      disc(eng, D.mud, px, py, 4.2, L.amt * 0.9, rng, 0.25);
      disc(eng, D.mud, px - Math.cos(a) * 4, py - Math.sin(a) * 4, 2.4, L.amt * 0.8, rng, 0.2);
    }
    const sp = Math.round(L.cover * 40);
    for (let s = 0; s < sp; s++) disc(eng, D.mud, rng.range(2, GW - 2), rng.range(2, GH - 2), rng.range(1, 2.4), L.amt * 0.8, rng, 0.2);
  },
  grease(eng, rng, noise, L) {
    const clusters = Math.round(L.cover * 7) + 1;
    for (let c = 0; c < clusters; c++) {
      const cx = rng.range(8, GW - 8), cy = rng.range(8, GH - 8);
      const m = rng.int(2, 4);
      for (let k = 0; k < m; k++) disc(eng, D.grease, cx + rng.range(-6, 6), cy + rng.range(-6, 6), rng.range(3, 6.5), L.amt * 0.9, rng, 0.4);
    }
  },
  stain(eng, rng, noise, L) {
    const n = Math.round(L.cover * 14) + 1;
    for (let s = 0; s < n; s++) {
      const cx = rng.range(7, GW - 7), cy = rng.range(7, GH - 7);
      const v = rng.int(0, 2);
      const r = rng.range(2.6, 6.5);
      disc(eng, D.stain, cx, cy, r, L.amt, rng, 0.5, v);
      // потёки
      const drips = rng.int(0, 3);
      for (let k = 0; k < drips; k++) {
        const dx = cx + rng.range(-r, r);
        const len = rng.int(3, 9);
        for (let j = 0; j < len; j++) {
          const yi = Math.round(cy + r * 0.7 + j), xi = Math.round(dx);
          if (yi >= GH || xi < 0 || xi >= GW) break;
          add(eng, D.stain, yi * GW + xi, L.amt * (1 - j / len) * 0.8);
          eng.stainVar[yi * GW + xi] = v;
        }
      }
    }
  },
  deep(eng, rng, noise, L) {
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const m = smoothstep(1 - L.cover - 0.08, 1 - L.cover + 0.14, noise.fbm(x / 22 + 40, y / 22 + 40, 2));
        if (m > 0.02) add(eng, D.deep, y * GW + x, L.amt * 0.85 * m);
      }
    }
  },
  mold(eng, rng, noise, L) {
    const seeds = Math.round(L.cover * 7) + 2;
    for (let s = 0; s < seeds; s++) {
      const edge = rng.int(0, 3);
      let cx = rng.range(0, GW), cy = rng.range(0, GH);
      if (edge === 0) cy = rng.range(0, 10);
      else if (edge === 1) cy = rng.range(GH - 10, GH);
      else if (edge === 2) cx = rng.range(0, 10);
      else cx = rng.range(GW - 10, GW);
      const r = rng.range(4, 8);
      disc(eng, D.mold, cx, cy, r, L.amt, rng, 0.55);
      for (let k = 0; k < 6; k++) disc(eng, D.mold, cx + rng.range(-r, r) * 1.2, cy + rng.range(-r, r) * 1.2, rng.range(1, 2.5), L.amt, rng, 0.3);
    }
  },
};

export function fillDirt(eng, profile, seed) {
  const rng = new RNG(seed);
  const noise = new Noise2D(seed ^ 0x9e3779b9, 64);
  for (const L of profile.layers) {
    const f = FILL[L.type];
    if (f) f(eng, rng.fork(L.type), noise, L);
  }
  // находки под слоем грязи
  for (const f of eng.finds) {
    const t = rng.pick([D.dust, D.mud, D.sand]);
    disc(eng, t, f.x, f.y, f.r + 2.5, 0.75, rng, 0.2);
  }
  eng.finalize();
}

// Случайные позиции находок, не у самого края.
export function placeFinds(ids, seed) {
  const rng = new RNG(seed ^ 0x51ed);
  return ids.map((id) => ({ id, x: rng.range(12, GW - 12), y: rng.range(14, GH - 14), r: 3 }));
}
