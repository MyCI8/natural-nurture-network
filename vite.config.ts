
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['web-vitals'], // Prevent Vite from caching web-vitals to avoid export issues
    force: true, // Force dependency re-optimization
    esbuildOptions: {
      // Ensure web-vitals is completely ignored during optimization
      external: ['web-vitals']
    }
  },
  build: {
    rollupOptions: {
      external: ['web-vitals'], // Ensure web-vitals is never bundled
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
