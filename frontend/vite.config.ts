import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      // Proxy cho API với version v1.3.0
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path) => path, // Giữ nguyên path để proxy đúng version
      },
      '/socket.io': {
        target: proxyTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})