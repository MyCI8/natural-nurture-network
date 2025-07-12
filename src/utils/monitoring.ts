
/**
 * Clean monitoring utilities without external dependencies
 * This replaces the problematic web-vitals integration
 */

// Simple error capture without external dependencies
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
  }
  // In production, you could send to external service here
};

// Simple user action tracking
export const trackUserAction = (action: string, data?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) {
    console.log('User action:', action, data);
  }
};

// Initialize monitoring (no-op for now)
export const initializeMonitoring = (): void => {
  if (import.meta.env.DEV) {
    console.log('Simple monitoring initialized');
  }
};

// Performance monitoring without web-vitals
export const reportWebVitals = (): void => {
  // No-op - removes dependency on web-vitals
  if (import.meta.env.DEV) {
    console.log('Web vitals reporting disabled to avoid cache issues');
  }
};
