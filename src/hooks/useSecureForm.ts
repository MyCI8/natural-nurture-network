
import { useState, useCallback } from 'react';
import { validateTextInput, isValidEmail, isValidUrl } from '@/utils/validation';

interface ValidationRule {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

/**
 * Secure form hook with built-in validation and sanitization
 */
export const useSecureForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules = {}
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    // Required check
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${name} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    const stringValue = value.toString();

    // Length checks
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${name} cannot exceed ${rule.maxLength} characters`;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    // Built-in validations for common types
    if (name.toLowerCase().includes('email') && !isValidEmail(stringValue)) {
      return 'Please enter a valid email address';
    }

    if (name.toLowerCase().includes('url') && !isValidUrl(stringValue)) {
      return 'Please enter a valid URL';
    }

    // Text input validation and sanitization
    const { isValid, error } = validateTextInput(
      stringValue,
      rule.maxLength,
      name.toLowerCase().includes('content') || name.toLowerCase().includes('description')
    );

    if (!isValid && error) {
      return error;
    }

    return null;
  }, [validationRules]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField, validationRules]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const isValid = validateForm();
      if (!isValid) {
        return false;
      }

      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validateForm,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};
