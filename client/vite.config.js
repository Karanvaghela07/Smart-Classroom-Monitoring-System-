import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // Allow access from all hosts
    port: 5173,          // Default Vite port
    strictPort: false,
    https: false,        // Keep off unless you configure certificates
    cors: true,
  }
})
