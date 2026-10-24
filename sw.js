const NOMBRE_CACHE = 'presufacil-privado-v1';

const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './cerdito.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then(cache => cache.addAll(ARCHIVOS_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then(nombresCache => {
      return Promise.all(
        nombresCache.map(cache => {
          if (cache !== NOMBRE_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.url.includes('supabase.co') || evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then((respuestaRed) => {
        if (respuestaRed && respuestaRed.status === 200) {
          const copiaParaGuardar = respuestaRed.clone();
          caches.open(NOMBRE_CACHE).then((cache) => {
            cache.put(evento.request, copiaParaGuardar);
          });
        }
        return respuestaRed;
      })
      .catch(() => {
        return caches.match(evento.request);
      })
  );
});
