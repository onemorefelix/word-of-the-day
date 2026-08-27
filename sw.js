const CACHE_NAME = 'basis-v4';
const SHELL = [
  './', './index.html', './trainer.html', './grammar.html',
  './styles.css', './manifest.json', './icon-192.png', './icon-512.png',
  './data/core.json', './data/environment.json',
  './fonts/fraunces-400.woff2', './fonts/fraunces-600.woff2', './fonts/fraunces-700.woff2',
  './fonts/plexmono-400.woff2', './fonts/plexmono-500.woff2',
  './fonts/inter-400.woff2', './fonts/inter-500.woff2', './fonts/inter-600.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // HTML-сторінки: мережа спочатку, щоб завжди бачити свіжу версію.
  const isHtmlPage = event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html');
  if (isHtmlPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Дані тем (JSON): мережа спочатку, кеш як резерв для офлайну.
  const isDataFile = url.pathname.includes('/data/');
  if (isDataFile) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Статичні файли (шрифти, іконки, стилі, маніфест): кеш спочатку.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
