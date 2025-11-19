import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: ['tslib']
  },
  resolve: {
    alias: {
      tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js')
    }
  }
})
