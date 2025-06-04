// service-worker.js

const CACHE_NAME = 'finance-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', // Or your main HTML file
  '/globals.css',
  // Add paths to other essential static assets you want to cache
  // For example:
  // '/path/to/your/js/bundle.js',
  // '/path/to/your/css/styles.css',
  // '/path/to/your/images/logo.png',
];

// Install event: caches static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache first for static assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // No cache match - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // You can optionally cache successful network responses here
            // const clonedResponse = networkResponse.clone();
            // caches.open(CACHE_NAME).then((cache) => {
            //   cache.put(event.request, clonedResponse);
            // });
            return networkResponse;
          });
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});