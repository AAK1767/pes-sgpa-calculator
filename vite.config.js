import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fetchAllPortalData } from './server/pesuPortal.js'

// The /api/* serverless functions only run on Vercel (or under `vercel dev`), NOT under
// `vite dev`. So during local dev we proxy the PESU auth call straight to the upstream
// PESUAuth service. This is dev-only — in production Vercel serves api/pesu-auth.js.
// Override the target with the PESU_AUTH_URL env var if you self-host the service.
const PESU_AUTH_TARGET = process.env.PESU_AUTH_URL || 'https://pesu-auth.onrender.com'

// Dev-only middleware for /api/pesu-portal. Unlike /api/pesu-auth (a simple URL proxy),
// fetching timetable/attendance/results is multi-step server logic, so we run the real
// handler in-process during `vite dev`. In production Vercel serves api/pesu-portal.js.
function pesuPortalDevPlugin() {
  return {
    name: 'pesu-portal-dev',
    configureServer(server) {
      server.middlewares.use('/api/pesu-portal', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let raw = ''
        req.on('data', (c) => { raw += c })
        req.on('end', async () => {
          const send = (code, obj) => {
            res.statusCode = code
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
          }
          try {
            const { username, password } = JSON.parse(raw || '{}')
            if (!username || !password) return send(400, { ok: false, error: 'Username and password are required.' })
            const data = await fetchAllPortalData({ username, password })
            return send(data.ok ? 200 : 401, data.ok ? data : { ok: false, error: data.error || 'Sign-in failed.' })
          } catch (e) {
            const cause = e?.cause || {}
            console.error('PESU portal (dev) error:', e?.message || e)
            if (cause.code || cause.message) console.error('  cause:', cause.code || '', cause.message || '')
            return send(502, {
              ok: false,
              error: e?.message || 'Could not reach the PESU Academy portal. Please try again later.',
              cause: cause.code || undefined,
            })
          }
        })
      })
    },
  }
}

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
    pesuPortalDevPlugin(),
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
