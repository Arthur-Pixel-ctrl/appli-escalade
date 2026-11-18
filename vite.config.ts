import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// Configuration de l'outil de construction (Vite).
export default defineConfig({
  // Chemins relatifs : l'app fonctionne quel que soit l'hébergement choisi.
  base: './',
  // Date de construction, affichée dans le profil pour savoir quelle version tourne.
  define: { __VERSION__: JSON.stringify(new Date().toISOString()) },
  plugins: [
    react(),
    // Rend l'app installable sur téléphone et utilisable hors ligne.
    VitePWA({
      // « prompt » : une nouvelle version n'est appliquée que lorsque l'utilisateur le demande,
      // pour ne jamais recharger l'app au milieu d'une séance.
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      // Les polices (woff2) sont mises en cache pour fonctionner hors ligne.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
      manifest: {
        name: 'Get me to 9a',
        short_name: 'Get me to 9a',
        description: "Get me to 9a : ton carnet d'entraînement d'escalade. Séances guidées, chrono, plan.",
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        // = --fond dans index.css (le manifeste ne lit pas les variables)
        background_color: '#F1EFE9',
        theme_color: '#F1EFE9',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: { environment: 'node' },
})
