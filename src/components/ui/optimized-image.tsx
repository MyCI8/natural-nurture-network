
import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio = "4:3",
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    // Fallback to placeholder
    const target = e.target as HTMLImageElement;
    if (target.src !== "/placeholder.svg") {
      target.src = "/placeholder.svg";
    }
    onError?.(e);
  }, [onError]);

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-border/50" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
        draggable={false}
      />
    </div>
  );
};

export default OptimizedImage;
