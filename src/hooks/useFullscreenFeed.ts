
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';

export function useFullscreenFeed(initialVideoId: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  
  const { data: videos = [] } = useQuery({
    queryKey: ['explore-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          ),
          comments:video_comments(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  // Find initial index based on the video ID
  useEffect(() => {
    const index = videos.findIndex((v: Video) => v.id === initialVideoId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [initialVideoId, videos]);

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, videos.length]);

  // Preload next videos
  useEffect(() => {
    if (!isMobile) return;

    const preloadCount = 2; // Number of videos to preload
    const videosToPreload = videos.slice(
      currentIndex + 1,
      currentIndex + 1 + preloadCount
    );

    videosToPreload.forEach((video: Video) => {
      if (video.video_url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = video.video_url;
        document.head.appendChild(link);
      }
    });

    return () => {
      // Clean up preload links when component unmounts
      const links = document.head.querySelectorAll('link[rel="preload"][as="video"]');
      links.forEach(link => link.remove());
    };
  }, [currentIndex, videos, isMobile]);

  return {
    currentVideo: videos[currentIndex],
    nextVideo: videos[currentIndex + 1],
    prevVideo: videos[currentIndex - 1],
    handleSwipe,
    isFirst: currentIndex === 0,
    isLast: currentIndex === videos.length - 1,
    videos
  };
}
