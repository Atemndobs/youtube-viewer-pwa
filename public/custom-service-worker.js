importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Listen to the fetch event
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
  
    // Exclude /api/events from caching
    if (url.pathname === '/api/events') {
      return; // Do nothing, bypass service worker
    }
  
    // Default cache behavior
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  

  if (workbox) {
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
  } else {
    console.log('Workbox could not be loaded.');
  }
  