import { describe, it, expect, vi } from 'vitest';
import {
  ErrorType,
  classifyError,
  createAppError,
  createNetworkError,
  createValidationError,
  withErrorHandling,
} from '@/utils/errorHandling';

describe('errorHandling', () => {
  describe('createAppError', () => {
    it('should create an app error with correct properties', () => {
      const error = createAppError(
        ErrorType.VALIDATION,
        'Invalid input',
        { field: 'email' }
      );

      expect(error).toEqual({
        type: ErrorType.VALIDATION,
        message: 'Invalid input',
        details: { field: 'email' },
      });
    });
  });

  describe('classifyError', () => {
    it('should classify network errors', () => {
      const networkError = new Error('Network request failed');
      const classified = classifyError(networkError);

      expect(classified.type).toBe(ErrorType.NETWORK);
      expect(classified.message).toBe('Network request failed');
      expect(classified.originalError).toBe(networkError);
    });

    it('should classify authentication errors', () => {
      const authError = new Error('Unauthorized access');
      const classified = classifyError(authError);

      expect(classified.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('should classify validation errors', () => {
      const validationError = new Error('Invalid email format');
      const classified = classifyError(validationError);

      expect(classified.type).toBe(ErrorType.VALIDATION);
    });

    it('should classify not found errors', () => {
      const notFoundError = new Error('Resource not found');
      const classified = classifyError(notFoundError);

      expect(classified.type).toBe(ErrorType.NOT_FOUND);
    });

    it('should handle string errors', () => {
      const classified = classifyError('Something went wrong');

      expect(classified.type).toBe(ErrorType.UNKNOWN);
      expect(classified.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const classified = classifyError({ unexpected: true });

      expect(classified.type).toBe(ErrorType.UNKNOWN);
      expect(classified.message).toBe('An unexpected error occurred');
    });
  });

  describe('withErrorHandling', () => {
    it('should return result when function succeeds', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(successFn, 'test-context');

      const result = await wrappedFn();

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should return null when function throws', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
      const wrappedFn = withErrorHandling(errorFn, 'test-context');

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await wrappedFn();

      expect(result).toBeNull();
      expect(errorFn).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('factory functions', () => {
    it('should create network error', () => {
      const error = createNetworkError('Connection failed');

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Connection failed');
    });

    it('should create validation error with fields', () => {
      const error = createValidationError('Validation failed', {
        email: 'Invalid format',
        password: 'Too short',
      });

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.details?.fields).toEqual({
        email: 'Invalid format',
        password: 'Too short',
      });
    });
  });
});