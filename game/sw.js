// Service worker: офлайн-работа. Список файлов лежит в precache.json (генерируется tools/build-precache.mjs).
const PREFIX = 'chisty-vors-';
const VERSION = 'cfc07d0b62'; // подставляется tools/build-precache.mjs
const CACHE = PREFIX + VERSION;
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const res = await fetch('precache.json', { cache: 'no-store' });
    const { files } = await res.json();
    const cache = await caches.open(CACHE);
    await cache.addAll(files.map((f) => new Request(f, { cache: 'reload' })));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(PREFIX) && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); } catch (err) {
      if (req.mode === 'navigate') { const idx = await caches.match('index.html'); if (idx) return idx; }
      throw err;
    }
  })());
});
