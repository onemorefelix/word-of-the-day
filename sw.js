const CACHE_NAME = 'basis-v16';
const SHELL = [
  './', './index.html', './trainer.html',
  './grammar.html', './grammar-tenses.html', './grammar-articles.html', './grammar-prepositions.html',
  './grammar-modals.html', './grammar-reported-speech.html', './grammar-gerund-infinitive.html',
  './grammar-countable-uncountable.html', './grammar-conditionals.html', './grammar-passive.html',
  './grammar-word-order.html', './grammar-comparatives.html', './grammar-questions.html',
  './grammar-prepositions-place.html', './grammar-phrasal-verbs.html',
  './reference.html', './reference-sounds.html', './settings.html',
  './styles.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png',
  './data/core.json', './data/environment.json', './data/education.json', './data/technology.json',
  './data/health.json', './data/work.json',
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

  const isHtmlPage = event.request.mode === 'navigate' || url.pathname.endsWith('.html');
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

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
