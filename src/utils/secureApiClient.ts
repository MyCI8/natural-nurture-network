/**
 * Secure API client with built-in security features
 */

import { supabase } from '@/integrations/supabase/client';
import { CSRFProtection, securityHeaders, RateLimiter } from './security';
import { log } from './logger';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  skipCSRF?: boolean;
  skipRateLimit?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class SecureApiClient {
  private static async checkAuth(): Promise<{ user: any; isAdmin: boolean }> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check admin status if needed
    const { data: isAdmin } = await supabase.rpc('check_is_admin');
    
    return { user, isAdmin: Boolean(isAdmin) };
  }

  private static getUserIdentifier(): string {
    // Use session ID or IP as fallback for rate limiting
    return sessionStorage.getItem('session_id') || 'anonymous';
  }

  static async request<T = any>(
    url: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = false,
      requireAdmin = false,
      skipCSRF = false,
      skipRateLimit = false
    } = options;

    try {
      // Rate limiting check
      if (!skipRateLimit) {
        const identifier = this.getUserIdentifier();
        if (!RateLimiter.canMakeRequest(identifier)) {
          return {
            error: 'Rate limit exceeded. Please try again later.',
            status: 429
          };
        }
      }

      // Authentication checks
      if (requireAuth || requireAdmin) {
        const { user, isAdmin } = await this.checkAuth();
        
        if (requireAdmin && !isAdmin) {
          log.warn('Unauthorized admin access attempt', { userId: user.id, url });
          return {
            error: 'Admin access required',
            status: 403
          };
        }
      }

      // Prepare headers
      const requestHeaders = {
        ...securityHeaders,
        ...headers
      };

      // Add CSRF protection for state-changing requests
      if (!skipCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        Object.assign(requestHeaders, CSRFProtection.addToHeaders());
      }

      // Add auth header if needed
      if (requireAuth || requireAdmin) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          requestHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      // Make request
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: 'same-origin'
      };

      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          if (!skipCSRF) {
            CSRFProtection.addToFormData(body);
          }
          requestOptions.body = body;
          // Remove content-type header for FormData
          delete requestHeaders['Content-Type'];
        } else {
          requestOptions.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, requestOptions);
      
      // Log request for monitoring
      log.info('API request completed', {
        url,
        method,
        status: response.status,
        requireAuth,
        requireAdmin
      });

      const responseData = await response.json().catch(() => null);

      return {
        data: responseData,
        status: response.status,
        error: response.ok ? undefined : responseData?.message || 'Request failed'
      };

    } catch (error) {
      log.error('API request failed', error as Error, { url, method });
      return {
        error: 'Network error or request failed',
        status: 500
      };
    }
  }

  // Convenience methods
  static get<T>(url: string, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  static post<T>(url: string, body: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  static put<T>(url: string, body: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  static delete<T>(url: string, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}