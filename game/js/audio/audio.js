// Аудио «Чистого ворса»: весь звук синтезируется WebAudio, внешних файлов нет.
// Публичный объект `audio`; все методы безопасны (никогда не бросают исключений).
//
// Устройство:
//   Engine — владеет AudioContext и графом: шины sfx/music -> master -> компрессор -> мягкий клиппер.
//   Реверберация — общий ConvolverNode с сгенерированным импульсом.
//   Инструменты (tool*) — по одному непрерывному графу на тип, параметры плавно двигаются setTargetAtTime.
//   Музыка — планировщик с упреждением (lookahead): ноты ставятся на ctx-время чуть вперёд.

const NO = 0.0001;
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Музыкальные данные: по сезону свой лад, темп, тембры, ритм.
// chord: {r: смещение корня от тоники, t: интервалы}
// ---------------------------------------------------------------------------
const M = [0, 4, 7], m = [0, 3, 7], M7 = [0, 4, 7, 11], m7 = [0, 3, 7, 10], d7 = [0, 4, 7, 10];
const sus2 = [0, 2, 7], add9 = [0, 4, 7, 14];
const ch = (r, t) => ({ r, t });

const SEASONS = {
  1: { // Тополиная: мягкий мажор, пентатоника
    root: 48, scale: [0, 2, 4, 7, 9], bpm: 76, beats: 4, swing: 0, bpc: 1, rev: 0.35,
    prog: [[ch(0, add9), ch(9, m), ch(5, M), ch(0, M)], [ch(0, M), ch(5, M), ch(9, m), ch(7, sus2)]],
    pad: 'soft', padBase: 55,
    bass: { timbre: 'bass_sine', base: 36, pat: [[0, 0, 5, 1], [4, 1, 3, 0.5]] },
    arp: { timbre: 'harp', base: 60, w: [1, 0.35, 0.6, 0.35, 0.8, 0.35, 0.6, 0.35], mode: 'updown', vel: 1 },
    mel: { timbre: 'ep', lo: 67, hi: 88, dens: 0.32, rest: 0.2, leap: 0.08, lens: [2, 2, 3, 4], vel: 1 },
    shim: { timbre: 'bell', p: 0.35 }, perc: null,
  },
  2: { // Рынок: фригийский, ритм
    root: 52, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 102, beats: 4, swing: 0.08, bpc: 1, rev: 0.22,
    prog: [[ch(0, m), ch(1, M), ch(0, m), ch(10, M)], [ch(0, m), ch(0, m), ch(1, M), ch(10, M)]],
    pad: 'strings', padBase: 55,
    bass: { timbre: 'bass_pluck', base: 40, pat: [[0, 0, 3, 1], [3, 0, 2, 0.6], [6, 1, 2, 0.7]] },
    arp: { timbre: 'saw', base: 60, w: [1, 0.5, 0.8, 0.6, 1, 0.5, 0.8, 0.5], mode: 'updown', vel: 0.9 },
    mel: { timbre: 'saw', lo: 64, hi: 86, dens: 0.4, rest: 0.2, leap: 0.12, lens: [1, 2, 2, 3], orn: 0.3, vel: 1 },
    shim: { timbre: 'bell', p: 0.25 },
    perc: [[0, 'drum', 0.7, 1], [3, 'drum', 0.5, 0.7], [4, 'drum', 0.6, 1], [2, 'shaker', 0.5, 0.8], [6, 'shaker', 0.5, 0.8], [5, 'rim', 0.4, 0.5]],
  },
  3: { // Студгородок: lo-fi
    root: 50, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 74, beats: 4, swing: 0.22, bpc: 1, rev: 0.3,
    prog: [[ch(0, [0, 3, 7, 10]), ch(5, d7), ch(10, M7), ch(7, m7)], [ch(0, m7), ch(7, m7), ch(5, m7), ch(10, M7)]],
    pad: 'soft', padBase: 53,
    bass: { timbre: 'bass_sine', base: 36, pat: [[0, 0, 3, 1], [3, 1, 2, 0.5], [6, 0, 2, 0.7]] },
    arp: { timbre: 'ep', base: 57, w: [1, 0, 0.3, 0, 0.7, 0, 0.35, 0.2], mode: 'up', vel: 1 },
    mel: { timbre: 'ep', lo: 62, hi: 81, dens: 0.3, rest: 0.25, leap: 0.1, lens: [2, 3, 4], vel: 1 },
    shim: { timbre: 'box', p: 0.25 },
    perc: [[0, 'kick', 0.6, 1], [5, 'kick', 0.45, 0.5], [2, 'hat', 0.5, 1], [6, 'hat', 0.5, 1], [4, 'snap', 0.4, 1]],
  },
  4: { // Набережная: воздушная пентатоника
    root: 50, scale: [0, 2, 4, 7, 9], bpm: 68, beats: 4, swing: 0, bpc: 2, rev: 0.6,
    prog: [[ch(0, M), ch(2, sus2), ch(9, m), ch(5, M)], [ch(0, add9), ch(7, sus2), ch(9, m), ch(5, M)]],
    pad: 'glass', padBase: 57,
    bass: { timbre: 'bass_sine', base: 38, pat: [[0, 0, 8, 1]] },
    arp: { timbre: 'harp', base: 66, w: [0.8, 0, 0.5, 0, 0.6, 0, 0.5, 0], mode: 'updown', vel: 0.9 },
    mel: { timbre: 'bell', lo: 69, hi: 93, dens: 0.22, rest: 0.3, leap: 0.12, lens: [3, 4, 6], vel: 0.9 },
    shim: { timbre: 'bell', p: 0.5 }, perc: null,
  },
  5: { // Старый город: гармонический минор
    root: 45, scale: [0, 2, 3, 5, 7, 8, 11], bpm: 84, beats: 4, swing: 0, bpc: 1, rev: 0.42,
    prog: [[ch(0, m), ch(7, M), ch(0, m), ch(7, M)], [ch(0, m), ch(8, M), ch(7, M), ch(0, m)], [ch(0, m), ch(5, m), ch(7, M), ch(0, m)]],
    pad: 'strings', padBase: 52,
    bass: { timbre: 'bass_pluck', base: 33, pat: [[0, 0, 3, 1], [4, 1, 3, 0.7]] },
    arp: { timbre: 'saw', base: 57, w: [1, 0.3, 0.7, 0.4, 0.9, 0.3, 0.7, 0.4], mode: 'updown', vel: 0.85 },
    mel: { timbre: 'saw', lo: 64, hi: 88, dens: 0.36, rest: 0.2, leap: 0.15, lens: [1, 2, 3, 4], orn: 0.45, vel: 1 },
    shim: { timbre: 'bell', p: 0.25 },
    perc: [[0, 'drum', 0.55, 1], [4, 'drum', 0.45, 0.8], [3, 'shaker', 0.35, 0.7], [6, 'shaker', 0.35, 0.7]],
  },
  6: { // Отели: джаз
    root: 53, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 90, beats: 4, swing: 0.24, bpc: 1, rev: 0.3,
    prog: [[ch(0, M7), ch(9, m7), ch(2, m7), ch(7, d7)], [ch(0, M7), ch(4, m7), ch(9, m7), ch(2, m7)]],
    pad: 'glass', padBase: 53,
    bass: { timbre: 'bass_sine', base: 36, pat: [[0, 0, 2, 1], [2, 2, 2, 0.8], [4, 1, 2, 1], [6, -1, 2, 0.6]] },
    arp: { timbre: 'ep', base: 60, w: [0.9, 0, 0.3, 0.5, 0, 0.6, 0.3, 0], mode: 'up', vel: 0.9 },
    mel: { timbre: 'ep', lo: 64, hi: 86, dens: 0.34, rest: 0.22, leap: 0.2, lens: [1, 2, 2, 3], vel: 1 },
    shim: { timbre: 'bell', p: 0.2 },
    perc: [[0, 'kick', 0.3, 0.8], [2, 'hat', 0.45, 1], [6, 'hat', 0.45, 1], [3, 'hat', 0.25, 0.5]],
  },
  7: { // Усадьбы: вальс
    root: 55, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 122, beats: 3, swing: 0, bpc: 1, rev: 0.4,
    prog: [[ch(0, M), ch(5, M), ch(7, d7), ch(0, M)], [ch(0, M), ch(4, m), ch(2, m7), ch(7, d7)]],
    pad: 'soft', padBase: 55,
    bass: { timbre: 'bass_pluck', base: 36, pat: [[0, 0, 2, 1]] },
    arp: { timbre: 'harp', base: 60, w: [0, 0, 1, 0, 1, 0], mode: 'stab', vel: 0.8 },
    mel: { timbre: 'box', lo: 67, hi: 91, dens: 0.34, rest: 0.18, leap: 0.14, lens: [2, 2, 4], vel: 1 },
    shim: { timbre: 'bell', p: 0.25 }, perc: null,
  },
  8: { // Театр: драматичнее
    root: 50, scale: [0, 2, 3, 5, 7, 8, 11], bpm: 62, beats: 4, swing: 0, bpc: 1, rev: 0.55,
    prog: [[ch(0, m), ch(8, M), ch(5, m), ch(7, M)], [ch(0, m), ch(5, m), ch(7, M), ch(0, m)]],
    pad: 'strings', padBase: 52, padGain: 1.25,
    bass: { timbre: 'bass_sine', base: 33, pat: [[0, 0, 8, 1]] },
    arp: { timbre: 'harp', base: 57, w: [1, 0, 0.5, 0, 0.7, 0, 0.5, 0], mode: 'up', vel: 0.9 },
    mel: { timbre: 'cello', lo: 57, hi: 81, dens: 0.22, rest: 0.18, leap: 0.25, lens: [3, 4, 6, 8], vel: 1 },
    shim: { timbre: 'bell', p: 0.3 },
    perc: [[0, 'timp', 0.8, 1], [4, 'timp', 0.4, 0.5]],
  },
  9: { // Музей: спокойно, звонко
    root: 48, scale: [0, 2, 4, 6, 7, 9, 11], bpm: 58, beats: 4, swing: 0, bpc: 2, rev: 0.5,
    prog: [[ch(0, M7), ch(2, M), ch(0, M7), ch(4, m7)], [ch(0, M7), ch(7, M), ch(2, M), ch(0, M7)]],
    pad: 'glass', padBase: 55,
    bass: { timbre: 'bass_sine', base: 36, pat: [[0, 0, 8, 1]] },
    arp: { timbre: 'bell', base: 67, w: [0.7, 0, 0.4, 0, 0.5, 0, 0.4, 0], mode: 'updown', vel: 0.7 },
    mel: { timbre: 'box', lo: 72, hi: 96, dens: 0.22, rest: 0.25, leap: 0.12, lens: [2, 3, 4], vel: 0.9 },
    shim: { timbre: 'bell', p: 0.45 }, perc: null,
  },
  10: { // Площадь ковров: торжественно и тепло
    root: 55, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 88, beats: 4, swing: 0, bpc: 1, rev: 0.5,
    prog: [[ch(0, M), ch(7, M), ch(4, m), ch(5, M)], [ch(0, M), ch(5, M), ch(7, M), ch(0, M)]],
    pad: 'choir', padBase: 55, padGain: 1.15,
    bass: { timbre: 'bass_sine', base: 36, pat: [[0, 0, 4, 1], [4, 1, 3, 0.8]] },
    arp: { timbre: 'harp', base: 60, w: [1, 0.3, 0.6, 0.3, 0.8, 0.3, 0.6, 0.3], mode: 'up', vel: 0.9 },
    mel: { timbre: 'horn', lo: 62, hi: 86, dens: 0.25, rest: 0.15, leap: 0.22, lens: [3, 4, 6], vel: 1 },
    shim: { timbre: 'bell', p: 0.35 },
    perc: [[0, 'timp', 0.7, 1], [4, 'timp', 0.45, 0.7], [2, 'shaker', 0.25, 0.5], [6, 'shaker', 0.25, 0.5]],
  },
};

