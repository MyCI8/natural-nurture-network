import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  quality?: 'low' | 'medium' | 'high';
  priority?: boolean;
}

// Optimized lazy loading image component with CDN optimization
export const LazyImage = React.memo<LazyImageProps>(({
  src,
  alt,
  fallbackSrc,
  className,
  aspectRatio = 'aspect-video',
  quality = 'medium',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimize image URL with quality parameters
  const getOptimizedSrc = useCallback((originalSrc: string, q: string) => {
    if (originalSrc.includes('supabase')) {
      // Add Supabase image transformations
      const url = new URL(originalSrc);
      url.searchParams.set('width', '800');
      url.searchParams.set('quality', q);
      return url.toString();
    }
    return originalSrc;
  }, []);

  const qualityMap = {
    low: '60',
    medium: '80',
    high: '95'
  };

  const optimizedSrc = getOptimizedSrc(imageSrc, qualityMap[quality]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    
    onError?.(e);
  }, [fallbackSrc, imageSrc, onError]);

  return (
    <div className={cn('relative overflow-hidden', aspectRatio, className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {hasError && !fallbackSrc ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Failed to load image
          </div>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;