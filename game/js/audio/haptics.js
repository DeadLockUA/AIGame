// Тактильный отклик «Чистого ворса».
// Android/Chrome: navigator.vibrate с микро-импульсами. iOS 17.4+: обходной приём с <input type="checkbox" switch>
// внутри <label> — программный click() по такому переключателю даёт лёгкий щелчок, но только из жеста пользователя.
// Все вызовы безопасны: при любой ошибке/отсутствии API тихо ничего не делается.

const nav = typeof navigator !== 'undefined' ? navigator : null;
const doc = typeof document !== 'undefined' ? document : null;
const win = typeof window !== 'undefined' ? window : null;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);

let level = 1;           // настройка игрока 0..1
let activated = false;   // был ли жест пользователя (Chrome игнорирует vibrate до него)
let lastTool = 0;        // время последнего импульса инструмента
let lastIOS = -1e9;      // время последнего iOS-щелчка
let inGesture = false;   // выполняемся прямо внутри обработчика жеста (флаг ставит наш capture-слушатель)
let pendingIOS = false;  // iOS: щелчок отложен до ближайшего жеста
let installed = false;
let iosEl = null;

const hasVibrate = !!(nav && typeof nav.vibrate === 'function');
const isIOS = (() => {
  try {
    if (hasVibrate || !nav) return false;
    const ua = nav.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && (nav.maxTouchPoints || 0) > 1);
  } catch (e) { return false; }
})();

function userActive() {
  try { if (nav && nav.userActivation && nav.userActivation.hasBeenActive) return true; } catch (e) { /* */ }
  return activated;
}

// ---------- iOS ----------
function ensureIOS() {
  if (iosEl || !doc) return iosEl;
  try {
    const label = doc.createElement('label');
    const input = doc.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.style.display = 'none';
    label.setAttribute('aria-hidden', 'true');
    label.appendChild(input);
    (doc.head || doc.body || doc.documentElement).appendChild(label);
    iosEl = label;
  } catch (e) { iosEl = null; }
  return iosEl;
}

function iosClick() {
  try {
    const el = ensureIOS();
    if (!el) return;
    el.click();
    lastIOS = now();
  } catch (e) { /* */ }
}

// Просьба о щелчке на iOS: исполняется сразу, если мы внутри жеста, иначе откладывается до следующего жеста.
function iosRequest(minGap) {
  if (level <= 0) return;
  const t = now();
  if (t - lastIOS < minGap) return;
  if (inGesture) { iosClick(); pendingIOS = false; } else pendingIOS = true;
}

function onGesture() {
  activated = true;
  inGesture = true;
  setTimeout(() => { inGesture = false; }, 0);
  if (pendingIOS && isIOS && level > 0 && now() - lastIOS >= 140) { pendingIOS = false; iosClick(); }
}

function install() {
  if (installed || !win) return;
  installed = true;
  try {
    const opt = { capture: true, passive: true };
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'click', 'keydown']) win.addEventListener(ev, onGesture, opt);
  } catch (e) { /* */ }
}

// ---------- Android ----------
function vib(p) {
  try {
    if (!hasVibrate || level <= 0 || !userActive()) return;
    nav.vibrate(p);
  } catch (e) { /* */ }
}

// Масштабируем длительности импульсов (чётные индексы) настройкой, паузы оставляем.
function scalePattern(arr) {
  const k = 0.4 + 0.6 * level;
  return arr.map((v, i) => (i % 2 === 0 ? Math.max(4, Math.round(v * k)) : v));
}

const EVENTS = {
  tap: { a: [10], ios: 1 },
  sparkle: { a: [14], ios: 1 },
  find: { a: [18, 45, 26], ios: 2 },
  collect: { a: [16, 40, 16, 40, 30], ios: 2 },
  success: { a: [10, 40, 16, 40, 22, 40, 32, 40, 46, 50, 90], ios: 3 },
  fail: { a: [260], ios: 1 },
  buy: { a: [14, 45, 30], ios: 2 },
  shake: { a: [30, 35, 30, 35, 30, 35, 30], ios: 2 },
  warn: { a: [40, 70, 40], ios: 2 },
  rescue: { a: [20, 50, 20, 50, 60], ios: 2 },
};

// Параметры инструментов: интервал между импульсами, длина импульса.
const TOOLS = {
  vacuum: (i, s) => ({ gap: 62 - 18 * s, len: 14 + 16 * i, ios: 150 }),   // ровное жужжание
  apply: (i, s) => ({ gap: 115 - 30 * s, len: 8 + 8 * i, ios: 170, jit: 0.3 }), // мягкое шуршание, редко
  rinse: (i, s) => ({ gap: 72 - 12 * s, len: 20 + 14 * i, ios: 150 }),    // ровные средние
  steam: (i, s) => ({ gap: 46, len: 6 + 6 * i, ios: 140 }),               // частые лёгкие
};

export const haptics = {
  supported: hasVibrate,
  ios: isIOS,

  setIntensity(v) {
    try {
      level = clamp(num(v, 1));
      if (level <= 0) { pendingIOS = false; if (hasVibrate) nav.vibrate(0); }
    } catch (e) { /* */ }
  },
  get intensity() { return level; },

  // Вызывать из обработчика первого касания (вместе с audio.unlock()).
  unlock() {
    try {
      install();
      activated = true;
      if (isIOS) ensureIOS();
    } catch (e) { /* */ }
  },

  // Каждый кадр во время мойки: сам ограничивает частоту.
  tool(kind, intensity, speed) {
    try {
      if (level <= 0) return;
      const f = TOOLS[kind];
      if (!f) return;
      const i = clamp(num(intensity, 0)), s = clamp(num(speed, 0));
      if (i < 0.04) return;
      const p = f(i, s);
      const t = now();
      if (isIOS) {
        // редкие щелчки: чем слабее работа/настройка, тем реже
        iosRequest(Math.max(140, p.ios + (1 - i) * 100 + (1 - level) * 80));
        return;
      }
      if (!hasVibrate) return;
      let gap = p.gap / (0.6 + 0.4 * level) * (1.25 - 0.25 * i);
      if (p.jit) gap *= 1 + (Math.random() - 0.5) * p.jit * 2;
      gap = Math.max(45, gap);
      if (t - lastTool < gap) return;
      lastTool = t;
      let len = p.len * (0.35 + 0.65 * level);
      len = clamp(len, 5, gap - 6);
      vib(Math.round(len));
    } catch (e) { /* */ }
  },

  event(name) {
    try {
      if (level <= 0) return;
      const e = EVENTS[name];
      if (!e) return;
      if (isIOS) {
        iosRequest(0);
        for (let k = 1; k < e.ios; k++) setTimeout(() => iosRequest(0), k * 85);
        return;
      }
      vib(scalePattern(e.a));
    } catch (er) { /* */ }
  },

  // Прервать вибрацию (например, при паузе/выходе из мойки).
  stop() {
    try { pendingIOS = false; if (hasVibrate) nav.vibrate(0); } catch (e) { /* */ }
  },
};

export default haptics;
