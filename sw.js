// سرویس‌ورکر پوشش اصلی: فقط پوستهٔ برنامه؛ به درخواست‌های گوگل دست نمی‌زند
const C = 'sahel-shell-v1';
const FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))));
});

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(k => Promise.all(k.filter(x => x !== C && x.indexOf('sahel-voice-') !== 0).map(x => caches.delete(x))))
    .then(() => self.clients.claim())
));

// اول شبکه، اگر آفلاین بود کش
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
  );
});
