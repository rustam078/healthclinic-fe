import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // API_TARGET lets a different backend be used in development (default: local backend on 8080).
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.DEV_PORT) || 5173,
      proxy: {
        '/api': { target: env.API_TARGET || 'http://localhost:8080', changeOrigin: false },
      },
    },
    build: {
      outDir: '../backend/src/main/resources/static',
      emptyOutDir: true,
    },
  };
});
