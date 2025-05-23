import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    historyApiFallback: true, // ⬅️ this solves the dev issue
  },
  build: {
    rollupOptions: {
      input: '/index.html',
    }
  }
})