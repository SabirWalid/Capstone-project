const CACHE_NAME = 'empower-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  // Add all your important HTML, JS, CSS, and learning materials here
  // e.g. '/courses.html', '/dashboard.html', '/styles.css', '/materials/lesson1.pdf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});