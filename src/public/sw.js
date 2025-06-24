const CACHE_NAME = "cerita-rafi-cache-v1";
const API_URL = "https://story-api.dicoding.dev/v1/";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.png",
  "/manifest.json",
  "/styles/styles.css",
  "/scripts/index.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  "https://unpkg.com/leaflet/dist/leaflet.css",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Gagal cache ${asset}`, err);
          })
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // ⛔ Skip non-GET requests (POST/PUT/DELETE)
  if (request.method !== "GET") return;

  if (request.url.startsWith(API_URL)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request).then((res) => res || fetch(request))
    );
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Notifikasi Baru";
  const options = {
    body: data.body || "Ada pemberitahuan baru!",
    icon: "/images/icons/maskable-icon-x192.png",
    badge: "/images/icons/maskable-icon-x48.png",
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        const client = clientsArr.find((c) => c.focus);
        return client ? client.focus() : clients.openWindow("/");
      })
  );
});
