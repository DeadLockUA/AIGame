// Набор SVG-иконок (24x24, currentColor).
const P = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
export const ICONS = {
  coin: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f2b844" stroke="#b9852a" stroke-width="1.6"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#b9852a" stroke-width="1.2"/><path d="M12 8.2l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.4-2.5 1.4.6-2.8L8 11.1l2.8-.3z" fill="#b9852a"/></svg>`,
  rep: `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 16.8 6.1 20.1l1.3-6.6L2.5 8.9l6.6-.8z" fill="#d9644a" stroke="#a8432d" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.8-8 11-8 11z" fill="#ef7a95" stroke="#c4476a" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>`,
  vacuum: P('<circle cx="9" cy="17" r="3.4"/><path d="M12 15.5l4-8.5h4"/><path d="M6.5 17H3"/><path d="M16 7l-1.5-3"/>'),
  spray: P('<rect x="6" y="10" width="8" height="11" rx="2"/><path d="M8 10V7h5v3"/><path d="M13 7h4l2-2"/><path d="M19 8.5l2-.5M19 5l2-1.5"/>'),
  rinse: P('<path d="M4 9h11v6a4 4 0 01-4 4H8a4 4 0 01-4-4z"/><path d="M15 11h3l2-3"/><path d="M7 9V6M11 9V5"/><path d="M19 15.5v.5M17.5 18v.5M20.5 18v.5"/>'),
  steam: P('<path d="M8 20c-2-2 2-3 0-5s2-3 0-5"/><path d="M13 20c-2-2 2-3 0-5s2-3 0-5"/><path d="M18 20c-2-2 2-3 0-5s2-3 0-5"/>'),
  drop: `<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.4 6 7.2 6 10.6A6 6 0 016 13.6C6 10.2 8.5 7.4 12 3z" fill="#6bb6e6" stroke="#3a86b8" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  filter: P('<path d="M4 5h16l-6 8v6l-4-2v-4z"/>'),
  clock: P('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 3h6"/>'),
  orders: P('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 10h7M8.5 14h7M8.5 18h4"/>'),
  shop: P('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
  workshop: P('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  feed: P('<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3.4"/><path d="M8 6l1.2-2h5.6L16 6"/>'),
  more: P('<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'),
  gear: P('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'),
  lock: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  check: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  close: P('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  minus: P('<path d="M5 12h14"/>'),
  trophy: P('<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4"/><path d="M12 13v4M8 20h8M10 17h4"/>'),
  pause: P('<path d="M9 5v14M15 5v14"/>'),
  play: `<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>`,
  arrow: P('<path d="M9 5l7 7-7 7"/>'),
  back: P('<path d="M15 5l-7 7 7 7"/>'),
  shake: P('<path d="M7 5l-3 3 3 3M17 13l3 3-3 3"/><rect x="9" y="6" width="6" height="12" rx="1.6"/>'),
  tilt: P('<rect x="7" y="4" width="10" height="16" rx="2" transform="rotate(18 12 12)"/><path d="M3 12a9 9 0 003 6.5M21 12a9 9 0 00-3-6.5"/>'),
  sound: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>'),
  vibe: P('<rect x="8.5" y="4" width="7" height="16" rx="1.6"/><path d="M4.5 9v6M19.5 9v6M2 11v2M22 11v2"/>'),
  cat: `<svg viewBox="0 0 24 24"><path d="M4 9V3.5l4.2 2.7a9 9 0 017.6 0L20 3.5V9c1.3 1.5 1.5 3.4.8 5.2A8 8 0 0112 20a8 8 0 01-8.8-5.8C2.5 12.4 2.7 10.5 4 9z" fill="#f08a3c" stroke="#a8561c" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="12" r="1.1" fill="#3a2a22"/><circle cx="15" cy="12" r="1.1" fill="#3a2a22"/><path d="M12 14l-.9.9h1.8zM10.5 16c.6.7 2.4.7 3 0" stroke="#3a2a22" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`,
  find: P('<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M18 15l.8 1.8L20.5 18l-1.7.8L18 21l-.8-2.2L15.5 18l1.7-.8z"/>'),
  info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  download: P('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
  upload: P('<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>'),
  fire: P('<path d="M12 3c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 .2 1.5 1 2 1.8 2C10 8 11 5.5 12 3z"/>'),
  dust: `<svg viewBox="0 0 24 24"><circle cx="8" cy="9" r="2" fill="currentColor"/><circle cx="15" cy="7" r="1.4" fill="currentColor"/><circle cx="14" cy="14" r="2.6" fill="currentColor"/><circle cx="7" cy="16" r="1.4" fill="currentColor"/><circle cx="18" cy="17" r="1.2" fill="currentColor"/></svg>`,
};
export function icon(name, cls = '') {
  const span = document.createElement('span');
  span.className = 'ic ' + cls;
  span.innerHTML = ICONS[name] || '';
  return span;
}
export const iconHtml = (name) => ICONS[name] || '';
