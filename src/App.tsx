
import React, { useEffect } from 'react';
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from "./routes";
import ScrollToTop from "./components/layout/ScrollToTop";
import ErrorBoundary from './components/ErrorBoundary';
import { log } from './utils/logger';
import { initializeMonitoring, trackWebVitals } from './utils/monitoring';

// Configure React Query for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && 
            error?.status !== 408 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    }
  }
});

// Global error handlers
window.addEventListener('error', (event) => {
  log.error('Unhandled error', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  log.error('Unhandled promise rejection', new Error(event.reason), {
    reason: event.reason
  });
});

function App(): React.JSX.Element {
  log.info('App component mounted');

  useEffect(() => {
    // Initialize monitoring and performance tracking
    initializeMonitoring();
    trackWebVitals();
  }, []);

  return (
    <ErrorBoundary level="page" showRetry={true}>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
