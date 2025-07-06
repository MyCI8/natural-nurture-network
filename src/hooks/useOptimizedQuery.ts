import { useQuery, useQueryClient, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

// Optimized React Query hook with intelligent caching and stale time
export function useOptimizedQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    cacheTime?: number;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) {
  const optimizedQueryFn = useCallback(queryFn, [queryFn]);

  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes default (renamed from cacheTime)
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) {return false;}
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

// Prefetch utility for anticipatory loading
export function usePrefetchQuery() {
  const queryClient = useQueryClient();
  
  return useCallback(
    <TData>(
      queryKey: QueryKey,
      queryFn: () => Promise<TData>,
      options?: { staleTime?: number }
    ) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}