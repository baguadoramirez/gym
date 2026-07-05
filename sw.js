const CACHE_NAME = "gym-tracker-v1.0-relux-dashboard-trends";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=1.0-relux",
  "./theme-charts.js?v=1.0-relux",
  "./js/app-storage.js?v=1.0-relux",
  "./js/app-main.js?v=1.0-relux",
  "./js/app-history.js?v=1.0-relux",
  "./js/app-metrics.js?v=1.0-relux",
  "./js/app-dashboard.js?v=1.0-relux",
  "./js/app-routines.js?v=1.0-relux",
  "./js/app-session.js?v=1.0-relux",
  "./js/app-export.js?v=1.0-relux",
  "./js/app-tools.js?v=1.0-relux",
  "./js/app-user.js?v=1.0-relux",
  "./ejercicios.js?v=1.0-relux",
  "./manifest.webmanifest?v=1.0-relux",
  "./icons/bar_logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

async function cacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    ASSETS.map(asset =>
      cache.add(asset).catch(err => {
        console.warn("[sw] no se pudo cachear", asset, err);
      })
    )
  );
}

async function putIfCacheable(request, response) {
  if (!response || !response.ok || response.type === "opaque") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

self.addEventListener("install", event => {
  event.waitUntil(cacheCoreAssets());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key === CACHE_NAME ? null : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate";
  const isScript = event.request.destination === "script";
  if (isNavigation || isScript) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          putIfCacheable(event.request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return isNavigation ? caches.match("./index.html") : Response.error();
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        putIfCacheable(event.request, response);
        return response;
      }).catch(() => Response.error());
    })
  );
});
