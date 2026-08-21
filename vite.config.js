import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// The /api/* serverless functions only run on Vercel (or under `vercel dev`), NOT under
// `vite dev`. So during local dev we proxy the PESU auth call straight to the upstream
// PESUAuth service. This is dev-only — in production Vercel serves api/pesu-auth.js.
// Override the target with the PESU_AUTH_URL env var if you self-host the service.
const PESU_AUTH_TARGET = process.env.PESU_AUTH_URL || 'https://pesu-auth.onrender.com'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/pesu-auth': {
        target: PESU_AUTH_TARGET,
        changeOrigin: true,
        secure: true,
        // The upstream endpoint is /authenticate; our app calls /api/pesu-auth.
        rewrite: () => '/authenticate',
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globIgnores: ['**/index.html'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
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
