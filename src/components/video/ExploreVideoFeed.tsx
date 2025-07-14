import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { useOptimizedVideoFeed } from '@/features/video/hooks/useOptimizedVideoFeed';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPost from '@/components/video/VideoPost';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

interface ExploreVideoFeedProps {
  type?: 'explore' | 'news' | 'general';
  className?: string;
  onVideoClick?: (video: Video) => void;
}

const ExploreVideoFeed: React.FC<ExploreVideoFeedProps> = ({
  type = 'general',
  className,
  onVideoClick,
}) => {
  const { currentUser } = useAuth();
  const { videos, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching, error } = useOptimizedVideoFeed({ 
    type,
    limit: 10
  });

  // State for user interactions
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userSaves, setUserSaves] = useState<string[]>([]);

  // Handle like action
  const handleLike = useCallback(async (videoId: string) => {
    if (!currentUser) return;
    
    try {
      const isLiked = userLikes[videoId];
      
      if (isLiked) {
        // Remove like
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
      } else {
        // Add like
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: currentUser.id });
      }
      
      // Update local state
      setUserLikes(prev => ({ ...prev, [videoId]: !isLiked }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [currentUser, userLikes]);

  // Handle save action
  const handleSave = useCallback(async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const isSaved = userSaves.includes(videoId);
      
      if (isSaved) {
        // Remove save
        await supabase
          .from('saved_posts')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
        
        setUserSaves(prev => prev.filter(id => id !== videoId));
      } else {
        // Add save
        await supabase
          .from('saved_posts')
          .insert({ video_id: videoId, user_id: currentUser.id });
        
        setUserSaves(prev => [...prev, videoId]);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  }, [currentUser, userSaves]);

  // Handle video click
  const handleVideoClick = useCallback((video: Video) => {
    onVideoClick?.(video);
  }, [onVideoClick]);

  // Variable size list configuration
  const [itemSizes, setItemSizes] = useState<Record<number, number>>({});
  const defaultItemSize = 400;

  const setSize = useCallback((index: number, size: number) => {
    setItemSizes(prev => ({ ...prev, [index]: size }));
  }, []);

  const getItemSize = useCallback((index: number) => {
    return itemSizes[index] || defaultItemSize;
  }, [itemSizes]);

  // Item data for react-window
  const itemData = useMemo(() => ({
    videos,
    currentUser,
    userLikes,
    userSaves,
    handleLike,
    handleSave,
    handleVideoClick,
    setSize,
  }), [videos, currentUser, userLikes, userSaves, handleLike, handleSave, handleVideoClick, setSize]);

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

  // Video item component for react-window
  const VideoItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const video = videos[index];
    
    if (!video) {
      return (
        <div style={style} className="flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded-md w-full h-full" />
        </div>
      );
    }

    // Transform video data to match VideoPost interface
    const videoWithProfiles = {
      ...video,
      profiles: video.creator ? {
        id: video.creator.id,
        full_name: video.creator.full_name,
        username: video.creator.username,
        avatar_url: video.creator.avatar_url,
      } : null,
    };

    return (
      <VideoPost
        video={videoWithProfiles}
        currentUser={currentUser}
        userLikes={userLikes}
        userSaves={userSaves}
        handleLike={handleLike}
        handleSave={handleSave}
        handleVideoClick={handleVideoClick}
        index={index}
        setSize={setSize}
        style={style}
      />
    );
  };

  // Handle loading state
  if (isFetching && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
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
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
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
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
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
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={3}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={ref}
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={getItemSize}
                itemData={itemData}
                onItemsRendered={onItemsRendered}
                overscanCount={2}
              >
                {VideoItem}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

export default ExploreVideoFeed;