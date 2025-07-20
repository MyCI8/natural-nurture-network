
import React, { memo, useCallback, useMemo, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { useOptimizedVideoFeed } from '../hooks/useOptimizedVideoFeed';
import OptimizedVideoPlayer from './OptimizedVideoPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedVideoFeedProps {
  type?: 'explore' | 'news' | 'general';
  className?: string;
  onVideoClick?: (video: Video) => void;
  itemHeight?: number;
  gap?: number;
  showControls?: boolean;
  autoPlay?: boolean;
}

interface VideoItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    videos: Video[];
    onVideoClick?: (video: Video) => void;
    showControls?: boolean;
    autoPlay?: boolean;
    gap: number;
  };
}

const VideoItem = memo<VideoItemProps>(({ index, style, data }) => {
  const { videos, onVideoClick, showControls, autoPlay, gap } = data;
  const video = videos[index];
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);

  const handleVideoClick = useCallback(() => {
    onVideoClick?.(video);
  }, [onVideoClick, video]);

  const handleAudioStateChange = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setGlobalAudioEnabled(prev => !prev);
  }, []);

  if (!video) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-md w-full h-full" />
      </div>
    );
  }

  return (
    <div style={{...style, paddingBottom: gap}}>
      <div className="w-full h-full p-4">
        <OptimizedVideoPlayer
          video={video}
          autoPlay={autoPlay}
          muted={!globalAudioEnabled}
          showControls={showControls}
          onClick={handleVideoClick}
          onMuteToggle={handleAudioStateChange}
          className="w-full rounded-lg overflow-hidden"
        />
        
        {/* Video metadata */}
        <div className="mt-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">
            {video.title}
          </h3>
          {video.creator && (
            <div className="flex items-center gap-2">
              {video.creator.avatar_url && (
                <img
                  src={video.creator.avatar_url}
                  alt={video.creator.full_name || video.creator.username || ''}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-muted-foreground">
                {video.creator.full_name || video.creator.username}
              </span>
            </div>
          )}
          {video.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

VideoItem.displayName = 'VideoItem';

const OptimizedVideoFeed = memo<OptimizedVideoFeedProps>(({
  type = 'general',
  className,
  onVideoClick,
  itemHeight = 600,
  gap = 16,
  showControls = false,
  autoPlay = true,
}) => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const { videos, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching, error } = useOptimizedVideoFeed({ 
    type,
    limit: 15
  });

  console.log('OptimizedVideoFeed render:', {
    videosCount: videos.length,
    hasNextPage,
    isFetching,
    error: error?.message,
    type
  });

  // Calculate item height including gap
  const adjustedItemHeight = itemHeight + gap;

  // Create memoized data object for react-window
  const itemData = useMemo(() => ({
    videos,
    onVideoClick,
    showControls,
    autoPlay,
    gap,
  }), [videos, onVideoClick, showControls, autoPlay, gap]);

  // Total item count including loading indicator
  const itemCount = hasNextPage ? videos.length + 1 : videos.length;

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return !hasNextPage || index < videos.length;
  }, [hasNextPage, videos.length]);

  // Load more items when scrolling near the end
  const loadMoreItems = useCallback((startIndex: number, stopIndex: number) => {
    if (hasNextPage && !isFetchingNextPage) {
      return fetchNextPage();
    }
    return Promise.resolve();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle loading state
  if (isFetching && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load videos</p>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!isFetching && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Check back later for new content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <AutoSizer>
        {({ height, width }) => {
          console.log('AutoSizer dimensions:', { height, width });
          
          // Fallback dimensions if AutoSizer fails
          const actualHeight = height || 600;
          const actualWidth = width || 400;
          
          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
              threshold={3}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  ref={ref}
                  height={actualHeight}
                  width={actualWidth}
                  itemCount={itemCount}
                  itemSize={() => adjustedItemHeight}
                  itemData={itemData}
                  onItemsRendered={onItemsRendered}
                  overscanCount={2}
                >
                  {VideoItem}
                </List>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
});

OptimizedVideoFeed.displayName = 'OptimizedVideoFeed';

export default OptimizedVideoFeed;
