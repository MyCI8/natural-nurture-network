
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
    force: true,
    include: [
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_TIME__: `"${Date.now()}"`,
    __CACHE_BUST__: `"${Math.random()}"`,
    __DEV__: mode === 'development'
  },
  clearScreen: false, // Keep logs visible
}));
