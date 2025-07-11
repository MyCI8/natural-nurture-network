
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import App from './App.tsx'
import './index.css'

// Import monitoring utilities with error handling
let initializeMonitoring: (() => void) | null = null;
let trackWebVitals: (() => void) | null = null;

try {
  const monitoring = await import('./utils/monitoring');
  initializeMonitoring = monitoring.initializeMonitoring;
  trackWebVitals = monitoring.trackWebVitals;
} catch (error) {
  console.warn('Failed to load monitoring utilities:', error);
}

// Initialize monitoring if available
try {
  initializeMonitoring?.();
} catch (error) {
  console.warn('Failed to initialize monitoring:', error);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

// Initialize web vitals tracking if available
try {
  trackWebVitals?.();
} catch (error) {
  console.warn('Failed to initialize web vitals tracking:', error);
}
