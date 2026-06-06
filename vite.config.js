import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/Family-meal-planner/',
  // Vite-entry.html is the clean entry point (no CDN/Babel deps)
  // The original index.html remains as the CDN/standalone fallback
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, 'vite-entry.html'),
      output: {
        // Rename entry HTML to index.html in dist
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
