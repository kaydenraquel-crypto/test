import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          'vendor-charts': ['lightweight-charts'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-testing': ['vitest', '@testing-library/react', '@testing-library/jest-dom'],
          
          // Feature-based chunks
          'analytics': ['./src/lib/analytics.ts', './src/lib/logger.ts'],
          'trading-utils': ['./src/lib/cache.ts', './src/lib/userPreferences.ts'],
          
          // Component chunks
          'panels': [
            './src/components/AiAssistantPanel.tsx',
            './src/components/WatchlistPanel.tsx',
            './src/components/AnalyticsDashboard.tsx'
          ],
          'indicators': [
            './src/components/AdvancedIndicators.tsx',
            './src/components/KeyIndicators.tsx'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild',
    // Source maps for debugging
    sourcemap: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'lightweight-charts'],
    exclude: ['@testing-library/react']
  }
})
