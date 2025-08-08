import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/ha_picture_element_drag_and_drop/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
