
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UrlPreviewData {
  title: string;
  description: string;
  thumbnailUrl: string;
  price?: number;
}

export const useUrlPreview = (url: string) => {
  const [preview, setPreview] = useState<UrlPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async (targetUrl: string) => {
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('link-preview', {
        body: { url: targetUrl }
      });

      if (error) throw error;

      setPreview({
        title: data.title || 'Untitled',
        description: data.description || '',
        thumbnailUrl: data.thumbnailUrl || '',
        price: data.price
      });
    } catch (err) {
      console.error('Error fetching preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchPreview(url);
    }
  }, [url]);

  return {
    preview,
    loading,
    error,
    refetch: () => fetchPreview(url)
  };
};
