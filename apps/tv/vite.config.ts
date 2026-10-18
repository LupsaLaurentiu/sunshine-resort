import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'chrome87', sourcemap: true },
});
