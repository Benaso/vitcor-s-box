import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vitcor-s-box/',
  server: {
    port: 3000
  }
})