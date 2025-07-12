
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import App from './App.tsx'
import './index.css'

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

// Initialize monitoring asynchronously without blocking
const initializeMonitoringAsync = async () => {
  try {
    const { initializeMonitoring, trackWebVitals } = await import('./utils/monitoring');
    initializeMonitoring();
    trackWebVitals();
  } catch (error) {
    console.warn('Monitoring utilities not available:', error);
  }
};

// Start monitoring in the background
initializeMonitoringAsync();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
