/**
 * Clean monitoring system - completely free of external dependencies
 */

export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
  }
};

export const trackUserAction = (action: string, data?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) {
    console.log('User action:', action, data);
  }
};

export const initializeMonitoring = (): void => {
  if (import.meta.env.DEV) {
    console.log('Clean monitoring system active');
  }
};

export const reportWebVitals = (): void => {
  if (import.meta.env.DEV) {
    console.log('Performance monitoring placeholder');
  }
};