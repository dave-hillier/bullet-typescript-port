import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'examples',
  base: '/',
  build: {
    outDir: '../dist-examples',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/index.html'),
        helloWorld: resolve(__dirname, 'examples/physics/hello-world/index.html'),
        basicDemo: resolve(__dirname, 'examples/physics/basic-demo/index.html'),
        rigidBodyDemo: resolve(__dirname, 'examples/physics/rigid-body-demo/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@physics': resolve(__dirname, 'src'),
      '@examples': resolve(__dirname, 'examples'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});