// ===== SERVICE WORKER - JALI BZAR PWA =====
// Permite que la app funcione sin internet

const CACHE_NAME = 'jali-bzar-v1';
const urlsToCache = [
  '/JaLi-Bzar/',
  '/JaLi-Bzar/index.html',
  '/JaLi-Bzar/styles.css',
  '/JaLi-Bzar/app.js',
  '/JaLi-Bzar/firebase-config.js',
  '/JaLi-Bzar/bolsi-logo.png',
  '/JaLi-Bzar/manifest.json'
];

// Instalación del service worker
self.addEventListener('install', event => {
  console.log('🎀 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✨ Service Worker: Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('⚠️ Error al cachear archivos:', err);
        // No fallar si algunos archivos no se pueden cachear
        return Promise.resolve();
      })
  );
  
  // Activar inmediatamente
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', event => {
  console.log('💗 Service Worker: Activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Borrando caché antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control inmediatamente
  return self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', event => {
  // Ignorar peticiones a Firebase y APIs externas
  if (event.request.url.includes('firebasedatabase.app') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no, intentar descargar de la red
        return fetch(event.request)
          .then(response => {
            // Verificar que es una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta
            const responseToCache = response.clone();
            
            // Agregar al caché
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Si falla la red y no está en caché, mostrar página offline
            return caches.match('/JaLi-Bzar/index.html');
          });
      })
  );
});

// Sincronización en segundo plano (cuando vuelva internet)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('🔄 Service Worker: Sincronizando datos...');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Aquí puedes agregar lógica para sincronizar datos cuando vuelva internet
  console.log('✅ Datos sincronizados');
}

// Notificaciones push (opcional para futuras funciones)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JaLi Bzar';
  const options = {
    body: data.body || '¡Tienes una nueva notificación!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'jali-bzar-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
