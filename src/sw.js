import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

// --- Lifecycle ---
// Activate immediately — don't sit in "waiting" state
self.addEventListener('install', () => self.skipWaiting())
// Take control of all open tabs as soon as this SW activates
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// --- Caching ---
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Navigation requests: always try the network first to get fresh HTML.
// Only fall back to cache when offline (3s timeout).
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigations',
      networkTimeoutSeconds: 3,
    })
  )
)
