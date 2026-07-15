import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api':     { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  // In production the frontend talks directly to the Render backend URL.
  // Set VITE_API_URL in Vercel environment variables:
  //   VITE_API_URL = https://krmu-internship-portal.onrender.com
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
