import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/trippwastaken.github.io/' : '/',
  css: {
    postcss: {
      plugins: [tailwindcss()],
    }
  }
});
