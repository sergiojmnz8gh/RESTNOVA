import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/productos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/usuarios': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})