// Тембры нот: (частота, длительность) -> часть спецификации голоса.
const NOTE_TIMBRES = {
  harp: (f, d) => ({ partials: [{ type: 'triangle' }, { type: 'sine', ratio: 2, gain: 0.25, dec: d * 0.4 }], filter: { type: 'lowpass', f: 3600, fEnd: 1300 }, atk: 0.004, dur: d }),
  ep: (f, d) => ({ partials: [{ type: 'sine' }, { type: 'sine', ratio: 2, gain: 0.3, dec: d * 0.3 }, { type: 'triangle', ratio: 0.5, gain: 0.15 }], filter: { type: 'lowpass', f: 3200, fEnd: 1500 }, atk: 0.006, dur: d }),
  saw: (f, d) => ({ partials: [{ type: 'sawtooth' }, { type: 'triangle', detune: 7, gain: 0.6 }], filter: { type: 'lowpass', f: 2600, fEnd: 500, q: 1.1, fT: d * 0.35 }, atk: 0.004, dur: d * 0.8 }),
  bell: (f, d) => ({ partials: [{ type: 'sine' }, { type: 'sine', ratio: 2, gain: 0.1, dec: d * 0.3 }], fm: { ratio: 3.5, index: 0.7, dec: d * 0.2 }, atk: 0.004, dur: d }),
  box: (f, d) => ({ partials: [{ type: 'sine' }, { type: 'sine', ratio: 4, gain: 0.1, dec: 0.25 }], fm: { ratio: 5, index: 0.3, dec: 0.12 }, atk: 0.003, dur: d * 0.8 }),
  bass_sine: (f, d) => ({ partials: [{ type: 'sine' }, { type: 'triangle', ratio: 2, gain: 0.18 }], filter: { type: 'lowpass', f: 700 }, atk: 0.02, rel: Math.min(0.25, d * 0.5), dur: d }),
  bass_pluck: (f, d) => ({ partials: [{ type: 'triangle' }, { type: 'sine', ratio: 0.5, gain: 0.5 }], filter: { type: 'lowpass', f: 900, fEnd: 260 }, atk: 0.008, dur: d }),
  // длинные «смычковые/духовые»
  cello: (f, d) => ({ partials: [{ type: 'sawtooth', detune: -5 }, { type: 'sawtooth', detune: 6, gain: 0.7 }], filter: { type: 'lowpass', f: 1500, q: 0.6 }, atk: 0.12, rel: Math.min(0.5, d * 0.5), dur: d }),
  horn: (f, d) => ({ partials: [{ type: 'triangle', detune: -4 }, { type: 'sawtooth', detune: 4, gain: 0.35 }], filter: { type: 'lowpass', f: 1300, q: 0.5 }, atk: 0.09, rel: Math.min(0.5, d * 0.5), dur: d }),
};
const PAD_TIMBRES = {
  soft: [{ type: 'triangle', detune: -5 }, { type: 'triangle', detune: 5 }], softF: 1400,
  strings: [{ type: 'sawtooth', detune: -8 }, { type: 'sawtooth', detune: 8 }], stringsF: 1000,
  glass: [{ type: 'sine', detune: -4 }, { type: 'sine', ratio: 2, detune: 4, gain: 0.25 }], glassF: 2600,
  choir: [{ type: 'triangle', detune: -4 }, { type: 'triangle', detune: 4 }, { type: 'sine', ratio: 2, gain: 0.25 }], choirF: 1700,
};

