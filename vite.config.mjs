import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Add this configuration to handle Excel files
  assetsInclude: ['**/*.xlsx', '**/*.xls'],
  include: "**/*.{js,jsx}",
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})