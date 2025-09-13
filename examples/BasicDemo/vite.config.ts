import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      // Alias to resolve Bullet3 source files
      '@bullet3': resolve(__dirname, '../../src'),
    }
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster loading
    include: []
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from parent directories
      allow: ['../..']
    }
  },
  build: {
    // Ensure TypeScript files are properly handled
    target: 'es2020',
    sourcemap: true
  }
})