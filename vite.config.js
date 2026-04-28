import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/gym/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'GymLog',
        short_name: 'GymLog',
        description: 'Personal progressive overload tracker',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        start_url: '/gym/',
        icons: [
          { src: '/gym/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/gym/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/gym/index.html',
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
})