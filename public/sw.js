// Canto Service Worker — CantoStore Background Sync + Offline support
const CACHE_NAME = "canto-v2";
const STATIC_ASSETS = ["/", "/canto-icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Background Sync — flush CantoStore write queue when tab closes
self.addEventListener("sync", (event) => {
  if (event.tag === "cantostore-flush") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "CANTOSTORE_FLUSH_REQUEST" })
        );
      })
    );
  }
});

// Message handler — receive flush confirmation from app
self.addEventListener("message", (event) => {
  if (event.data?.type === "CANTOSTORE_FLUSH_COMPLETE") {
    console.log("[SW] CantoStore flush confirmed");
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") return caches.match("/");
          return new Response("Offline", { status: 503 });
        })
      )
  );
});

