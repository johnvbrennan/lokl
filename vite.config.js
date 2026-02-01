import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Leaflet will be loaded from CDN, so no need to bundle it
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  base: '/',
  publicDir: 'public',
});
