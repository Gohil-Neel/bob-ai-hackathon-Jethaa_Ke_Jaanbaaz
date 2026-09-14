import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // ASP.NET Core primary backend runs on port 5000
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
