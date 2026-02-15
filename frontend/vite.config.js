import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load .env from project root (parent of frontend/)
  envDir: '..',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
