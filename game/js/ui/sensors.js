// Наклон и встряска телефона. Всегда есть запасные кнопки на экране мойки.
import { clamp } from '../util.js';

const S = {
  enabled: false, available: typeof window !== 'undefined' && ('DeviceOrientationEvent' in window),
  gx: 0, gy: 0, listeners: false, lastShake: 0, onShake: null, base: null,
  needsPermission: typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function',
};

function onOri(e) {
  if (e.gamma == null || e.beta == null) return;
  S.gx = clamp(e.gamma / 28, -1, 1);
  S.gy = clamp((e.beta - 42) / 28, -1, 1);
  S.got = true;
}
let prevMag = 9.8;
function onMotion(e) {
  const a = e.accelerationIncludingGravity;
  if (!a) return;
  const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
  const jump = Math.abs(mag - prevMag);
  prevMag = mag;
  const now = performance.now();
  if (jump > 14 && now - S.lastShake > 900) { S.lastShake = now; S.onShake && S.onShake(); }
}

export const sensors = {
  get gx() { return S.enabled ? S.gx : 0; },
  get gy() { return S.enabled ? S.gy : 0; },
  get active() { return S.enabled && S.got; },
  get needsPermission() { return S.needsPermission; },
  get available() { return S.available; },
  /** Вызывать из жеста пользователя (кнопка). Возвращает true, если датчики включены. */
  async enable() {
    try {
      if (S.needsPermission) {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') return false;
        if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) { try { await DeviceMotionEvent.requestPermission(); } catch (e) { /* ничего */ } }
      }
      if (!S.listeners) {
        window.addEventListener('deviceorientation', onOri);
        window.addEventListener('devicemotion', onMotion);
        S.listeners = true;
      }
      S.enabled = true;
      return true;
    } catch (e) { return false; }
  },
  disable() { S.enabled = false; },
  setShakeHandler(fn) { S.onShake = fn; },
};
