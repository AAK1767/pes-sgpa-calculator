import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Was there already a controlling SW when this page loaded?
  // If yes, a future controllerchange means an UPDATE happened → reload.
  // If no, it's a first install → no reload needed.
  const hadController = !!navigator.serviceWorker.controller

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return
    refreshing = true
    window.location.reload()
  })

  // Register and immediately check for updates
  navigator.serviceWorker.register('/sw.js')
    .then(reg => reg.update().catch(() => {}))
    .catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
