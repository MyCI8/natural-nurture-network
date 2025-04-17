
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export function useVideoData(videoId: string | undefined) {
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(videoId);
  
  // Update URL when currentVideoId changes
  useEffect(() => {
    if (currentVideoId && currentVideoId !== videoId) {
      window.history.replaceState(null, '', `/explore/${currentVideoId}`);
    }
  }, [currentVideoId, videoId]);

  // Fetch current video data
  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', currentVideoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          related_article_id,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('id', currentVideoId)
        .single();
        
      if (error) throw error;

      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    },
    enabled: !!currentVideoId
  });

  // Fetch adjacent videos for swipe navigation
  const { data: adjacentVideos = [] } = useQuery({
    queryKey: ['adjacent-videos', currentVideoId],
    queryFn: async () => {
      if (!currentVideoId) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id, 
          created_at,
          status
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentVideoId
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    }
  });

  // Check if user liked the video
  const { data: userLikeStatus } = useQuery({
    queryKey: ['video-like-status', currentVideoId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !currentVideoId) return false;
      const { data } = await supabase
        .from('video_likes')
        .select('id')
        .eq('video_id', currentVideoId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!currentUser && !!currentVideoId
  });

  // Navigation helper functions
  const getCurrentIndex = () => {
    if (!currentVideoId || adjacentVideos.length === 0) return -1;
    return adjacentVideos.findIndex(v => v.id === currentVideoId);
  };

  const getPrevVideoId = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      return adjacentVideos[currentIndex - 1].id;
    }
    return null;
  };

  const getNextVideoId = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex >= 0 && currentIndex < adjacentVideos.length - 1) {
      return adjacentVideos[currentIndex + 1].id;
    }
    return null;
  };

  return {
    video,
    isVideoLoading,
    currentUser,
    userLikeStatus,
    currentVideoId,
    setCurrentVideoId,
    adjacentVideos,
    getPrevVideoId,
    getNextVideoId,
    hasNextVideo: !!getNextVideoId(),
    hasPrevVideo: !!getPrevVideoId()
  };
}
