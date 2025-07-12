
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    },
    fs: {
      strict: false
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    force: true, // Nuclear cache invalidation
    exclude: ['web-vitals', 'sentry', 'monitoring'], // Force exclude all monitoring deps
    include: [], // Explicit inclusion only
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['web-vitals', 'monitoring']
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_TIME__: `"${Date.now()}"`, // Force cache bust with build timestamp as string
    __CACHE_BUST__: `"${Math.random()}"`, // Additional cache buster
  },
  clearScreen: false, // Keep logs visible
}));
