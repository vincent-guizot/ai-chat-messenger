import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((configEnvironment) => {
  const environment = loadEnv(configEnvironment.mode, process.cwd(), '');
  const backendUrl = environment.VITE_BACKEND_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Saat development, request /api dan /socket.io diteruskan ke backend,
      // sehingga VITE_API_BASE boleh dikosongkan.
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
