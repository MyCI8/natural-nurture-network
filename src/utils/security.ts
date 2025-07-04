/**
 * CSRF Protection and Security Headers utility
 */

// CSRF Token management
export class CSRFProtection {
  private static tokenKey = 'csrf_token';
  private static token: string | null = null;

  static generateToken(): string {
    const token = crypto.randomUUID();
    this.token = token;
    sessionStorage.setItem(this.tokenKey, token);
    return token;
  }

  static getToken(): string {
    if (!this.token) {
      this.token = sessionStorage.getItem(this.tokenKey) || this.generateToken();
    }
    return this.token;
  }

  static validateToken(submittedToken: string): boolean {
    const currentToken = this.getToken();
    return submittedToken === currentToken && submittedToken.length > 0;
  }

  static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  static addToFormData(formData: FormData): FormData {
    formData.append('csrf_token', this.getToken());
    return formData;
  }

  static createHiddenInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = this.getToken();
    return input;
  }
}

// Security headers for requests
export const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate limiting for client-side requests
export class RateLimiter {
  private static requests = new Map<string, number[]>();
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS = 100; // Max requests per window

  static canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  static getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    return Math.max(0, this.MAX_REQUESTS - recentRequests.length);
  }
}

// Input sanitization and validation helpers
export const securityHelpers = {
  sanitizeFileName: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 255);
  },

  sanitizeUrl: (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }
      return parsedUrl.toString();
    } catch {
      return null;
    }
  },

  generateSecureId: (): string => {
    return crypto.randomUUID();
  },

  hashString: async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};