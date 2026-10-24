import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'chrome87',
    outDir: process.env.TV_BUILD_PLATFORM === 'android' ? 'dist-android' : 'dist',
    sourcemap: process.env.TV_BUILD_PLATFORM !== 'android',
  },
});
