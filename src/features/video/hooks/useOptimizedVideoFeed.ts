import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/video';

interface VideoFeedParams {
  limit?: number;
  type?: 'explore' | 'news' | 'general';
  status?: 'published' | 'draft';
}

interface VideoFeedResult {
  videos: Video[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  refetch: () => void;
}

const VIDEOS_PER_PAGE = 10;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

const fetchVideos = async ({ 
  pageParam = 0, 
  queryKey 
}: { 
  pageParam?: number; 
  queryKey: readonly [string, VideoFeedParams]; 
}) => {
  const [, params] = queryKey;
  const { limit = VIDEOS_PER_PAGE, type = 'general', status = 'published' } = params;
  
  const from = pageParam * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('videos')
    .select(`
      id,
      title,
      description,
      video_url,
      thumbnail_url,
      creator_id,
      status,
      views_count,
      likes_count,
      created_at,
      updated_at,
      video_type,
      related_article_id,
      show_in_latest,
      profiles:creator_id (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, to);

  // Add type filter with proper mapping
  if (type === 'explore') {
    // Explore page shows 'general' videos
    query = query.eq('video_type', 'general');
  } else if (type === 'news') {
    query = query.eq('video_type', 'news');
  }
  // For 'general' type, show all videos (no filter)

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

  // Transform data to match Video interface
  return (data || []).map(video => ({
    ...video,
    creator: video.profiles ? {
      id: video.profiles.id,
      username: video.profiles.username,
      full_name: video.profiles.full_name,
      avatar_url: video.profiles.avatar_url,
    } : undefined,
    // Map general type to explore for UI display
    displayVideoType: video.video_type === 'general' ? 'explore' : video.video_type,
  })) as Video[];
};

export const useOptimizedVideoFeed = (params: VideoFeedParams = {}): VideoFeedResult => {
  const queryKey = ['optimizedVideoFeed', params] as const;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchVideos,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the limit, there are no more pages
      if (lastPage.length < (params.limit || VIDEOS_PER_PAGE)) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // Updated from cacheTime
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 4xx errors
      if (failureCount < 3) {
        // @ts-ignore - error might not have status property
        const status = error?.status || error?.code;
        return !status || status >= 500;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Memoized flattened videos array
  const videos = useMemo(() => {
    return data?.pages.flatMap(page => page) ?? [];
  }, [data?.pages]);

  // Optimized fetchNextPage with debouncing prevention
  const optimizedFetchNextPage = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    videos,
    hasNextPage: !!hasNextPage,
    fetchNextPage: optimizedFetchNextPage,
    isFetching,
    isFetchingNextPage,
    error: error as Error | null,
    refetch,
  };
};

// Hook for prefetching next page
export const usePrefetchVideoFeed = (params: VideoFeedParams = {}) => {
  const queryKey = ['optimizedVideoFeed', params] as const;
  
  return useCallback(() => {
    // This can be called to prefetch the next page when user is near the end
    // Implementation would use queryClient.prefetchInfiniteQuery
  }, [queryKey]);
};

export default useOptimizedVideoFeed;