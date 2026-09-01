import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/beachcomber-hotel-and-resort/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: { exclude: ['maplibre-gl'] },
  build: {
    // Split the framework into its own long-lived chunk so app-code deploys
    // don't force guests to re-download React on their next visit.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
