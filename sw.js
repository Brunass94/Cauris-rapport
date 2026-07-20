// Service Worker CAURIS Rapport Journalier — v2 (2026-07-13)
// Changement de nom de cache → force tous les appareils à purger
// l'ancienne version et à recharger l'application fraîche.
var CACHE = 'cauris-rj-v3';
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
  // Ne jamais intercepter les appels serveur et CDN (toujours en direct)
  if (url.includes('script.google.com'))     return;
  if (url.includes('googleusercontent.com')) return;
  if (url.includes('googleapis.com'))        return;
  if (url.includes('gstatic.com'))           return;
  if (url.includes('firebaseio.com'))        return;
  if (url.includes('firebaseapp.com'))       return;
  if (url.includes('cdnjs.cloudflare'))      return;
  if (url.includes('cdn.jsdelivr'))          return;
  if (url.includes('fonts.googleapis'))      return;
  if (url.includes('drive.google.com'))      return;

  // RÉSEAU D'ABORD : on sert toujours la version en ligne si disponible,
  // le cache ne sert que hors connexion.
  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        if (resp && resp.status === 200 && e.request.method === 'GET') {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
