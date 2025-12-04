import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: ./' permet à l'app de fonctionner quel que soit le nom du repo GitHub (ex: /Stock-app/ ou /Lab-v2/)
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: true,
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
