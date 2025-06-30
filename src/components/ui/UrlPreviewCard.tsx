
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useUrlPreview } from '@/hooks/useUrlPreview';
import { Button } from '@/components/ui/button';

interface UrlPreviewCardProps {
  url: string;
  className?: string;
  showDescription?: boolean;
  showPrice?: boolean;
}

export const UrlPreviewCard: React.FC<UrlPreviewCardProps> = ({ 
  url, 
  className = "",
  showDescription = true,
  showPrice = true
}) => {
  const { preview, loading, error, refetch } = useUrlPreview(url);

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

  if (error) {
    const isBotBlocked = error.includes('bot detection') || error.includes('Cloudflare');
    
    return (
      <Card className={`${className} border-red-200 dark:border-red-800`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  {isBotBlocked ? 'Site blocks automated requests' : 'Preview unavailable'}
                </p>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Visit link manually
                </a>
              </div>
            </div>
            {!isBotBlocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
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
