// Service worker فقط برای voice.html (scope جدا؛ با sw.js یا کش پوشش اصلی تداخل ندارد)
const C = 'sahel-voice-v1';
const FILES = ['./voice.html', './voice-manifest.json', './icons/icon-192.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(k => Promise.all(k.filter(x => x.indexOf('sahel-voice-') === 0 && x !== C).map(x => caches.delete(x))))
    .then(() => self.clients.claim())
));

// اول شبکه (همیشه آخرین نسخه)، اگر آفلاین بود از کش
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./voice.html')))
  );
});
