import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Register the SW and set up auto-update
  const updateSW = registerSW({
    immediate: true,

    // Called when a new SW is installed and waiting to activate.
    // Since our SW calls skipWaiting(), this fires and we reload.
    onNeedRefresh() {
      // Force the waiting SW to activate (belt-and-suspenders with skipWaiting in sw.js)
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      }
      // Reload after a tiny delay to let the new SW take over
      setTimeout(() => window.location.reload(), 300)
    },

    // Called when all assets are cached and app works offline
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })

  // Periodically check for SW updates (every 60 seconds).
  // This ensures users who keep the tab open for hours/days still get updates
  // without needing to manually refresh.
  setInterval(() => {
    updateSW(false) // false = just check, don't force
  }, 60 * 1000)

  // Listen for the 'SW_UPDATED' message from the service worker.
  // This is the direct reload trigger — when the new SW activates,
  // it tells all tabs to reload immediately.
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      window.location.reload()
    }
  })

  // Also handle the case where a new SW takes control of this page
  // (e.g., via clientsClaim). This is another safety net.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
