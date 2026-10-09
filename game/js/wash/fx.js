// Лёгкая система частиц для экрана мойки (координаты в CSS-пикселях сцены).
import { clamp } from '../util.js';

export class Particles {
  constructor(max = 260) { this.p = []; this.max = max; }
  add(o) { if (this.p.length >= this.max) this.p.shift(); this.p.push(o); }
  dust(x, y, tx, ty) { for (let i = 0; i < 2; i++) this.add({ k: 'dust', x: x + rnd(-14, 14), y: y + rnd(-14, 14), tx, ty, life: 0.5, max: 0.5, r: rnd(1.5, 3.5) }); }
  bubble(x, y, col) { this.add({ k: 'bubble', x: x + rnd(-16, 16), y: y + rnd(-12, 12), vx: rnd(-10, 10), vy: rnd(-26, -8), life: rnd(0.5, 1.1), max: 1, r: rnd(2.5, 7), col }); }
  drop(x, y) { const a = rnd(0, Math.PI * 2), s = rnd(40, 140); this.add({ k: 'drop', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: rnd(0.3, 0.6), max: 0.6, r: rnd(1.4, 3) }); }
  steam(x, y) { this.add({ k: 'steam', x: x + rnd(-12, 12), y: y + rnd(-6, 6), vx: rnd(-8, 8), vy: rnd(-46, -20), life: rnd(0.6, 1.1), max: 1.1, r: rnd(7, 15) }); }
  sparkle(x, y) { for (let i = 0; i < 7; i++) { const a = rnd(0, Math.PI * 2), s = rnd(30, 90); this.add({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.5, 0.9), max: 0.9, r: rnd(3, 6.5) }); } }
  coin(x, y) { for (let i = 0; i < 10; i++) { const a = rnd(-Math.PI, 0), s = rnd(60, 200); this.add({ k: 'coin', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, max: 1, r: rnd(4, 7) }); } }
  update(dt) {
    const a = this.p;
    for (let i = a.length - 1; i >= 0; i--) {
      const q = a[i];
      q.life -= dt;
      if (q.life <= 0) { a.splice(i, 1); continue; }
      if (q.k === 'dust') { q.x += (q.tx - q.x) * Math.min(1, dt * 7); q.y += (q.ty - q.y) * Math.min(1, dt * 7); }
      else {
        q.x += q.vx * dt; q.y += q.vy * dt;
        if (q.k === 'drop' || q.k === 'coin') q.vy += 380 * dt;
      }
    }
  }
  draw(g) {
    for (const q of this.p) {
      const t = clamp(q.life / q.max, 0, 1);
      if (q.k === 'dust') { g.fillStyle = `rgba(190,170,140,${0.5 * t})`; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.3); g.fill(); }
      else if (q.k === 'bubble') {
        g.strokeStyle = `rgba(255,255,255,${0.9 * t})`; g.fillStyle = `rgba(${q.col || '255,255,255'},${0.35 * t})`; g.lineWidth = 1.2;
        g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.3); g.fill(); g.stroke();
        g.fillStyle = `rgba(255,255,255,${0.8 * t})`; g.beginPath(); g.arc(q.x - q.r * 0.3, q.y - q.r * 0.3, q.r * 0.25, 0, 6.3); g.fill();
      } else if (q.k === 'drop') { g.fillStyle = `rgba(110,184,236,${0.85 * t})`; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.3); g.fill(); }
      else if (q.k === 'steam') { g.fillStyle = `rgba(255,255,255,${0.22 * t})`; g.beginPath(); g.arc(q.x, q.y, q.r * (1.6 - t * 0.6), 0, 6.3); g.fill(); }
      else if (q.k === 'spark') { g.fillStyle = `rgba(255,226,120,${t})`; star4(g, q.x, q.y, q.r * (0.5 + t)); }
      else if (q.k === 'coin') { g.fillStyle = `rgba(242,184,68,${t})`; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.3); g.fill(); g.strokeStyle = `rgba(185,133,42,${t})`; g.lineWidth = 1.4; g.stroke(); }
    }
  }
}
function rnd(a, b) { return a + Math.random() * (b - a); }
export function star4(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r; const a = (i * Math.PI) / 4 - Math.PI / 2; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}
