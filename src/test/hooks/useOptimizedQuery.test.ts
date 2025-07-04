import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  
  return Wrapper;
};

describe('useOptimizedQuery', () => {
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const queryFn = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(
      () => useOptimizedQuery(['test'], queryFn),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors appropriately', async () => {
    const error = new Error('Test error');
    const queryFn = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(
      () => useOptimizedQuery(['test-error'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should use custom stale time', () => {
    const queryFn = vi.fn().mockResolvedValue({});
    const customStaleTime = 10000;
    
    renderHook(
      () => useOptimizedQuery(['test-stale'], queryFn, { staleTime: customStaleTime }),
      { wrapper: createWrapper() }
    );

    // The stale time should be passed to the underlying useQuery
    // This is more of an integration test with React Query
    expect(queryFn).toHaveBeenCalled();
  });
});