
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2 } from 'lucide-react';

interface SimpleUrlPreviewProps {
  url: string;
  className?: string;
  showUrl?: boolean;
}

interface PreviewData {
  title: string;
  thumbnailUrl: string;
}

export const SimpleUrlPreview: React.FC<SimpleUrlPreviewProps> = ({ 
  url, 
  className = "",
  showUrl = true 
}) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('link-preview', {
          body: { url }
        });

        if (error) throw error;

        if (data?.title || data?.thumbnailUrl) {
          setPreview({
            title: data.title || 'Untitled',
            thumbnailUrl: data.thumbnailUrl || ''
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 border rounded-lg ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading preview...</span>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors ${className}`}
      >
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm truncate">{url}</span>
      </a>
    );
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block hover:shadow-md transition-shadow ${className}`}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {preview.thumbnailUrl && (
              <div className="flex-shrink-0 w-20 h-20 bg-muted">
                <img
                  src={preview.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-3 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {preview.title}
              </h4>
              {showUrl && (
                <p className="text-xs text-muted-foreground truncate">
                  {url}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};
