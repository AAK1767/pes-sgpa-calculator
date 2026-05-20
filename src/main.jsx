import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshing = false
  // Reload once the updated SW takes control so the user gets fresh assets.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) {
      return
    }
    refreshing = true
    window.location.reload()
  })

  registerSW({
    immediate: true,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
