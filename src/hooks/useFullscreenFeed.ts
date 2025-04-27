
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';

export function useFullscreenFeed(initialVideoId: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const preloadingRef = useRef<boolean>(false);
  
  // Fetch all videos
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
    if (!videos || videos.length === 0) return;
    
    const index = videos.findIndex((v: Video) => v.id === initialVideoId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [initialVideoId, videos]);

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (!videos || videos.length === 0) return;
    
    console.log(`Swiping ${direction}, currentIndex: ${currentIndex}, total videos: ${videos.length}`);
    
    if (direction === 'up' && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, videos]);

  // Preload next videos
  useEffect(() => {
    if (!isMobile || !videos || videos.length === 0 || preloadingRef.current) return;
    
    preloadingRef.current = true;
    
    const preloadCount = 3; // Number of videos to preload in each direction
    const videosToPreload = [];
    
    // Add next videos to preload
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < videos.length) {
        videosToPreload.push(videos[nextIndex]);
      }
    }
    
    // Add previous videos to preload
    for (let i = 1; i <= preloadCount; i++) {
      const prevIndex = currentIndex - i;
      if (prevIndex >= 0) {
        videosToPreload.push(videos[prevIndex]);
      }
    }

    videosToPreload.forEach((video: Video) => {
      if (video.video_url) {
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        videoEl.src = video.video_url;
        videoEl.load();
        
        // Create a link element for preloading
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = video.video_url;
        document.head.appendChild(link);
        
        // Remove link after 10 seconds
        setTimeout(() => {
          document.head.removeChild(link);
        }, 10000);
      }
    });

    preloadingRef.current = false;
  }, [currentIndex, videos, isMobile]);

  return {
    currentVideo: videos && videos.length > 0 ? videos[currentIndex] : null,
    nextVideo: videos && videos.length > 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null,
    prevVideo: videos && videos.length > 0 && currentIndex > 0 ? videos[currentIndex - 1] : null,
    handleSwipe,
    isFirst: currentIndex === 0,
    isLast: videos && videos.length > 0 ? currentIndex === videos.length - 1 : true,
    videos,
    currentIndex
  };
}
