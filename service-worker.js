// Service Worker para Sistema UGC PWA
// Versión del caché - cambia este número cuando quieras forzar actualización
const CACHE_VERSION = 'ugc-v2.0.0'; // ← Incrementada para forzar actualización
const CACHE_NAME = `ugc-cache-${CACHE_VERSION}`;
// Archivos críticos que se cachean para funcionar offline
const CRITICAL_FILES = [
  '/Pruebas-SUGC/',
  '/Pruebas-SUGC/index.html',
  '/Pruebas-SUGC/app.js',
  '/Pruebas-SUGC/styles.css',
  '/Pruebas-SUGC/notas-rapidas.js',
  '/Pruebas-SUGC/notificaciones-sheets.js',
  '/Pruebas-SUGC/regimen-content.js',
  '/Pruebas-SUGC/logo.png',
  '/Pruebas-SUGC/incidencias-maestros.html',
  '/Pruebas-SUGC/contactos-padres.html'
];
// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando v2.0.0...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Cacheando archivos críticos');
      return cache.addAll(CRITICAL_FILES);
    })
  );
});
// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activando v2.0.0...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});
// Estrategia de caché: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
console.log('✅ Service Worker v2.0.0 cargado');
