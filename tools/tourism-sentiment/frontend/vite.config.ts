import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sentiment-analysis/',
  server: {
    port: 3001
  },
  // Support client-side routing
  preview: {
    port: 3001
  }
})