const UI_NAMES = ['tap', 'back', 'buy', 'error', 'coin', 'star', 'success', 'fail', 'open', 'close', 'tick', 'tab'];
const TOOL_KINDS = ['vacuum', 'apply', 'rinse', 'steam'];

// ---------------------------------------------------------------------------
class Engine {
  constructor() {
    this.ctx = null;
    this.offline = false;
    this.dead = false;
    this.vol = { music: 0.7, sfx: 0.9 };
    this.v = { sfx: 0, music: 0 };
    this.cap = { sfx: 8, music: 10 };
    this.tool = null;
    this.sess = null;
    this.timer = null;
    this.pending = null;
    this.clean = 0;
    this.rnd = mulberry32((Date.now() ^ 0x9e3779b9) >>> 0);
    this.paused = false;
  }

  // -------- граф ---------
  build(ctx, offline) {
    this.ctx = ctx;
    this.offline = !!offline;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 14;
    comp.ratio.value = 5;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    const shaper = ctx.createWaveShaper();
    const N = 1024, curve = new Float32Array(N);
    for (let i = 0; i < N; i++) { const x = (i / (N - 1)) * 2 - 1; curve[i] = Math.tanh(x * 1.2) / Math.tanh(1.2) * 0.9; }
    shaper.curve = curve;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(comp); comp.connect(shaper); shaper.connect(ctx.destination);

    this.sfxIn = ctx.createGain();
    this.musicDry = ctx.createGain();
    this.musicWet = ctx.createGain();
    this.sfxIn.connect(this.master);
    this.musicDry.connect(this.master);

    this.rev = ctx.createConvolver();
    this.rev.buffer = this._makeIR(2.4);
    this.revOut = ctx.createGain();
    this.revOut.gain.value = 0.8;
    this.rev.connect(this.revOut); this.revOut.connect(this.master);
    this.sfxSend = ctx.createGain(); this.sfxSend.gain.value = 0.22;
    this.sfxIn.connect(this.sfxSend); this.sfxSend.connect(this.rev);
    this.musicWet.connect(this.rev);

    this._makeNoise();
    this._applyVol(true);
  }

