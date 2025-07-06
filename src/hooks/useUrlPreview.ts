
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UrlPreviewData {
  title: string;
  description: string;
  thumbnailUrl: string;
  price?: number;
}

export const useUrlPreview = (url: string) => {
  const [error, setError] = useState<string | null>(null);

  const { data: preview, isLoading, refetch } = useQuery({
    queryKey: ['url-preview', url],
    queryFn: async (): Promise<UrlPreviewData | null> => {
      if (!url) {return null;}

      setError(null);

      try {
        const { data, error } = await supabase.functions.invoke('link-preview', {
          body: { url }
        });

        if (error) {throw error;}

        return {
          title: data.title || 'Untitled',
          description: data.description || '',
          thumbnailUrl: data.thumbnailUrl || '',
          price: data.price
        };
      } catch (err) {
        console.error('Error fetching preview:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
        setError(errorMessage);
        return null;
      }
    },
    enabled: Boolean(url),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry bot-blocked sites
      if (error?.message?.includes('bot detection') || 
          error?.message?.includes('Cloudflare')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  return {
    preview,
    loading: isLoading,
    error,
    refetch: () => refetch()
  };
};
