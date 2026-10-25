// /vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The React app (tools that are not yet static pages) is app.html. index.html is the static home
// page in public/, so Vite's SPA entry has to be named explicitly.
const spaFallback = () => ({
  name: 'spa-fallback-app-html',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url || '').split('?')[0];
      if (req.method === 'GET' && !path.includes('.') && !path.startsWith('/@') && !path.startsWith('/src/') && !path.startsWith('/node_modules/')) {
        req.url = '/app.html';
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback()],
  // custom domain root
  base: '/',
  build: { rollupOptions: { input: 'app.html' } },
});
