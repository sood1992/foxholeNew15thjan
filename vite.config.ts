import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Use relative paths for assets
    assetsDir: 'assets',
    // Generate sourcemaps for debugging
    sourcemap: false,
    // Ensure consistent chunk names
    rollupOptions: {
      output: {
        // Use .js extension explicitly
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Use a manual chunk strategy to reduce file count
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Use esbuild for minification (default, just being explicit)
    minify: 'esbuild',
    // Target modern browsers but not bleeding edge
    target: 'es2020',
  },
})
