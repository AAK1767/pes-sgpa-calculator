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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      await Promise.all(
        clientList.map((client) =>
          client.navigate ? client.navigate(client.url) : Promise.resolve()
        )
      )
    })()
  )
})
