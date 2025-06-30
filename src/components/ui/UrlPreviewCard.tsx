
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2 } from 'lucide-react';

interface UrlPreviewCardProps {
  url: string;
  className?: string;
  showDescription?: boolean;
  showPrice?: boolean;
}

interface FullPreviewData {
  title: string;
  description: string;
  thumbnailUrl: string;
  price?: number;
}

export const UrlPreviewCard: React.FC<UrlPreviewCardProps> = ({ 
  url, 
  className = "",
  showDescription = true,
  showPrice = true
}) => {
  const [preview, setPreview] = useState<FullPreviewData | null>(null);
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

        setPreview({
          title: data.title || 'Untitled',
          description: data.description || '',
          thumbnailUrl: data.thumbnailUrl || '',
          price: data.price
        });
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
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !preview) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="truncate">{url}</span>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block hover:shadow-lg transition-shadow ${className}`}
    >
      <Card className="overflow-hidden">
        {preview.thumbnailUrl && (
          <div className="aspect-video bg-muted">
            <img
              src={preview.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2">
              {preview.title}
            </h3>
            {showPrice && preview.price && (
              <Badge variant="secondary">
                ${preview.price}
              </Badge>
            )}
          </div>
        </CardHeader>
        {showDescription && preview.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {preview.description}
            </p>
          </CardContent>
        )}
      </Card>
    </a>
  );
};
