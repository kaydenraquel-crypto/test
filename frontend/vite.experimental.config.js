import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        experimental: resolve(__dirname, 'experimental.html'),
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5175,
    open: '/experimental.html'
  }
})