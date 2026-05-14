import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        // Immediately activate the new service worker, don't wait for tabs to close
        skipWaiting: true,
        // Take control of all open clients as soon as the new SW activates
        clientsClaim: true,
        // Remove outdated precache entries from previous builds
        cleanupOutdatedCaches: true,
        // SPA fallback
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'PESU Grade Calculator',
        short_name: 'PESU Calc',
        description: 'Calculate SGPA, CGPA & Attendance Offline',
        theme_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
