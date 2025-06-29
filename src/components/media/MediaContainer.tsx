import React, { useState, useRef, useEffect } from 'react';
import { MediaInfo, getMediaInfo, calculateContainerDimensions, MediaType } from '@/utils/mediaUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface MediaContainerProps {
  src: string;
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoad?: (dimensions: { width: number; height: number }) => void;
  onError?: (error: string) => void;
  onClick?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill';
  preserveAspectRatio?: boolean;
  mediaType?: MediaType; // Add this prop to override auto-detection
}

export const MediaContainer: React.FC<MediaContainerProps> = ({
  src,
  alt = '',
  className = '',
  maxWidth = 800,
  maxHeight = 600,
  showControls = false,
  autoPlay = false,
  muted = true,
  loop = false,
  onLoad,
  onError,
  onClick,
  objectFit = 'contain',
  preserveAspectRatio = true,
  mediaType // Use this for blob URLs where detection fails
}) => {
  // Use provided mediaType or fallback to detection
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>(() => 
    getMediaInfo(src, mediaType)
  );
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

  // Update media info when src or mediaType changes
  useEffect(() => {
    setMediaInfo(getMediaInfo(src, mediaType));
    setDimensions(null);
    setIsLoading(true);
    setError(null);
  }, [src, mediaType]);

  const handleMediaLoad = () => {
    setIsLoading(false);
    
    if (mediaRef.current) {
      let naturalWidth: number;
      let naturalHeight: number;
      
      if (mediaInfo.isVideo) {
        const video = mediaRef.current as HTMLVideoElement;
        naturalWidth = video.videoWidth;
        naturalHeight = video.videoHeight;
      } else {
        const img = mediaRef.current as HTMLImageElement;
        naturalWidth = img.naturalWidth;
        naturalHeight = img.naturalHeight;
      }
      
      if (naturalWidth && naturalHeight && preserveAspectRatio) {
        const calculatedDimensions = calculateContainerDimensions(
          naturalWidth,
          naturalHeight,
          maxWidth,
          maxHeight
        );
        setDimensions(calculatedDimensions);
        onLoad?.(calculatedDimensions);
      }
    }
  };

  const handleMediaError = () => {
    setIsLoading(false);
    const errorMsg = `Failed to load ${mediaInfo.isVideo ? 'video' : 'image'}`;
    setError(errorMsg);
    onError?.(errorMsg);
  };

  const renderMedia = () => {
    if (mediaInfo.isYoutube) {
      // Handle YouTube separately
      const videoId = extractYouTubeId(src);
      if (!videoId) {
        return <div className="text-destructive">Invalid YouTube URL</div>;
      }
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (mediaInfo.isVideo) {
      return (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          className={cn("w-full h-full", objectFit === 'contain' ? 'object-contain' : 'object-cover')}
          controls={showControls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          onLoadedData={handleMediaLoad}
          onError={handleMediaError}
          onClick={onClick}
        />
      );
    }

    if (mediaInfo.isImage) {
      return (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt={alt}
          className={cn("w-full h-full", objectFit === 'contain' ? 'object-contain' : 'object-cover')}
          onLoad={handleMediaLoad}
          onError={handleMediaError}
          onClick={onClick}
          draggable={false}
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
        Unsupported media type
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted text-destructive">
        {error}
      </div>
    );
  }

  const containerStyle = dimensions && preserveAspectRatio ? {
    width: dimensions.width,
    height: dimensions.height,
    maxWidth: '100%'
  } : {};

  return (
    <div 
      className={cn("relative bg-black overflow-hidden", className)}
      style={containerStyle}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {renderMedia()}
    </div>
  );
};

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  try {
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
  }
  return null;
};

export default MediaContainer;