  _makeIR(sec) {
    const ctx = this.ctx, sr = ctx.sampleRate, len = Math.floor(sr * sec);
    const buf = ctx.createBuffer(2, len, sr);
    const r = mulberry32(777);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      const pre = Math.floor(sr * 0.012);
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / sr;
        const env = Math.exp(-t * 2.6) * Math.min(1, t * 60);
        const a = clamp(0.55 - t * 0.45, 0.06, 1); // со временем звук темнеет
        lp += a * ((r() * 2 - 1) - lp);
        d[i] = lp * env;
      }
    }
    let e = 0; const d0 = buf.getChannelData(0);
    for (let i = 0; i < len; i++) e += d0[i] * d0[i];
    const g = 1 / Math.sqrt(e || 1) * 0.35;
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] *= g; }
    return buf;
  }

  _makeNoise() {
    const ctx = this.ctx, sr = ctx.sampleRate, len = sr * 3;
    this.whiteBuf = ctx.createBuffer(1, len, sr);
    this.pinkBuf = ctx.createBuffer(1, len, sr);
    const r = mulberry32(4242);
    const w = this.whiteBuf.getChannelData(0), p = this.pinkBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const x = r() * 2 - 1;
      w[i] = x * 0.7;
      b0 = 0.99886 * b0 + x * 0.0555179; b1 = 0.99332 * b1 + x * 0.0750759; b2 = 0.969 * b2 + x * 0.153852;
      b3 = 0.8665 * b3 + x * 0.3104856; b4 = 0.55 * b4 + x * 0.5329522; b5 = -0.7616 * b5 - x * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11;
      b6 = x * 0.115926;
    }
    // зациклить без щелчка: кроссфейд концов
    const X = 2048;
    for (const d of [w, p]) for (let i = 0; i < X; i++) { const a = i / X; d[len - X + i] = d[len - X + i] * (1 - a) + d[i] * a; }
  }

  _applyVol(instant) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const set = (param, v) => { if (instant) param.setValueAtTime(v, t); else param.setTargetAtTime(v, t, 0.04); };
    const s = this.vol.sfx, mu = this.vol.music;
    set(this.sfxIn.gain, s * s);
    set(this.musicDry.gain, mu * mu * 0.6);
    set(this.musicWet.gain, mu * mu * 0.6);
  }

  // -------- строительные блоки ---------
  _filters(spec, t, dur) {
    if (!spec) return [];
    const list = Array.isArray(spec) ? spec : [spec];
    const ctx = this.ctx;
    return list.map((s) => {
      const f = ctx.createBiquadFilter();
      f.type = s.type || 'lowpass';
      f.Q.value = s.q ?? 0.7;
      f.frequency.setValueAtTime(Math.max(20, s.f), t);
      if (s.fEnd) f.frequency.exponentialRampToValueAtTime(Math.max(20, s.fEnd), t + (s.fT || dur * 0.6));
      return f;
    });
  }

  // Универсальный голос: огибающая + (осцилляторы | шум) + фильтры -> out.
  _voice(o) {
    const ctx = this.ctx;
    const kind = o.kind || 'sfx';
    const cost = o.cost === undefined ? 1 : o.cost;
    if (cost > 0) { if (this.v[kind] >= this.cap[kind]) return false; this.v[kind]++; }
    const t = o.t, dur = Math.max(0.03, o.dur), peak = Math.max(NO * 2, o.peak);
    const atk = Math.min(o.atk ?? 0.005, dur * 0.5);
    const env = ctx.createGain();
    env.gain.setValueAtTime(NO, t);
    env.gain.linearRampToValueAtTime(peak, t + atk);
    if (o.rel) {
      const hold = Math.max(t + atk, t + dur - o.rel);
      env.gain.setValueAtTime(peak, hold);
      env.gain.exponentialRampToValueAtTime(NO, t + dur);
    } else env.gain.exponentialRampToValueAtTime(NO, t + dur);

    const fl = this._filters(o.filter, t, dur);
    for (let i = 0; i < fl.length - 1; i++) fl[i].connect(fl[i + 1]);
    let first = env;
    if (fl.length) { fl[fl.length - 1].connect(env); first = fl[0]; }
    let head = env;
    if (o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; env.connect(p); head = p; }
    head.connect(o.out || this.sfxIn);

    const srcs = [];
    const endT = t + dur + 0.05;
    if (o.noise) {
      const s = ctx.createBufferSource();
      s.buffer = o.noise === 'pink' ? this.pinkBuf : this.whiteBuf;
      s.loop = true;
      s.connect(first);
      s.start(t, this.rnd() * 2.5); s.stop(endT);
      srcs.push(s);
    } else {
      const f0 = o.freq;
      (o.partials || [{ type: 'sine' }]).forEach((p, idx) => {
        const os = ctx.createOscillator();
        os.type = p.type || 'sine';
        const ratio = p.ratio || 1;
        os.frequency.setValueAtTime(f0 * ratio, t);
        if (p.slideTo) os.frequency.exponentialRampToValueAtTime(Math.max(20, p.slideTo * ratio), t + (p.slideT || dur));
        if (p.detune) os.detune.value = p.detune;
        let node = os;
        if (p.dec || (p.gain !== undefined && p.gain !== 1)) {
          const g = ctx.createGain();
          g.gain.setValueAtTime(p.gain ?? 1, t);
          if (p.dec) g.gain.exponentialRampToValueAtTime(NO, t + Math.min(p.dec, dur));
          os.connect(g); node = g;
        }
        node.connect(first);
        os.start(t); os.stop(endT); srcs.push(os);
        if (idx === 0 && o.fm) {
          const mod = ctx.createOscillator();
          mod.frequency.value = f0 * o.fm.ratio;
          const mg = ctx.createGain();
          mg.gain.setValueAtTime(o.fm.index * f0, t);
          mg.gain.exponentialRampToValueAtTime(1, t + o.fm.dec);
          mod.connect(mg); mg.connect(os.frequency);
          mod.start(t); mod.stop(endT); srcs.push(mod);
        }
      });
    }
    const all = [env, head, ...fl];
    srcs[0].onended = () => {
      for (const n of all) { try { n.disconnect(); } catch (e) { /* */ } }
      if (cost > 0) this.v[kind]--;
    };
    return true;
  }

  _tone(t, f, dur, peak, extra) {
    return this._voice(Object.assign({ t, freq: f, dur, peak, partials: [{ type: 'sine' }] }, extra));
  }
  _bell(t, f, dur, peak, extra) {
    return this._voice(Object.assign({
      t, freq: f, dur, peak, atk: 0.004,
      partials: [{ type: 'sine' }, { type: 'sine', ratio: 2, gain: 0.12, dec: dur * 0.3 }],
      fm: { ratio: 3.5, index: 0.8, dec: dur * 0.2 },
    }, extra));
  }
  _noiseHit(t, dur, peak, filter, extra) {
    return this._voice(Object.assign({ t, dur, peak, noise: 'white', filter, atk: 0.004 }, extra));
  }
  _blip(t, f0, f1, dur, peak, extra) {
    return this._voice(Object.assign({
      t, freq: f0, dur, peak, atk: 0.004,
      partials: [{ type: 'sine', slideTo: f1, slideT: dur * 0.8 }],
    }, extra));
  }

  // -------- UI ---------
  ui(name) {
    const t = this.ctx.currentTime + 0.006;
    switch (name) {
      case 'tap': this._blip(t, 780, 600, 0.07, 0.2); this._tone(t, 1560, 0.03, 0.04); break;
      case 'back': this._blip(t, 560, 380, 0.11, 0.2, { filter: { type: 'lowpass', f: 2500 } }); break;
      case 'buy': this._bell(t, 988, 0.4, 0.2); this._bell(t + 0.09, 1319, 0.55, 0.22); this._bell(t + 0.2, 1760, 0.6, 0.12); break;
      case 'error':
        this._tone(t, 233, 0.16, 0.22, { partials: [{ type: 'triangle' }], filter: { type: 'lowpass', f: 900 } });
        this._tone(t + 0.13, 196, 0.24, 0.22, { partials: [{ type: 'triangle' }], filter: { type: 'lowpass', f: 800 } }); break;
      case 'coin': this._bell(t, 1319, 0.22, 0.18); this._bell(t + 0.06, 1760, 0.45, 0.2); break;
      case 'star': [880, 1175, 1568].forEach((f, i) => this._bell(t + i * 0.07, f, 0.55, 0.16)); break;
      case 'success':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this._bell(t + i * 0.1, f, 0.9, 0.18));
        [261.63, 329.63, 392].forEach((f) => this._tone(t + 0.28, f, 1.2, 0.07, { atk: 0.05, rel: 0.7, partials: [{ type: 'triangle' }], filter: { type: 'lowpass', f: 1500 } }));
        break;
      case 'fail':
        [329.63, 261.63, 220].forEach((f, i) => this._tone(t + i * 0.2, f, 0.55, 0.2, { atk: 0.02, partials: [{ type: 'triangle' }], filter: { type: 'lowpass', f: 1100 } })); break;
      case 'open':
        this._noiseHit(t, 0.28, 0.1, [{ type: 'bandpass', f: 500, fEnd: 2400, q: 0.9, fT: 0.26 }], { atk: 0.08 });
        this._blip(t, 440, 587, 0.14, 0.12); break;
      case 'close':
        this._noiseHit(t, 0.25, 0.09, [{ type: 'bandpass', f: 2200, fEnd: 450, q: 0.9, fT: 0.23 }], { atk: 0.05 });
        this._blip(t, 587, 440, 0.12, 0.11); break;
      case 'tick': this._tone(t, 1250, 0.03, 0.09); break;
      case 'tab': this._blip(t, 700, 740, 0.06, 0.15); this._blip(t + 0.05, 880, 900, 0.07, 0.13); break;
      default: return false;
    }
    return true;
  }

  // -------- разовые эффекты ---------
  sfx(name) {
    const t = this.ctx.currentTime + 0.006;
    const r = this.rnd;
    switch (name) {
      case 'sparkle': {
        const base = [2093, 2349, 2637, 3136][Math.floor(r() * 4)];
        this._bell(t, base, 0.5, 0.1, { pan: (r() - 0.5) * 0.6 }); this._bell(t + 0.06, base * 1.5, 0.45, 0.06);
        break;
      }
      case 'find':
        this._bell(t, 784, 0.6, 0.17); this._bell(t + 0.12, 1175, 0.9, 0.17);
        this._noiseHit(t, 0.5, 0.025, [{ type: 'highpass', f: 5000 }, { type: 'lowpass', f: 9000 }], { atk: 0.15 }); break;
      case 'collect':
        [659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this._bell(t + i * 0.07, f, 0.6, 0.15));
        this._bell(t + 0.32, 1760, 0.7, 0.1); break;
      case 'timeup':
        this._tone(t, 220, 1.4, 0.2, { partials: [{ type: 'sine' }, { type: 'sine', ratio: 2.76, gain: 0.25, dec: 0.5 }], filter: { type: 'lowpass', f: 1800 } });
        this._tone(t + 0.25, 164.8, 1.4, 0.18, { partials: [{ type: 'sine' }, { type: 'sine', ratio: 2.76, gain: 0.2, dec: 0.5 }], filter: { type: 'lowpass', f: 1500 } }); break;
      case 'rescue':
        [392, 493.9, 587.3].forEach((f) => this._tone(t, f, 1.1, 0.1, { atk: 0.35, rel: 0.6, partials: [{ type: 'triangle' }], filter: { type: 'lowpass', f: 1800 } }));
        this._bell(t + 0.45, 1174.7, 0.9, 0.14); break;
      case 'regrow':
        this._tone(t, 120, 0.7, 0.2, { atk: 0.1, partials: [{ type: 'sine', slideTo: 230, slideT: 0.6 }, { type: 'triangle', gain: 0.3, slideTo: 230, slideT: 0.6 }], filter: { type: 'lowpass', f: 500 } });
        this._noiseHit(t, 0.6, 0.06, [{ type: 'bandpass', f: 300, fEnd: 1100, q: 1.2, fT: 0.55 }], { atk: 0.15 });
        this._blip(t + 0.25, 260, 520, 0.05, 0.08); this._blip(t + 0.4, 300, 600, 0.05, 0.08); break;
      case 'ghost':
        this._voice({ t, freq: 440, dur: 1.5, peak: 0.1, atk: 0.4, rel: 0.7, partials: [{ type: 'sine', slideTo: 330, slideT: 1.4 }, { type: 'sine', ratio: 1.01, gain: 0.6, slideTo: 330, slideT: 1.4 }], filter: { type: 'lowpass', f: 1400 } });
        this._noiseHit(t, 1.4, 0.03, [{ type: 'bandpass', f: 900, fEnd: 500, q: 2, fT: 1.3 }], { atk: 0.5, rel: 0.6 }); break;
      case 'shake':
        for (let i = 0; i < 4; i++) this._noiseHit(t + i * 0.07, 0.07, 0.11, [{ type: 'bandpass', f: 3500 + r() * 1500, q: 1.5 }], { atk: 0.003 });
        this._tone(t, 90, 0.2, 0.15, { partials: [{ type: 'sine', slideTo: 55, slideT: 0.15 }] }); break;
      case 'bubble': {
        const f = 350 + r() * 500;
        this._blip(t, f, f * 2.4, 0.05 + r() * 0.04, 0.12, { pan: (r() - 0.5) * 0.8 }); break;
      }
      case 'dirty':
        this._tone(t, 180, 0.3, 0.2, { partials: [{ type: 'sawtooth', slideTo: 80, slideT: 0.28 }], filter: { type: 'lowpass', f: 600, fEnd: 200 } });
        this._noiseHit(t, 0.25, 0.07, [{ type: 'lowpass', f: 700 }], { atk: 0.01 }); break;
      case 'pop': this._blip(t, 900, 220, 0.045, 0.2); break;
      default: return false;
    }
    return true;
  }

  // -------- инструменты ---------
  toolStart(kind) {
    if (TOOL_KINDS.indexOf(kind) < 0) return;
    if (this.tool && this.tool.kind === kind) return;
    this.toolStop();
    if (this.v.sfx >= this.cap.sfx) return;
    this.v.sfx++;
    const c = this.ctx, t = c.currentTime;
    const out = c.createGain(); out.gain.value = 0; out.connect(this.sfxIn);
    const srcs = [], nodes = [out];
    const ns = (pink) => { const s = c.createBufferSource(); s.buffer = pink ? this.pinkBuf : this.whiteBuf; s.loop = true; s.start(t, this.rnd() * 2.5); srcs.push(s); return s; };
    const osc = (type, f) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.start(t); srcs.push(o); return o; };
    const bq = (type, f, q) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q ?? 0.7; nodes.push(b); return b; };
    const gn = (v) => { const g = c.createGain(); g.gain.value = v; nodes.push(g); return g; };
    const P = {};
    if (kind === 'vacuum') {
      const n = ns(true), lp = bq('lowpass', 500, 0.6), ng = gn(0.4);
      n.connect(lp); lp.connect(ng); ng.connect(out);
      const o1 = osc('sawtooth', 60), o2 = osc('triangle', 121), hl = bq('lowpass', 280, 0.8), hg = gn(0.3);
      o1.connect(hl); o2.connect(hl); hl.connect(hg); hg.connect(out);
      const o3 = osc('sine', 420), wg = gn(0.01); o3.connect(wg); wg.connect(out);
      Object.assign(P, { o1, o2, o3, lp, hl, ng, hg });
    } else if (kind === 'apply') {
      const n = ns(false), hp = bq('highpass', 1800, 0.6), bp = bq('bandpass', 4200, 0.7), fl = gn(0.75), lf = osc('sine', 7.3), lg = gn(0.25), lf2 = osc('sine', 11.9), lg2 = gn(0.12);
      n.connect(hp); hp.connect(bp); bp.connect(fl);
      lf.connect(lg); lg.connect(fl.gain); lf2.connect(lg2); lg2.connect(fl.gain);
      const n2 = ns(true), lp2 = bq('lowpass', 900, 0.5), g2 = gn(0.35); n2.connect(lp2); lp2.connect(g2); g2.connect(out);
      fl.connect(out);
      Object.assign(P, { bp, g2 });
    } else if (kind === 'rinse') {
      const n = ns(false), bp = bq('bandpass', 2200, 0.6), lp = bq('lowpass', 7000, 0.5), g = gn(0.8), lf = osc('sine', 5.1), lg = gn(180);
      n.connect(bp); bp.connect(lp); lp.connect(g); g.connect(out); lf.connect(lg); lg.connect(bp.frequency);
      const n2 = ns(true), lp2 = bq('lowpass', 650, 0.5), g2 = gn(0.6); n2.connect(lp2); lp2.connect(g2); g2.connect(out);
      Object.assign(P, { bp, g, g2 });
    } else {
      const n = ns(false), hp = bq('highpass', 3200, 0.6), bp = bq('peaking', 6000, 0.6), lp = bq('lowpass', 9500, 0.5), fl = gn(0.85), lf = osc('sine', 0.45), lg = gn(0.15);
      bp.gain.value = 4;
      n.connect(hp); hp.connect(bp); bp.connect(lp); lp.connect(fl); fl.connect(out); lf.connect(lg); lg.connect(fl.gain);
      const n2 = ns(true), lp2 = bq('lowpass', 1400, 0.5), g2 = gn(0.3); n2.connect(lp2); lp2.connect(g2); g2.connect(out);
      Object.assign(P, { bp, g2 });
    }
    srcs[0].onended = () => { for (const n of nodes) { try { n.disconnect(); } catch (e) { /* */ } } this.v.sfx--; };
    this.tool = { kind, out, srcs, P, lastT: t, lastU: -1, bubT: 0 };
  }

  toolUpdate(kind, intensity, speed) {
    if (TOOL_KINDS.indexOf(kind) < 0) return;
    if (!this.tool || this.tool.kind !== kind) this.toolStart(kind);
    const T = this.tool;
    if (!T) return;
    const c = this.ctx, now = c.currentTime;
    if (now - T.lastU < 0.025) return;
    const dt = clamp(now - T.lastT, 0, 0.1);
    T.lastU = now; T.lastT = now;
    const i = clamp(num(intensity, 0)), s = clamp(num(speed, 0)), P = T.P;
    const set = (param, v, tc) => param.setTargetAtTime(v, now, tc || 0.06);
    let level;
    if (kind === 'vacuum') {
      const f0 = 56 + 46 * s + 10 * i;
      set(P.o1.frequency, f0, 0.15); set(P.o2.frequency, f0 * 2.01, 0.15); set(P.o3.frequency, f0 * 7, 0.15);
      set(P.lp.frequency, 380 + 1900 * (0.35 * s + 0.65 * i), 0.1);
      set(P.hl.frequency, 220 + 200 * s, 0.1);
      set(P.ng.gain, 0.12 + 0.5 * i, 0.08);
      level = (0.2 + 0.8 * i) * 0.55;
    } else if (kind === 'apply') {
      set(P.bp.frequency, 3600 + 1800 * s, 0.1);
      set(P.g2.gain, 0.2 + 0.3 * i, 0.1);
      level = Math.pow(i, 0.8) * 0.55;
      T.bubT += dt * i * (4 + 8 * s);
      while (T.bubT >= 1) { T.bubT -= 1; this._blip(now + 0.005, 300 + this.rnd() * 700, 1200 + this.rnd() * 800, 0.03 + this.rnd() * 0.03, 0.035 * (0.5 + i), { pan: (this.rnd() - 0.5) * 0.7 }); }
    } else if (kind === 'rinse') {
      set(P.bp.frequency, 1700 + 1700 * s + 600 * i, 0.1);
      set(P.g2.gain, 0.35 + 0.4 * i, 0.1);
      level = Math.pow(i, 0.7) * 0.5;
      T.bubT += dt * i * 3;
      while (T.bubT >= 1) { T.bubT -= 1; this._blip(now + 0.005, 500 + this.rnd() * 600, 1400 + this.rnd() * 600, 0.03, 0.025, { pan: (this.rnd() - 0.5) * 0.7 }); }
    } else {
      set(P.bp.frequency, 5200 + 2200 * s, 0.1);
      set(P.g2.gain, 0.15 + 0.3 * i, 0.1);
      level = Math.pow(i, 0.7) * 0.4;
    }
    set(T.out.gain, level, 0.05);
  }

  toolStop() {
    const T = this.tool;
    if (!T) return;
    this.tool = null;
    const t = this.ctx.currentTime;
    T.out.gain.cancelScheduledValues(t);
    T.out.gain.setTargetAtTime(0, t, 0.04);
    for (const s of T.srcs) { try { s.stop(t + 0.35); } catch (e) { /* */ } }
  }

  // -------- музыка ---------
  musicStart(season, mode) {
    const n = clamp(Math.round(num(season, 1)), 1, 10);
    mode = mode || 'game';
    const S = this.sess;
    if (S && !S.dead && S.season === n && S.mode === mode) return;
    if (S) this._retire(S, 1.6);
    const c = this.ctx, now = c.currentTime;
    const cfg = SEASONS[n];
    const out = c.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(1, now, 0.6);
    out.connect(this.musicDry);
    const send = c.createGain(); send.gain.value = cfg.rev; out.connect(send); send.connect(this.musicWet);
    const layers = {};
    for (const k of ['pad', 'bass', 'arp', 'mel', 'shim', 'perc']) { const g = c.createGain(); g.gain.value = 0; g.connect(out); layers[k] = g; }
    const sess = { season: n, mode, cfg, out, send, layers, tgt: {}, dead: false, next: now + 0.15, step: 0, bar: 0, ci: -1, variant: 0, chord: cfg.prog[0][0],
      melIdx: 0, melPlan: [], melLast: null, arpI: 0, arpDir: 1, melPool: null };
    const pool = [];
    for (let mi = cfg.mel.lo; mi <= cfg.mel.hi; mi++) if (cfg.scale.indexOf((((mi - cfg.root) % 12) + 12) % 12) >= 0) pool.push(mi);
    sess.melPool = pool;
    sess.melIdx = Math.floor(pool.length / 3);
    this.sess = sess;
    this._applyLayers(sess, true);
    if (!this.offline && !this.timer) this.timer = setInterval(() => { try { this._pump(0.7); } catch (e) { /* */ } }, 90);
    if (!this.offline) this._pump(0.7);
  }

  _retire(S, fade) {
    S.dead = true;
    const t = this.ctx.currentTime;
    try { S.out.gain.cancelScheduledValues(t); S.out.gain.setTargetAtTime(0, t, fade / 4); } catch (e) { /* */ }
    const kill = () => { try { S.out.disconnect(); S.send.disconnect(); } catch (e) { /* */ } };
    if (this.sess === S) this.sess = null;
    if (!this.offline) setTimeout(kill, (fade + 3) * 1000);
  }

  musicStop(fade) {
    this.pending = null;
    const S = this.sess;
    if (S) this._retire(S, Math.max(0.05, num(fade, 1.2)));
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  setClean(pct) {
    this.clean = clamp(num(pct, 0), 0, 100);
    if (this.sess) this._applyLayers(this.sess, false);
  }

  _applyLayers(S, instant) {
    const c = clamp(this.clean / 100);
    const ramp = (a, b) => clamp((c - a) / (b - a));
    let tg;
    if (S.mode === 'menu') tg = { pad: 0.9, bass: 0, arp: 0, mel: 1, shim: 0.8, perc: 0 };
    else tg = { pad: 0.8 + 0.2 * c, bass: ramp(0.08, 0.28), perc: ramp(0.2, 0.4), arp: ramp(0.28, 0.5), mel: ramp(0.48, 0.7), shim: ramp(0.74, 0.95) };
    S.tgt = tg;
    const t = this.ctx.currentTime;
    for (const k in tg) {
      const p = S.layers[k].gain;
      if (instant) p.setValueAtTime(tg[k], t); else p.setTargetAtTime(tg[k], t, 1.0);
    }
  }

  _pump(horizon) {
    const S = this.sess;
    if (!S || S.dead || this.paused) return;
    const now = this.ctx.currentTime;
    if (S.next < now - 0.3) S.next = now + 0.05;
    const cfg = S.cfg;
    const spb = cfg.beats * 2;
    const sd = (60 / cfg.bpm / 2) * (S.mode === 'menu' ? 1.15 : 1);
    let guard = 0;
    while (S.next < now + horizon && guard++ < 200) {
      if (S.step === 0) this._onBar(S, S.next, sd, spb);
      this._onStep(S, S.step, S.next, sd, spb);
      S.next += sd;
      S.step++;
      if (S.step >= spb) { S.step = 0; S.bar++; }
    }
  }

  _chordMidi(S, chord, base) {
    let r = S.cfg.root + chord.r;
    while (r >= base + 12) r -= 12;
    while (r < base) r += 12;
    return chord.t.map((i) => r + i);
  }

  _onBar(S, t, sd, spb) {
    const cfg = S.cfg, rnd = this.rnd, menu = S.mode === 'menu';
    const barDur = sd * spb;
    if (S.bar % cfg.bpc === 0) {
      S.ci++;
      if (S.ci >= cfg.prog[S.variant].length) { S.ci = 0; S.variant = Math.floor(rnd() * cfg.prog.length); }
      S.chord = cfg.prog[S.variant][S.ci];
      if (S.tgt.pad > 0.03 && this.v.music < this.cap.music) {
        const notes = this._chordMidi(S, S.chord, cfg.padBase);
        const tm = PAD_TIMBRES[cfg.pad], fc = PAD_TIMBRES[cfg.pad + 'F'];
        const dur = barDur * cfg.bpc + 1.6;
        const pg = (cfg.padGain || 1) * (menu ? 0.8 : 1);
        notes.forEach((mi, k) => {
          this._voice({ kind: 'music', cost: k === 0 ? 1 : 0, t: t + (k * 0.03), freq: mtof(mi), dur, atk: 1.0, rel: 1.5, peak: 0.032 * pg / Math.sqrt(notes.length / 3),
            partials: tm.map((p) => Object.assign({}, p, { gain: (p.gain ?? 1) * 0.6 })), filter: { type: 'lowpass', f: fc, q: 0.4 }, out: S.layers.pad, pan: (k - 1) * 0.25 });
        });
      }
    }
    this._planMel(S, spb, menu);
    // мерцание: редкие высокие звоны по тонам аккорда
    if (S.tgt.shim > 0.03 && rnd() < cfg.shim.p * (menu ? 0.7 : 1)) {
      const tones = this._chordMidi(S, S.chord, 72);
      const n = 1 + (rnd() < 0.4 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const mi = tones[Math.floor(rnd() * tones.length)] + (rnd() < 0.3 ? 12 : 0);
        const spec = NOTE_TIMBRES[cfg.shim.timbre](mtof(mi), 2.4);
        this._voice(Object.assign(spec, { kind: 'music', t: t + rnd() * barDur * 0.8 + k * 0.18, freq: mtof(mi), dur: 2.4, peak: 0.028, out: S.layers.shim, pan: (rnd() - 0.5) * 1.2 }));
      }
    }
  }

  _planMel(S, spb, menu) {
    const cfg = S.cfg, mc = cfg.mel, rnd = this.rnd, pool = S.melPool;
    const plan = [];
    S.melPlan = plan;
    if (S.tgt.mel < 0.03) { S.melLast = null; return; }
    const restP = menu ? 0.55 : mc.rest;
    if (rnd() < restP) return;
    const isChordTone = (mi) => {
      const rel = (((mi - cfg.root - S.chord.r) % 12) + 12) % 12;
      return S.chord.t.some((x) => x % 12 === rel);
    };
    const snap = () => {
      let best = S.melIdx, bd = 99;
      for (let k = 0; k < pool.length; k++) if (isChordTone(pool[k]) && Math.abs(k - S.melIdx) < bd) { bd = Math.abs(k - S.melIdx); best = k; }
      return best;
    };
    if (S.melLast && S.melLast.length && !menu && rnd() < 0.38) {
      const shift = [0, 0, 1, -1, 2, -2][Math.floor(rnd() * 6)];
      for (const e of S.melLast) plan.push({ step: e.step, len: e.len, idx: clamp(e.idx + shift, 0, pool.length - 1), vel: e.vel, g: e.g });
    } else {
      const lens = menu ? [4, 5, 6, 8] : mc.lens;
      const dens = menu ? 0.16 : mc.dens;
      let pos = 0, first = true;
      while (pos < spb) {
        const w = pos % 4 === 0 ? 1.3 : pos % 2 === 0 ? 1 : 0.55;
        if (rnd() < dens * w * (first ? 1.8 : 1)) {
          if (first && rnd() < 0.7) S.melIdx = snap();
          else {
            const d = rnd() < mc.leap ? (rnd() < 0.5 ? -1 : 1) * (3 + Math.floor(rnd() * 2)) : [-2, -1, -1, 0, 1, 1, 2][Math.floor(rnd() * 7)];
            let ni = S.melIdx + d;
            if (ni < 0) ni = -ni;
            if (ni > pool.length - 1) ni = 2 * (pool.length - 1) - ni;
            S.melIdx = clamp(ni, 0, pool.length - 1);
          }
          const len = Math.min(lens[Math.floor(rnd() * lens.length)], spb - pos);
          plan.push({ step: pos, len, idx: S.melIdx, vel: 0.7 + rnd() * 0.3, g: mc.orn && rnd() < mc.orn ? 1 : 0 });
          pos += len; first = false;
        } else pos += 1;
      }
      if (plan.length) S.melLast = plan.map((e) => Object.assign({}, e));
    }
  }

  _onStep(S, step, t, sd, spb) {
    const cfg = S.cfg, rnd = this.rnd, tg = S.tgt, menu = S.mode === 'menu';
    const sw = step % 2 === 1 ? cfg.swing * sd : 0;
    const tt = t + sw;
    const L = S.layers;
    const jitter = () => (rnd() - 0.5) * 0.012;
    // бас
    if (tg.bass > 0.03) {
      for (const e of cfg.bass.pat) {
        if (e[0] !== step || rnd() > e[3]) continue;
        const c0 = S.chord;
        const root = this._chordMidi(S, c0, cfg.bass.base)[0];
        const tone = e[1] === 0 ? root : e[1] === 1 ? root + (c0.t[2] ?? 7) : e[1] === 2 ? root + (c0.t[1] ?? 4) : root + 12;
        const d = e[2] * sd * 0.95;
        this._voice(Object.assign(NOTE_TIMBRES[cfg.bass.timbre](mtof(tone), d), { kind: 'music', t: tt + jitter(), freq: mtof(tone), peak: 0.15, out: L.bass }));
      }
    }
    // арпеджио
    if (tg.arp > 0.03) {
      const a = cfg.arp, w = a.w[step % a.w.length];
      if (w > 0 && rnd() < w) {
        const tones = this._chordMidi(S, S.chord, a.base);
        if (a.mode === 'stab') {
          tones.slice(0, 3).forEach((mi, k) => this._voice(Object.assign(NOTE_TIMBRES[a.timbre](mtof(mi), 0.5), { kind: 'music', cost: k === 0 ? 1 : 0, t: tt, freq: mtof(mi), peak: 0.04 * a.vel, out: L.arp, pan: (k - 1) * 0.3 })));
        } else {
          const seq = tones.concat(tones.map((x) => x + 12));
          let mi;
          if (a.mode === 'rand') mi = seq[Math.floor(rnd() * seq.length)];
          else if (a.mode === 'up') { mi = seq[S.arpI % seq.length]; S.arpI++; }
          else { S.arpI += S.arpDir; if (S.arpI >= seq.length - 1) S.arpDir = -1; if (S.arpI <= 0) S.arpDir = 1; mi = seq[clamp(S.arpI, 0, seq.length - 1)]; }
          const d = 0.9 + rnd() * 0.5;
          this._voice(Object.assign(NOTE_TIMBRES[a.timbre](mtof(mi), d), { kind: 'music', t: tt + jitter(), freq: mtof(mi), peak: 0.065 * a.vel * (0.75 + rnd() * 0.25), out: L.arp, pan: (rnd() - 0.5) * 0.8 }));
        }
      }
    }
    // мелодия
    if (S.melPlan.length) {
      const mc = cfg.mel;
      for (const e of S.melPlan) {
        if (e.step !== step) continue;
        const mi = S.melPool[e.idx];
        const d = Math.max(0.2, e.len * sd * (menu ? 1.2 : 1.0));
        if (e.g) {
          const gi = S.melPool[clamp(e.idx + 1, 0, S.melPool.length - 1)];
          this._voice(Object.assign(NOTE_TIMBRES[mc.timbre](mtof(gi), 0.18), { kind: 'music', t: tt - 0.07, freq: mtof(gi), peak: 0.04 * mc.vel, out: L.mel }));
        }
        const timbre = menu && mc.timbre !== 'bell' && mc.timbre !== 'box' ? 'box' : mc.timbre;
        const dd = (timbre === 'cello' || timbre === 'horn') ? d : Math.min(d + 0.6, 2.2);
        this._voice(Object.assign(NOTE_TIMBRES[timbre](mtof(mi), dd), { kind: 'music', t: tt + jitter(), freq: mtof(mi), peak: 0.085 * mc.vel * e.vel * (menu ? 0.8 : 1), out: L.mel, pan: (rnd() - 0.5) * 0.4 }));
      }
    }
    // перкуссия
    if (tg.perc > 0.03 && cfg.perc) {
      for (const e of cfg.perc) {
        if (e[0] !== step || rnd() > e[3]) continue;
        this._perc(S, e[1], tt + jitter(), e[2] * (0.85 + rnd() * 0.3));
      }
    }
  }

  _perc(S, type, t, v) {
    const out = S.layers.perc, K = 'music';
    switch (type) {
      case 'kick': this._tone(t, 120, 0.3, 0.3 * v, { kind: K, out, atk: 0.003, partials: [{ type: 'sine', slideTo: 46, slideT: 0.12 }] }); break;
      case 'timp':
        this._tone(t, 98, 1.6, 0.3 * v, { kind: K, out, atk: 0.006, partials: [{ type: 'sine', slideTo: 76, slideT: 0.35 }, { type: 'sine', ratio: 1.5, gain: 0.2, dec: 0.4 }] });
        this._noiseHit(t, 0.08, 0.04 * v, { type: 'lowpass', f: 500 }, { kind: K, out, cost: 0 }); break;
      case 'hat': this._noiseHit(t, 0.06, 0.05 * v, [{ type: 'highpass', f: 6500 }, { type: 'lowpass', f: 11000 }], { kind: K, out }); break;
      case 'shaker': this._noiseHit(t, 0.1, 0.05 * v, [{ type: 'bandpass', f: 5500, q: 0.8 }], { kind: K, out, atk: 0.02 }); break;
      case 'drum':
        this._tone(t, 230, 0.22, 0.28 * v, { kind: K, out, atk: 0.003, partials: [{ type: 'sine', slideTo: 140, slideT: 0.08 }, { type: 'triangle', gain: 0.3, slideTo: 140, slideT: 0.08 }], filter: { type: 'lowpass', f: 1800 } });
        this._noiseHit(t, 0.03, 0.04 * v, { type: 'bandpass', f: 1500, q: 1 }, { kind: K, out, cost: 0 }); break;
      case 'rim': this._tone(t, 1250, 0.04, 0.1 * v, { kind: K, out, atk: 0.002 }); break;
      case 'snap': this._noiseHit(t, 0.12, 0.09 * v, [{ type: 'bandpass', f: 1900, q: 0.9 }], { kind: K, out, atk: 0.003 }); break;
      default: break;
    }
  }

  // -------- жизненный цикл ---------
  unlock() {
    if (this.dead) return;
    try {
      if (!this.ctx) {
        const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AC) { this.dead = true; return; }
        let ctx;
        try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
        this.build(ctx, false);
        try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) { /* iOS kick */ }
        if (this.pending) { const p = this.pending; this.pending = null; this.musicStart(p.season, p.mode); }
      }
      if (!this.paused && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) { const pr = this.ctx.resume(); if (pr && pr.catch) pr.catch(() => {}); }
    } catch (e) { this.dead = true; }
  }
}

