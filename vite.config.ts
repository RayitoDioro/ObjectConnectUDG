import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsConfigPaths()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://objectconnectudg-fastapi-microservice.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
})
