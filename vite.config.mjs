import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct Vite config for Vercel deployment
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // ensures build output folder is /dist
  },
  server: {
    port: 5173,
    open: true,
  },
})
