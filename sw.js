const CACHE_NAME = 'jvdesignstudio-v1';

// Every local asset the site needs to function offline.
// scripts/check-sw-coverage.js verifies this list stays in sync with index.html.
const CACHED_FILES = [
  '/',
  '/index.html',
  '/sw.js',
  '/Logo Design.png',
  '/Front Cover Concept.jpg',
  '/1760176446427~2.jpg',
  '/privacy_policy.md',
  '/terms_of_service.md',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHED_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
