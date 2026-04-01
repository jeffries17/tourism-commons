import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/botswana/',
  optimizeDeps: {
    include: ['prop-types', 'react-simple-maps'],
  },
})
