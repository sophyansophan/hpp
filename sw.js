const CACHE_NAME = 'hpp-kalkulator-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
  // Catatan: Anda juga bisa menambahkan file gambar/ikon ke sini jika ada
];

// Install Service Worker dan simpan file ke dalam cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch data (Menggunakan strategi Cache First, dengan Network Fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, ambil dari internet (Network)
        return fetch(event.request).then(
          function(response) {
            // Jangan cache jika response tidak valid
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Kloning response karena response adalah stream yang hanya bisa dibaca sekali
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update Service Worker dan hapus cache lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
