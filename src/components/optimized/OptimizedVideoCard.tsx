import React, { memo, useCallback } from 'react';
import { Video, ProductLink } from '@/types/video';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import VideoPlayer from '@/components/video/VideoPlayer';

interface OptimizedVideoCardProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  onClick?: () => void;
  className?: string;
}

const OptimizedVideoCard = memo<OptimizedVideoCardProps>(({ 
  video, 
  productLinks = [], 
  autoPlay = false,
  onClick,
  className 
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card className={className}>
      <AspectRatio ratio={9 / 16}>
        <VideoPlayer
          video={video}
          productLinks={productLinks}
          autoPlay={autoPlay}
          onClick={handleClick}
          showControls={false}
          className="w-full h-full"
        />
      </AspectRatio>
    </Card>
  );
});

OptimizedVideoCard.displayName = 'OptimizedVideoCard';

export default OptimizedVideoCard;