// Service Worker CAURIS Rapport Journalier
var CACHE = 'cauris-rj-v1';
var URLS  = [
  '/Cauris-rapport/',
  '/Cauris-rapport/index.html'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(URLS).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  // Ne pas intercepter les appels GAS et CDN
  if (url.includes('script.google.com')) return;
  if (url.includes('googleapis.com'))    return;
  if (url.includes('cdnjs.cloudflare')) return;
  if (url.includes('cdn.jsdelivr'))     return;
  if (url.includes('fonts.googleapis')) return;

  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        // Mettre en cache la réponse
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      })
      .catch(function() {
        // Hors ligne : servir depuis le cache
        return caches.match(e.request);
      })
  );
});
