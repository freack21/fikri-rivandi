import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js (~550 kB) is split into its own lazily loaded chunk for the About workspace scene.
    chunkSizeWarningLimit: 600,
  },
})
