import React, { memo, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useOptimizedVideos } from '@/hooks/useOptimizedVideos';
import OptimizedVideoCard from '@/components/optimized/OptimizedVideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Video } from '@/types/video';

interface OptimizedVideoFeedProps {
  height: number;
  itemHeight: number;
  onVideoClick?: (video: Video) => void;
  className?: string;
}

interface VideoItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    videos: Video[];
    onVideoClick?: (video: Video) => void;
  };
}

const VideoItem = memo<VideoItemProps>(({ index, style, data }) => {
  const { videos, onVideoClick } = data;
  const video = videos[index];

  const handleClick = useCallback(() => {
    onVideoClick?.(video);
  }, [video, onVideoClick]);

  if (!video) return null;

  return (
    <div style={style} className="px-2">
      <OptimizedVideoCard
        video={video}
        productLinks={[]}
        onClick={handleClick}
        className="h-full"
      />
    </div>
  );
});

VideoItem.displayName = 'VideoItem';

const OptimizedVideoFeed = memo<OptimizedVideoFeedProps>(({ 
  height, 
  itemHeight, 
  onVideoClick,
  className 
}) => {
  const { videos, isLoading } = useOptimizedVideos({
    limit: 50, // Load more videos for better scrolling
    status: 'published'
  });

  const itemData = useMemo(() => ({
    videos,
    onVideoClick
  }), [videos, onVideoClick]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-96 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width={300} // Default width, adjust as needed
        itemCount={videos.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={2} // Render 2 extra items for smoother scrolling
      >
        {VideoItem}
      </List>
    </div>
  );
});

OptimizedVideoFeed.displayName = 'OptimizedVideoFeed';

export default OptimizedVideoFeed;