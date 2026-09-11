importScripts("./version.js");

const ASSET_VERSION = self.GYM_ASSET_VERSION || "dev";
const CACHE_NAME = `gym-tracker-v${ASSET_VERSION}`;
const withVersion = path => `${path}?v=${encodeURIComponent(ASSET_VERSION)}`;
const ASSETS = [
  "./",
  "./index.html",
  "./version.js",
  withVersion("./styles.css"),
  withVersion("./theme-charts.js"),
  withVersion("./js/app-storage.js"),
  withVersion("./js/app-main.js"),
  withVersion("./js/app-history.js"),
  withVersion("./js/app-metrics.js"),
  withVersion("./js/app-dashboard.js"),
  withVersion("./js/app-routines.js"),
  withVersion("./js/app-session.js"),
  withVersion("./js/app-export.js"),
  withVersion("./js/app-tools.js"),
  withVersion("./js/app-user.js"),
  withVersion("./js/app-pwa.js"),
  withVersion("./ejercicios.js"),
  withVersion("./manifest.webmanifest"),
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

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === "navigate";
  const isScript = event.request.destination === "script";
  const isVersionFile = url.origin === self.location.origin && url.pathname.endsWith("/version.js");
  if (isNavigation || isScript || isVersionFile) {
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
