import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/GYM/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'GymLog',
        short_name: 'GymLog',
        description: 'Personal progressive overload tracker',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        start_url: '/GYM/',
        icons: [
          { src: '/GYM/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/GYM/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/GYM/index.html',
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
})
