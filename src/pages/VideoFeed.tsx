
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileVideoFeed from '@/components/video/MobileVideoFeed';
import { Button } from '@/components/ui/button';
import VideoDialog from '@/components/video/VideoDialog';
import { Video } from '@/types/video';
import { useInfiniteVideos } from '@/hooks/useInfiniteVideos';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import VideoPost from '@/components/video/VideoPost';
import { useAuth } from '@/hooks/useAuth';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const { currentUser } = useAuth();
  
  const handleAudioStateChange = (isMuted: boolean) => {
    setGlobalAudioEnabled(!isMuted);
  };

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteVideos();

  const videos = data?.pages.flatMap(page => page) ?? [];

  const { data: userLikesArray } = useQuery({
    queryKey: ['userLikes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(like => like.video_id);
    },
    enabled: !!currentUser,
  });
  
  const userLikes: Record<string, boolean> = {};
  userLikesArray?.forEach(videoId => {
    userLikes[videoId] = true;
  });

  const { data: userSaves } = useQuery({
    queryKey: ['userSaves', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(save => save.video_id);
    },
    enabled: !!currentUser,
  });

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  const handleLike = async (videoId: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isLiked = userLikes?.[videoId];
    try {
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('video_likes')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userLikes', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isSaved = userSaves?.includes(videoId);
    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('saved_posts')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userSaves', currentUser.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const listRef = useRef<List | null>(null);
  const sizeMap = useRef<Record<number, number>>({});

  const setSize = useCallback((index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current = { ...sizeMap.current, [index]: size + 16 }; // +16 for padding
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  const getSize = (index: number) => sizeMap.current[index] || 750; // default/estimated size

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <p className="text-[#666666]">Loading videos...</p>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load videos. Please try again.",
      variant: "destructive",
    });
    return null;
  }

  if (isMobile) {
    return (
      <MobileVideoFeed
        videos={videos || []}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={handleAudioStateChange}
        loadMoreItems={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
      />
    );
  }

  const itemCount = hasNextPage ? videos.length + 1 : videos.length;
  const loadMoreItems = isFetchingNextPage ? () => {} : fetchNextPage;
  const isItemLoaded = (index: number) => !hasNextPage || index < videos.length;

  return (
    <div className="min-h-screen bg-background pt-16 h-screen overflow-hidden">
      <main className="mx-auto h-full max-w-[600px]">
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref: infiniteLoaderRef }) => (
                <List
                  ref={(el) => {
                    infiniteLoaderRef(el);
                    listRef.current = el;
                  }}
                  height={height}
                  width={width}
                  itemCount={itemCount}
                  itemSize={getSize}
                  onItemsRendered={onItemsRendered}
                >
                  {({ index, style }) => {
                    if (!isItemLoaded(index)) {
                      return <div style={style} className="flex items-center justify-center"><p>Loading...</p></div>;
                    }
                    const video = videos[index];
                    return (
                      <VideoPost
                        style={style}
                        video={video}
                        currentUser={currentUser}
                        userLikes={userLikes}
                        userSaves={userSaves || []}
                        handleLike={handleLike}
                        handleSave={handleSave}
                        handleVideoClick={handleVideoClick}
                        index={index}
                        setSize={setSize}
                      />
                    );
                  }}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </main>

      <VideoDialog
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default VideoFeed;
