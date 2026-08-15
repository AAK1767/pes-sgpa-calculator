import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

// --- Lifecycle ---
// Activate immediately — don't sit in "waiting" state
self.addEventListener("install", () => self.skipWaiting());
// Take control of all open tabs as soon as this SW activates and force-reload them to update
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      return self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          if (client.url && "navigate" in client) {
            client.navigate(client.url).catch(() => {});
          }
        });
      });
    }),
  );
});

// --- Caching ---
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Navigation requests: always try the network first to get fresh HTML.
// Only fall back to cache when offline (3s timeout).
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "navigations",
      networkTimeoutSeconds: 3,
    }),
  ),
);
