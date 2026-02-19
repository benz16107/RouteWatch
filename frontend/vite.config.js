import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    // SPA fallback: run last and serve index.html for paths like /routes (so dev matches backend behavior)
    {
      name: 'spa-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.method !== 'GET') return next()
            const pathname = (req.url || '').split('?')[0]
            if (pathname.startsWith('/api') || pathname.startsWith('/@') || pathname.startsWith('/src') || pathname.startsWith('/node_modules')) return next()
            if (pathname.includes('.')) return next()
            const indexFile = path.join(server.config.root, 'index.html')
            if (!fs.existsSync(indexFile)) return next()
            res.setHeader('Content-Type', 'text/html')
            fs.createReadStream(indexFile).pipe(res)
          })
        }
      },
    },
  ],
  // Load .env from project root (parent of frontend/)
  envDir: '..',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
