
/**
 * Input validation utilities for security
 */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes and validates text input
 */
export const validateTextInput = (
  input: string, 
  maxLength: number = 1000,
  allowHtml: boolean = false
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Input is required' };
  }

  if (input.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: input.slice(0, maxLength), 
      error: `Input exceeds maximum length of ${maxLength} characters` 
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi
  ];

  const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));
  
  if (hasSuspiciousContent && !allowHtml) {
    return { 
      isValid: false, 
      sanitized: input.replace(/<[^>]*>/g, ''), 
      error: 'Input contains potentially unsafe content' 
    };
  }

  const sanitized = allowHtml 
    ? input // Will be sanitized by DOMPurify when rendered
    : input.replace(/<[^>]*>/g, ''); // Strip HTML for plain text

  return { isValid: true, sanitized };
};

/**
 * Rate limiting helper for API endpoints
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(identifier, recentRequests);
    
    return true; // Request allowed
  };
};
