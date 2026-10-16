import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig((configEnvironment) => {
  const environment = loadEnv(configEnvironment.mode, process.cwd(), '');
  const backendUrl = environment.VITE_BACKEND_URL || 'http://localhost:3000';

  return {
    // Tailwind CSS v4 berjalan sebagai plugin Vite (tidak perlu postcss.config / tailwind.config).
    plugins: [react(), tailwindcss()],
    resolve: {
      // Alias "@" -> src, mengikuti konvensi shadcn/ui (import '@/components/ui/button').
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Library dipisah ke file sendiri agar ukuran file utama lebih kecil & mudah di-cache.
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['@tanstack/react-query', 'zustand', 'socket.io-client', 'motion/react'],
            forms: ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
          },
        },
      },
    },
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
