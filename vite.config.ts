import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    target: 'ES2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        play: resolve(__dirname, 'play.html'),
        teachers: resolve(__dirname, 'teachers.html'),
      },
    },
  },
  server: {
    open: false,
  },
});
