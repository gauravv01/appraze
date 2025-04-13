import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: true,
  },
  base: '/',
  server: {
    host: true, // Listen on all addresses
    port: 3000,
  },
  preview: {
    host: true, // Listen on all addresses when using preview
    port: 4173,
  }
});