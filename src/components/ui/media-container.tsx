
import React from 'react';
import { cn } from '@/lib/utils';

interface MediaContainerProps {
  children: React.ReactNode;
  aspectRatio?: 'auto' | '16:9' | '1:1' | '9:16' | '4:3' | '3:4';
  className?: string;
  rounded?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  onClick?: () => void;
}

const MediaContainer: React.FC<MediaContainerProps> = ({
  children,
  aspectRatio = '1:1', // Changed from 'auto' to prevent loading issues
  className,
  rounded = true,
  imageUrl,
  imageAlt,
  onClick
}) => {
  // Use Tailwind's built-in aspect ratio classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
    'auto': 'aspect-square', // fallback to square for auto
  };

  return (
    <div className={cn("media-container w-full", className)}>
      <div 
        className={cn(
          "media-wrapper relative w-full overflow-hidden bg-muted",
          aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses],
          rounded && "rounded-xl",
          onClick && "cursor-pointer hover:opacity-90 transition-opacity"
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
};

export default MediaContainer;
