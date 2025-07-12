/**
 * Safe monitoring wrapper to avoid Vite cache issues
 * This file ensures monitoring functionality without breaking the app
 */

// Simple fallback functions that won't break if monitoring fails
export const safeInitializeMonitoring = (): void => {
  try {
    // Only initialize in production
    if (import.meta.env.PROD) {
      console.log('Production monitoring would be initialized here');
    }
  } catch (error) {
    console.warn('Monitoring initialization skipped:', error);
  }
};

export const safeCaptureException = (error: Error, context?: Record<string, unknown>): void => {
  try {
    if (import.meta.env.PROD) {
      // In production, you could send to external service
      console.error('Would capture exception:', error, context);
    } else {
      console.error('Exception:', error, context);
    }
  } catch (captureError) {
    console.error('Failed to capture exception:', captureError);
    console.error('Original error:', error, context);
  }
};

export const safeTrackUserAction = (action: string, data?: Record<string, unknown>): void => {
  try {
    if (import.meta.env.DEV) {
      console.log('User action:', action, data);
    }
  } catch (error) {
    console.warn('Failed to track user action:', error);
  }
};

// Export default monitoring functions
export const initializeMonitoring = safeInitializeMonitoring;
export const captureException = safeCaptureException;
export const trackUserAction = safeTrackUserAction;