// ---------------------------------------------------------------------------
// Публичный фасад. Каждый метод обёрнут: нет контекста/ошибка — тихо ничего.
// ---------------------------------------------------------------------------
const E = new Engine();
const live = () => !E.dead && E.ctx && !E.paused;
const safe = (fn) => (...a) => { try { return fn(...a); } catch (e) { return undefined; } };

export const audio = {
  init: safe((settings) => { if (settings) audio.setVolumes(settings); }),
  unlock: safe(() => E.unlock()),
  setVolumes: safe((v) => {
    if (!v) return;
    if (v.music !== undefined) E.vol.music = clamp(num(v.music, 0.7));
    if (v.sfx !== undefined) E.vol.sfx = clamp(num(v.sfx, 0.9));
    if (E.ctx) E._applyVol(false);
  }),
  ui: safe((name) => { if (live()) E.ui(name); }),
  sfx: safe((name) => { if (live()) E.sfx(name); }),
  toolStart: safe((kind) => { if (live()) E.toolStart(kind); }),
  toolUpdate: safe((kind, intensity, speed) => { if (live()) E.toolUpdate(kind, intensity, speed); }),
  toolStop: safe(() => { if (E.ctx && !E.dead) E.toolStop(); }),
  musicStart: safe((season) => { if (E.dead) return; if (live()) E.musicStart(season, 'game'); else E.pending = { season, mode: 'game' }; }),
  musicMenu: safe((season) => { if (E.dead) return; if (live()) E.musicStart(season, 'menu'); else E.pending = { season, mode: 'menu' }; }),
  musicSetClean: safe((pct) => { E.clean = clamp(num(pct, 0), 0, 100); if (live()) E.setClean(pct); }),
  musicStop: safe((fadeSec) => { if (E.ctx && !E.dead) E.musicStop(fadeSec); else E.pending = null; }),
  suspend: safe(() => {
    E.paused = true;
    if (E.timer) { clearInterval(E.timer); E.timer = null; }
    if (E.ctx && !E.dead) { const p = E.ctx.suspend(); if (p && p.catch) p.catch(() => {}); }
  }),
  resume: safe(() => {
    E.paused = false;
    if (E.ctx && !E.dead) {
      const p = E.ctx.resume(); if (p && p.catch) p.catch(() => {});
      if (E.sess && !E.sess.dead && !E.timer) E.timer = setInterval(() => { try { E._pump(0.7); } catch (e) { /* */ } }, 90);
    }
  }),

  // Для тестов: рендер звука в OfflineAudioContext. name: 'ui:tap' | 'sfx:sparkle' | 'tool:vacuum' | 'music:3' | 'menu:3'.
  // opts: {sr, seed, clean (число 0..100 — фиксированно; иначе линейно 0->100), profile(t)->{i,s}}.
  // Возвращает Float32Array (моно) с полями sampleRate, left, right.
  async _renderTest(name, seconds = 2, opts = {}) {
    const OAC = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
    const sr = opts.sr || 44100;
    const ctx = new OAC(2, Math.ceil(sr * seconds), sr);
    const e = new Engine();
    e.rnd = mulberry32(opts.seed || 1234);
    e.build(ctx, true);
    e.vol = { music: 1, sfx: 1 };
    e._applyVol(true);
    let type, arg;
    if (name.indexOf(':') > 0) [type, arg] = name.split(':');
    else if (UI_NAMES.indexOf(name) >= 0) { type = 'ui'; arg = name; } else { type = 'sfx'; arg = name; }
    const at = (t, fn) => ctx.suspend(t).then(() => { fn(); ctx.resume(); });
    if (type === 'ui') e.ui(arg);
    else if (type === 'sfx') e.sfx(arg);
    else if (type === 'tool') {
      const prof = opts.profile || ((t) => ({ i: 0.5 + 0.5 * Math.sin(t * 3), s: 0.5 + 0.5 * Math.sin(t * 1.7 + 1) }));
      e.toolUpdate(arg, 0.8, 0.4);
      for (let t = 0.1; t < seconds - 0.4; t += 0.1) at(t, () => { const p = prof(t); e.toolUpdate(arg, p.i, p.s); });
      at(Math.max(0.2, seconds - 0.4), () => e.toolStop());
    } else if (type === 'music' || type === 'menu') {
      const pct = (t) => (opts.clean !== undefined ? opts.clean : (t / seconds) * 100);
      e.clean = pct(0);
      e.musicStart(Number(arg), type === 'menu' ? 'menu' : 'game');
      e._pump(1.0);
      for (let t = 0.5; t < seconds - 0.05; t += 0.5) at(t, () => { e.setClean(pct(t)); e._pump(1.0); });
    }
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), out = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) out[i] = (L[i] + R[i]) * 0.5;
    out.sampleRate = sr;
    out.left = L; out.right = R;
    return out;
  },
};

export default audio;
