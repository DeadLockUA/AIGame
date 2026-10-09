// Процедурные аватары клиентов (SVG).
const SKIN = ['#fbd9c0', '#f2c19b', '#d99b6c', '#b87649', '#8a5532'];
const HAIR = ['#2b1d18', '#5a3a26', '#9c6a3a', '#d8a85a', '#c9c4bc', '#a6422f', '#3d4a66', '#1e1e24'];
const SHIRT = ['#d9644a', '#2a8c8c', '#f2b844', '#6a79c8', '#7aa56a', '#c75b8c', '#4d4a63', '#e98f5a'];

export function avatarSvg(a = {}, size = 56) {
  const skin = SKIN[(a.skin ?? 0) % SKIN.length], hair = HAIR[(a.hair ?? 0) % HAIR.length], shirt = SHIRT[(a.shirt ?? 0) % SHIRT.length];
  const hs = (a.hairStyle ?? 0) % 6, ac = (a.accessory ?? 0) % 6;
  let hairBack = '', hairFront = '';
  if (hs === 1) hairBack = `<path d="M12 30c0-12 6-18 16-18s16 6 16 18v14H12z" fill="${hair}"/>`;
  if (hs === 2) hairBack = `<circle cx="28" cy="9" r="6" fill="${hair}"/>`;
  if (hs === 4) hairBack = `<circle cx="14" cy="22" r="6" fill="${hair}"/><circle cx="42" cy="22" r="6" fill="${hair}"/><circle cx="20" cy="14" r="6" fill="${hair}"/><circle cx="36" cy="14" r="6" fill="${hair}"/><circle cx="28" cy="12" r="6" fill="${hair}"/>`;
  if (hs === 0) hairFront = `<path d="M14 25c0-9 6-13 14-13s14 4 14 13c-4-4-9-6-14-6s-10 2-14 6z" fill="${hair}"/>`;
  if (hs === 1 || hs === 4) hairFront = `<path d="M15 25c1-8 6-11 13-11s12 3 13 11c-5-3-8-4-13-4s-8 1-13 4z" fill="${hair}"/>`;
  if (hs === 2) hairFront = `<path d="M15 25c1-8 6-11 13-11s12 3 13 11c-4-3-8-5-13-5s-9 2-13 5z" fill="${hair}"/>`;
  if (hs === 3) hairFront = `<path d="M15 24c0-6 5-9 13-9s13 3 13 9c-6-2-8-4-13-4s-7 2-13 4z" fill="${hair}"/>`;
  if (hs === 5) hairFront = `<path d="M13 26c0-10 7-14 15-14s15 4 15 14l-4-3c-3-3-6-4-11-4s-8 1-11 4z" fill="#3a2a22"/><rect x="12" y="23" width="32" height="3.5" rx="1.7" fill="${hair}"/>`;
  let extra = '';
  if (ac === 1) extra = `<g fill="none" stroke="#3a2a22" stroke-width="1.4"><circle cx="22" cy="30" r="4.4"/><circle cx="34" cy="30" r="4.4"/><path d="M26.4 30h3.2"/></g>`;
  if (ac === 2) extra = `<path d="M20 38c2-2 4-1 8-1s6-1 8 1c-1 4-5 5-8 5s-7-1-8-5z" fill="${hair}"/>`;
  if (ac === 3) extra = `<path d="M13 22c2-9 7-12 15-12s13 3 15 12z" fill="#3a2a22"/><rect x="10" y="21" width="36" height="4" rx="2" fill="#3a2a22"/>`;
  if (ac === 4) extra = `<circle cx="14" cy="34" r="2" fill="#f2b844"/><circle cx="42" cy="34" r="2" fill="#f2b844"/>`;
  if (ac === 5) extra = `<path d="M17 47c4 3 18 3 22 0l2 5c-6 3-20 3-26 0z" fill="#d9644a"/>`;
  return `<svg viewBox="0 0 56 56" width="${size}" height="${size}" class="avatar"><circle cx="28" cy="28" r="28" fill="#f4e6cf"/>
  <clipPath id="c"><circle cx="28" cy="28" r="28"/></clipPath><g clip-path="url(#c)">
  ${hairBack}<path d="M6 60c0-10 9-14 22-14s22 4 22 14z" fill="${shirt}"/><rect x="23" y="38" width="10" height="9" rx="3" fill="${skin}"/>
  <ellipse cx="28" cy="30" rx="13.5" ry="15" fill="${skin}"/>${hairFront}
  <circle cx="22.5" cy="31" r="1.5" fill="#3a2a22"/><circle cx="33.5" cy="31" r="1.5" fill="#3a2a22"/>
  <path d="M23 37.2c2.2 2.2 7.8 2.2 10 0" stroke="#3a2a22" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <circle cx="19.5" cy="35" r="2.4" fill="#ef9a8a" opacity=".45"/><circle cx="36.5" cy="35" r="2.4" fill="#ef9a8a" opacity=".45"/>
  ${extra}</g></svg>`;
}
export function avatarEl(a, size = 56) {
  const d = document.createElement('span');
  d.className = 'avwrap'; d.style.width = d.style.height = size + 'px';
  d.innerHTML = avatarSvg(a, size).replace('id="c"', 'id="c' + Math.random().toString(36).slice(2, 7) + '"');
  // уникальный id для clipPath
  const cp = d.querySelector('clipPath'); const g = d.querySelector('g');
  if (cp && g) g.setAttribute('clip-path', `url(#${cp.id})`);
  return d;
}
