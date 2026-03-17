import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // base: '/', // Change to '/your-subpath/' if deploying to a subdirectory
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
  },
});
