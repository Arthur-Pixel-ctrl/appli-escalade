import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// Configuration de l'outil de construction (Vite).
export default defineConfig({
  // Chemins relatifs : l'app fonctionne quel que soit l'hébergement choisi.
  base: './',
  plugins: [
    react(),
    // Rend l'app installable sur téléphone et utilisable hors ligne.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Appli escalade',
        short_name: 'Escalade',
        description: "Entraînement à l'escalade : séances guidées, chrono, programme.",
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0C0D0E',
        theme_color: '#0C0D0E',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: { environment: 'node' },
})
