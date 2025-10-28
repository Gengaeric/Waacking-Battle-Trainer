// ##### INICIO DEL CÓDIGO PARA sw.js (v47 - Reproducción Spotify) #####
const CACHE_NAME = 'waacking-trainer-v47'; // Nueva versión
const urlsToCache = [
  './',
  './index.html', // Versión Spotify Focus (v37 que tenías)
  './style.css',
  './script.js',  // ¡El script.js modificado con lógica de reproducción!
  './manifest.json',
  './sounds/beep.mp3',
  'https://unpkg.com/dexie@3/dist/dexie.js', // Dependencia Dexie
  './images/icon-192x192.png',
  './images/icon-512x512.png'
  // No cacheamos API de YT ni SDK de Spotify
];

// Evento 'install': Se dispara cuando el navegador instala el SW por primera vez o cuando detecta una nueva versión.
self.addEventListener('install', event => {
  console.log(`[SW v47] Instalando...`);
  // skipWaiting() fuerza al nuevo SW a activarse inmediatamente en lugar de esperar a que todas las pestañas se cierren.
  self.skipWaiting();
  // waitUntil() espera a que la promesa se resuelva antes de considerar la instalación completa.
  event.waitUntil(
    caches.open(CACHE_NAME) // Abrir (o crear) la caché con el nombre de la versión.
      .then(cache => {
        console.log('[SW v47] Cache abierta, añadiendo URLs base...');
        return cache.addAll(urlsToCache); // Descargar y guardar todos los archivos listados en urlsToCache.
      })
      .catch(err => console.error('[SW v47] Fallo al añadir URLs a caché durante install:', err)) // Manejar errores si falla la descarga/guardado.
  );
});

// Evento 'activate': Se dispara después de que el SW se ha instalado correctamente y está listo para tomar control.
self.addEventListener('activate', event => {
  console.log(`[SW v47] Activando...`);
  // waitUntil() espera a que la promesa se resuelva antes de considerar la activación completa.
  event.waitUntil(
    caches.keys() // Obtener los nombres (keys) de todas las cachés existentes.
      .then(keys => {
        // Borrar todas las cachés que NO coincidan con el CACHE_NAME actual (versión vieja).
        return Promise.all(keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`[SW v47] Borrando caché vieja: ${key}`);
            return caches.delete(key); // Borrar la caché obsoleta.
          }
        }));
      })
      .then(() => {
        console.log('[SW v47] Cachés viejas borradas.');
        // clients.claim() permite que el SW activado tome control inmediato de las páginas abiertas
        // que están dentro de su alcance, sin necesidad de recargar.
        return self.clients.claim();
      })
      .catch(err => console.error('[SW v47] Fallo durante activate (borrando cachés o claim):', err)) // Manejar errores.
  );
});

// Evento 'fetch': Se dispara cada vez que la página (controlada por este SW) intenta solicitar un recurso (HTML, CSS, JS, imagen, API, etc.).
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET (no POST, PUT, etc.)
  if (event.request.method === 'GET') {
    // respondWith() intercepta la petición y nos permite devolver nuestra propia respuesta.
    event.respondWith(
      caches.match(event.request) // Buscar si el recurso solicitado ya está en nuestra caché.
        .then(cachedResponse => {
          // Si encontramos una respuesta en caché, la devolvemos directamente.
          if (cachedResponse) {
            // console.log(`[SW v42] Sirviendo desde caché: ${event.request.url}`); // Log opcional (puede ser ruidoso)
            return cachedResponse;
          }
          // Si no está en caché, ir a la red a buscarlo.
          // console.log(`[SW v42] No en caché, fetching: ${event.request.url}`); // Log opcional
          return fetch(event.request); // Hacer la petición real a la red.
        })
        .catch(err => {
          // Manejar errores si falla la búsqueda en caché o la petición fetch.
          console.error(`[SW v47] Error en fetch handler para ${event.request.url}:`, err);
          // Opcionalmente, podrías devolver una página offline aquí si fetch falla.
        })
    );
  }
});
// ##### FIN DEL CÓDIGO PARA sw.js (v42 - Reproducción Spotify) #####