let cacheName = 'cache-v1';
let urlsToCache = [
  '/currency-converter-ALC-7DaysOfCode-Challenge/',
  '/index.html',
  '/css/index.css',
  '/css/mdb.min.css',
  '/exchange.png',
  '/index.js',
];
self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || fetch(event.request))
  );
});
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
});
