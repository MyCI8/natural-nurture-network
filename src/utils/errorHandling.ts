/**
 * Standardized error handling patterns and utilities
 */

import { toast } from 'sonner';

// Safe import of monitoring with fallback
const getCaptureException = () => {
  try {
    // Use safe monitoring to avoid cache issues
    const { captureException } = require('./safeMonitoring');
    return captureException;
  } catch {
    // Fallback function if monitoring is not available
    return (error: Error, context?: Record<string, unknown>) => {
      console.warn('Monitoring not available, logging error locally:', error, context);
    };
  }
};

const captureException = getCaptureException();

// Standard error types
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  CLIENT = 'CLIENT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  originalError?: Error;
}

// Error factory functions
export const createAppError = (
  type: ErrorType,
  message: string,
  details?: Record<string, unknown>,
  originalError?: Error
): AppError => ({
  type,
  message,
  details,
  originalError,
});

export const createNetworkError = (message: string, originalError?: Error): AppError =>
  createAppError(ErrorType.NETWORK, message, undefined, originalError);

export const createValidationError = (
  message: string,
  fields?: Record<string, string>
): AppError =>
  createAppError(ErrorType.VALIDATION, message, { fields });

export const createAuthError = (message: string): AppError =>
  createAppError(ErrorType.AUTHENTICATION, message);

// Error classification
export const classifyError = (error: unknown): AppError => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return createNetworkError(error.message, error);
    }
    
    if (message.includes('unauthorized') || message.includes('auth')) {
      return createAuthError(error.message);
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return createValidationError(error.message);
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return createAppError(ErrorType.NOT_FOUND, error.message, undefined, error);
    }
    
    return createAppError(ErrorType.UNKNOWN, error.message, undefined, error);
  }
  
  if (typeof error === 'string') {
    return createAppError(ErrorType.UNKNOWN, error);
  }
  
  return createAppError(ErrorType.UNKNOWN, 'An unexpected error occurred');
};

// Error handling strategies
export const handleError = (error: unknown, context?: string): void => {
  const appError = classifyError(error);
  
  // Log error with context
  console.error(`Error in ${context || 'unknown context'}:`, appError);
  
  // Report to monitoring service
  captureException(
    appError.originalError || new Error(appError.message),
    {
      type: appError.type,
      context,
      ...appError.details,
    }
  );
  
  // Show user-friendly message
  showErrorToast(appError);
};

export const showErrorToast = (error: AppError): void => {
  const userFriendlyMessages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Network connection issue. Please check your internet connection.',
    [ErrorType.VALIDATION]: error.message,
    [ErrorType.AUTHENTICATION]: 'Please sign in to continue.',
    [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
    [ErrorType.NOT_FOUND]: 'The requested item could not be found.',
    [ErrorType.SERVER]: 'Server error. Please try again later.',
    [ErrorType.CLIENT]: 'Something went wrong. Please try again.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };
  
  toast.error(userFriendlyMessages[error.type] || error.message);
};

// Async error wrapper
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
};

// React error boundary helper
export const getErrorBoundaryFallback = (error: Error): string => {
  const appError = classifyError(error);
  
  return `
    <div class="flex flex-col items-center justify-center min-h-[200px] p-6 bg-destructive/10 rounded-lg border border-destructive/20">
      <h2 class="text-lg font-semibold text-destructive mb-2">
        Something went wrong
      </h2>
      <p class="text-sm text-muted-foreground mb-4 text-center">
        ${appError.message}
      </p>
      <button 
        onclick="window.location.reload()"
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Reload page
      </button>
    </div>
  `;
};