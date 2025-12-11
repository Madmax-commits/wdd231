const CACHE_NAME = 'konwea-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/index.css',
  '/scripts/weather.js',
  '/scripts/spotlight.js',
  '/scripts/directory.js',
  '/images/coins-1726618-800.webp',
  '/images/coins-1726618-1600.webp',
  '/images/shopping-6125344_640.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (ASSETS.includes(url.pathname) || url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
  }
});

