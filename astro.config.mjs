import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static', // SSG mode
  outDir: './dist',
  build: {
    format: 'directory'
  },
  vite: {
    optimizeDeps: {
      include: ['lit']
    }
  }
});
