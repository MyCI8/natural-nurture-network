/**
 * Production monitoring and performance tracking utilities
 */

import * as Sentry from '@sentry/react';

// Temporarily disable web-vitals to avoid import issues
const loadWebVitals = async () => {
  console.log('Web vitals disabled due to import issues');
  return null;
};

// Initialize Sentry for error tracking
export const initializeMonitoring = (): void => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Performance monitoring with proper error handling
export const trackWebVitals = async (): Promise<void> => {
  const webVitals = await loadWebVitals();
  if (!webVitals) {
    console.log('Web vitals tracking disabled');
    return;
  }
  // Web vitals functionality temporarily disabled
};

// Custom performance tracking
export const trackUserAction = (action: string, data?: Record<string, unknown>): void => {
  try {
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: action,
        level: 'info',
        data,
      });
    }
  } catch (error) {
    console.warn('Failed to track user action:', error);
  }
};

// Error boundary integration
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  try {
    if (import.meta.env.PROD) {
      Sentry.captureException(error, {
        extra: context || {},
      });
    } else {
      console.error('Captured Exception:', error, context);
    }
  } catch (sentryError) {
    console.error('Failed to capture exception:', sentryError);
    console.error('Original error:', error, context);
  }
};

// Health check endpoint
export const performHealthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: Record<string, boolean>;
}> => {
  const timestamp = new Date().toISOString();
  const services: Record<string, boolean> = {};

  try {
    // Check basic connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/health', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    services.connectivity = response.ok;
  } catch {
    services.connectivity = false;
  }

  // Check service worker
  services.serviceWorker = 'serviceWorker' in navigator;

  // Check local storage
  try {
    localStorage.setItem('health-check', 'test');
    localStorage.removeItem('health-check');
    services.localStorage = true;
  } catch {
    services.localStorage = false;
  }

  const allHealthy = Object.values(services).every(Boolean);

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    services,
  };
};

// React component for monitoring integration
export const withMonitoring = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  try {
    return Sentry.withProfiler(Component);
  } catch (error) {
    console.warn('Failed to wrap component with monitoring:', error);
    return Component;
  }
};