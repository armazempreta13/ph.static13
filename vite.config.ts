import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    {
      name: 'copy-headers',
      writeBundle() {
        // Copy _headers file to dist for Cloudflare
        const source = path.resolve(__dirname, '_headers');
        const dest = path.resolve(__dirname, 'dist', '_headers');
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, dest);
          console.log('✅ _headers file copied to dist');
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
  },
});
