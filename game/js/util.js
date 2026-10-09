// Общие утилиты: генератор случайных чисел, шум, математика.
export function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export class RNG {
  constructor(seed = 1) {
    this.s = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
  }
  next() {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  gauss() { return (this.next() + this.next() + this.next() + this.next() - 2) / 0.58; }
  fork(tag) { return new RNG(this.s ^ hashString(String(tag))); }
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Гладкий value-noise на сетке (детерминированный по сиду).
export class Noise2D {
  constructor(seed, size = 64) {
    const r = new RNG(seed);
    this.size = size;
    this.v = new Float32Array(size * size);
    for (let i = 0; i < this.v.length; i++) this.v[i] = r.next();
  }
  at(x, y) {
    const n = this.size;
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf);
    const a = this.v[((yi % n + n) % n) * n + ((xi % n + n) % n)];
    const b = this.v[((yi % n + n) % n) * n + (((xi + 1) % n + n) % n)];
    const c = this.v[(((yi + 1) % n + n) % n) * n + ((xi % n + n) % n)];
    const d = this.v[(((yi + 1) % n + n) % n) * n + (((xi + 1) % n + n) % n)];
    return lerp(lerp(a, b, u), lerp(c, d, u), w);
  }
  fbm(x, y, oct = 3) {
    let s = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
      s += this.at(x * f, y * f) * amp;
      norm += amp; amp *= 0.5; f *= 2;
    }
    return s / norm;
  }
}

export const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
export const pad2 = (n) => String(n).padStart(2, '0');
export const fmtTime = (sec) => {
  sec = Math.max(0, Math.ceil(sec));
  return `${Math.floor(sec / 60)}:${pad2(sec % 60)}`;
};
