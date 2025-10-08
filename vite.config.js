// /vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
<<<<<<< HEAD
  plugins: [
    react(),
    tailwindcss(),
  ],
  // For custom domain at root:
  base: '/',
  // (Optional alternative if you want relative paths)
  // base: './',
})
=======
  plugins: [react(), tailwindcss()],
  // custom domain root
  base: '/',
});
>>>>>>> d01065a (Refresh UI, smart to-do updates, and live weather icons)
