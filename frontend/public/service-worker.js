// Cleanup worker for browsers that still have an old/stale registration.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await self.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => self.caches.delete(cacheName)));
      await self.clients.claim();

      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });

      await self.registration.unregister();
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })()
  );
});
