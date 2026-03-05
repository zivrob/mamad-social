import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // הפורט הסטנדרטי
    strictPort: true,
    hmr: {
      clientPort: 5173, // מבטיח שה-WebSocket ינסה להתחבר לאותו פורט
    },
  },
})