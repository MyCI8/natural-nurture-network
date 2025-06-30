
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useUrlPreview } from '@/hooks/useUrlPreview';
import { Button } from '@/components/ui/button';

interface SimpleUrlPreviewProps {
  url: string;
  className?: string;
  showUrl?: boolean;
}

export const SimpleUrlPreview: React.FC<SimpleUrlPreviewProps> = ({ 
  url, 
  className = "",
  showUrl = true 
}) => {
  const { preview, loading, error, refetch } = useUrlPreview(url);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 border rounded-lg bg-muted/30 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading preview...</span>
      </div>
    );
  }

  if (error) {
    const isBotBlocked = error.includes('bot detection') || error.includes('Cloudflare');
    
    return (
      <div className={`p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {isBotBlocked ? 'Site blocks automated requests' : 'Preview unavailable'}
              </p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary truncate block"
              >
                {url}
              </a>
            </div>
          </div>
          {!isBotBlocked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="flex-shrink-0 h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors ${className}`}
      >
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
