import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [svgr()],
  resolve: {
    alias: {
      '/assets': '/src/assets',
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['/assets/clock-face.svg'],
    },
  },
});
