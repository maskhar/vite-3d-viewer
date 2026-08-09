import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    assetsInlineLimit: 0, // Don't inline large files
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
