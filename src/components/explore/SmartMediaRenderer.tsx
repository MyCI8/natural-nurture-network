
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
        className={cn("w-full relative overflow-hidden bg-black rounded-lg cursor-pointer", className)}
        onClick={onClick}
      >
        <img
          src={video.video_url}
          alt={video.description || ''}
          className="w-full h-auto object-contain max-h-[600px]"
          draggable={false}
          style={{
            aspectRatio: 'auto',
            maxHeight: '600px'
          }}
        />
        
        {/* Image indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Image
        </div>
      </div>
    );
  }

  // For videos, maintain the existing container structure
  return (
    <div
      className={cn("w-full relative", className)}
      style={{ aspectRatio: '4/5' }}
      onClick={onClick}
    >
      {/* This will be handled by the existing VideoPlayer in the parent */}
    </div>
  );
};
