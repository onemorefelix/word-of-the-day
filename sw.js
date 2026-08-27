const CACHE_NAME = 'basis-v2';
const SHELL = ['./', './basis.html', './manifest.json', './icon-192.png', './icon-512.png'];

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

  // HTML-сторінка: спочатку пробуємо мережу, щоб завжди бачити свіжу версію.
  // Кеш — лише як резерв, якщо інтернету немає.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('basis.html')) {
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

  // Статичні файли (іконки, маніфест): кеш-спочатку, бо вони майже не змінюються.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});