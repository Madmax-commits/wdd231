const CACHE_NAME = 'konwea-chamber-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/directory.html',
  '/join.html',
  '/discover.html',
  '/thankyou.html',
  '/styles/index.css',
  '/styles/directory.css',
  '/styles/join.css',
  '/styles/discover.css',
  '/scripts/weather.js',
  '/scripts/spotlight.js',
  '/scripts/directory.js',
  '/scripts/join.js',
  '/scripts/discover.js',
  '/scripts/thankyou.js',
  '/images/shopping-6125344_640.png',
  '/images/coins-1726618-800.webp',
  '/images/coins-1726618-1600.webp'
];

/**
 * Install: Cache essential assets
 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => console.error('Cache install error:', err))
  );
});

/**
 * Activate: Clean up old caches
 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(err => console.error('Cache activation error:', err))
  );
});

/**
 * Fetch: Cache-first strategy with network fallback
 */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except APIs we trust)
  if (url.origin !== location.origin && !url.hostname.includes('openweathermap.org')) {
    return;
  }

  // Cache-first strategy for local assets
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(e.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response before caching
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(e.request, responseClone))
              .catch(err => console.warn('Cache write error:', err));

            return response;
          })
          .catch(err => {
            console.error('Fetch error:', err);
            // Return offline placeholder if needed
            return new Response('Service unavailable. Please check your connection.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});
