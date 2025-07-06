
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MediaInfo, getMediaInfo, calculateContainerDimensions } from '@/utils/mediaUtils';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';

interface DynamicMediaContainerProps {
  video: Video;
  productLinks?: ProductLink[];
  onClick?: () => void;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  visibleProductLink?: string | null;
  toggleProductLink?: (linkId: string) => void;
  className?: string;
}

export const DynamicMediaContainer: React.FC<DynamicMediaContainerProps> = ({
  video,
  productLinks = [],
  onClick,
  globalAudioEnabled = false,
  onAudioStateChange,
  visibleProductLink,
  toggleProductLink,
  className
}) => {
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(4/5); // Default video ratio

  useEffect(() => {
    if (video.video_url) {
      const info = getMediaInfo(video.video_url);
      setMediaInfo(info);
      
      // Set default aspect ratios
      if (info.isImage) {
        // For images, we'll determine the actual ratio after loading
        setAspectRatio(1); // Square as fallback
      } else if (info.isVideo || info.isYoutube) {
        setAspectRatio(4/5); // Portrait video ratio for feed
      }
    }
  }, [video.video_url]);

  const handleMediaLoad = (dimensions: { width: number; height: number }) => {
    setMediaDimensions(dimensions);
    
    if (mediaInfo?.isImage && dimensions.width && dimensions.height) {
      const naturalRatio = dimensions.width / dimensions.height;
      
      // Calculate optimal display dimensions for the feed
      const maxWidth = 400; // Max container width
      const maxHeight = 600; // Max container height for images
      
      const optimalDimensions = calculateContainerDimensions(
        dimensions.width,
        dimensions.height,
        maxWidth,
        maxHeight
      );
      
      setAspectRatio(naturalRatio);
    }
  };

  // Calculate container style based on media type
  const getContainerStyle = () => {
    if (!mediaInfo) {return { aspectRatio: '4/5' };}
    
    if (mediaInfo.isImage) {
      // For images, use natural aspect ratio with constraints
      const maxHeight = aspectRatio < 1 ? '600px' : '500px'; // Taller for portrait, shorter for landscape
      return {
        aspectRatio: aspectRatio.toString(),
        maxHeight
      };
    } else {
      // For videos, maintain the feed's 4:5 ratio
      return { aspectRatio: '4/5' };
    }
  };

  if (mediaInfo?.isImage) {
    return (
      <div
        className={cn("w-full relative overflow-hidden bg-black rounded-lg", className)}
        style={getContainerStyle()}
        onClick={onClick}
      >
        <img
          src={video.video_url}
          alt={video.description || ''}
          className="w-full h-full object-contain"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            handleMediaLoad({
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          }}
          draggable={false}
        />
      </div>
    );
  }

  // For videos and YouTube, use the existing VideoPlayer
  return (
    <div
      className={cn("w-full relative", className)}
      style={getContainerStyle()}
      onClick={onClick}
    >
      <VideoPlayer
        video={video}
        productLinks={productLinks}
        autoPlay
        showControls={false}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={onAudioStateChange}
        onClick={onClick}
        className="w-full h-full"
        visibleProductLink={visibleProductLink}
        toggleProductLink={toggleProductLink}
        useAspectRatio={false} // We handle aspect ratio at container level
        objectFit="cover"
        hideControls
      />
    </div>
  );
};
