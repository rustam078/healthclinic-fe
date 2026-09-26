import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Development server, also reachable from other devices on the network by this computer's IP (e.g. an iPad).
 * API calls go to the local backend on port 8080 (API_TARGET uses another one).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: Number(env.DEV_PORT) || 5173,
      proxy: { '/api': { target: env.API_TARGET || 'http://localhost:8080', changeOrigin: false } },
    },
    preview: { host: true },
    build: {
      outDir: '../backend/src/main/resources/static',
      emptyOutDir: true,
    },
  };
});

