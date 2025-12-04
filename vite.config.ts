import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Le chemin de base relatif est CRUCIAL pour GitHub Pages
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: true, // Aide au debug si nécessaire
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'xlsx', 'lucide-react']
        }
      }
    }
  }
});