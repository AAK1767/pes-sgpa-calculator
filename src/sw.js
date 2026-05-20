import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute, NavigationRoute } from 'workbox-routing'

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

const navigationHandler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(navigationHandler)
registerRoute(navigationRoute)

// When the new SW activates, tell ALL open tabs to reload immediately.
// This is the nuclear option — no "update available" prompt, just force refresh.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      // Post a message to every open tab/window telling it to reload
      clientList.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED' })
      })
    })()
  )
})

// Listen for SKIP_WAITING messages from the client
// (In case the client detects a waiting SW and wants to activate it)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
