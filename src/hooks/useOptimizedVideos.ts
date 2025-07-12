import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/video';

interface UseOptimizedVideosOptions {
  limit?: number;
  status?: 'published' | 'draft';
  creatorId?: string;
  videoType?: string;
}

export function useOptimizedVideos(options: UseOptimizedVideosOptions = {}) {
  const { limit = 20, status = 'published', creatorId, videoType } = options;

  const queryKey = useMemo(() => {
    const baseKey = creatorId 
      ? queryKeys.video(`creator-${creatorId}`)
      : queryKeys.videos;
    
    return [...baseKey, { limit, status, videoType }];
  }, [limit, status, creatorId, videoType]);

  const { data: videos = [], isLoading, error, refetch } = useOptimizedQuery<Video[]>(
    queryKey,
    async () => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles:creator_id(full_name, avatar_url)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }

      if (videoType) {
        query = query.eq('video_type', videoType);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  const videosWithOptimizedData = useMemo(() => {
    return videos.map(video => ({
      ...video,
      // Precompute expensive operations
      isYouTube: video.video_url?.includes('youtube.com') || video.video_url?.includes('youtu.be'),
      hasProductLinks: false, // Will be loaded separately if needed
    }));
  }, [videos]);

  return {
    videos: videosWithOptimizedData,
    isLoading,
    error,
    refetch,
    total: videos.length
  };
}