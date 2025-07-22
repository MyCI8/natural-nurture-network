
import React from 'react';
import { cn } from '@/lib/utils';
import { getMediaInfo } from '@/utils/mediaUtils';
import { Video } from '@/types/video';

interface SmartMediaRendererProps {
  video: Video;
  onClick?: () => void;
  className?: string;
}

export const SmartMediaRenderer: React.FC<SmartMediaRendererProps> = ({
  video,
  onClick,
  className
}) => {
  const mediaInfo = getMediaInfo(video.video_url || '');

  if (mediaInfo.isImage) {
    return (
      <div
        className={cn("responsive-media-container cursor-pointer", className)}
        onClick={onClick}
      >
        <img
          src={video.video_url}
          alt={video.description || ''}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Image indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Image
        </div>
      </div>
    );
  }

  // For videos, use uniform container structure
  return (
    <div
      className={cn("responsive-media-container cursor-pointer", className)}
      onClick={onClick}
    >
      <video
        src={video.video_url}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
};
