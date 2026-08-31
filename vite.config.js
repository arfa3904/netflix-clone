import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    open: true,
    // Dev-only proxy: forwards /api/* to dev-server.js (see that file), which
    // runs the same api/*.js handlers Vercel uses in production. No rewrite —
    // both the proxy target and Vercel expose routes at /api/*.
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    testTimeout: 20000,
  },
})
