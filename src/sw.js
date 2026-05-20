import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// Precache all built assets (JS, CSS, images — they have hashed filenames so this is safe)
precacheAndRoute(self.__WB_MANIFEST)

// For navigation requests (opening the app, refreshing, etc.):
// Always try the network FIRST to get the latest index.html.
// Only fall back to cache when the user is offline.
// This ensures opening a new tab always loads the latest version.
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'navigations',
    networkTimeoutSeconds: 3, // If network takes >3s, fall back to cache
  })
)
registerRoute(navigationRoute)
