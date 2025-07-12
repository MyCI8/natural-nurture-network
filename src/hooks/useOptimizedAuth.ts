import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useOptimizedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });
  
  const queryClient = useQueryClient();

  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    setAuthState(prev => ({
      ...prev,
      user: session?.user ?? null,
      session,
      loading: false,
      error: null,
    }));

    // Clear relevant query cache on auth state change
    if (event === 'SIGNED_OUT') {
      queryClient.clear();
    } else if (event === 'SIGNED_IN' && session?.user) {
      // Prefetch user data
      queryClient.prefetchQuery({
        queryKey: queryKeys.user(session.user.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  }, [queryClient]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!mounted) return;
        setAuthState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Auth error', 
          loading: false 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Sign out error' 
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signOut,
    clearError,
  };
};