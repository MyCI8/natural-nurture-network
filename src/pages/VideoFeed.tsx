
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { useToast } from '@/components/ui/use-toast';

const VideoFeed = () => {
  const { toast } = useToast();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Fetch videos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    }
  });

  // Fetch product links for current video
  const { data: productLinks } = useQuery({
    queryKey: ['productLinks', videos?.[currentVideoIndex]?.id],
    queryFn: async () => {
      if (!videos?.[currentVideoIndex]?.id) return [];
      
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', videos[currentVideoIndex].id);

      if (error) throw error;
      return data as ProductLink[];
    },
    enabled: !!videos?.[currentVideoIndex]?.id
  });

  // Handle swipe gestures
  useEffect(() => {
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;

      // Minimum swipe distance (in pixels)
      if (Math.abs(deltaY) > 50) {
        if (deltaY < 0 && currentVideoIndex < (videos?.length || 0) - 1) {
          // Swipe up - next video
          setCurrentVideoIndex(prev => prev + 1);
        } else if (deltaY > 0 && currentVideoIndex > 0) {
          // Swipe down - previous video
          setCurrentVideoIndex(prev => prev - 1);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentVideoIndex, videos?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading videos...</p>
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

  if (!videos?.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No videos available</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black">
      <VideoPlayer
        video={videos[currentVideoIndex]}
        productLinks={productLinks}
        autoPlay={true}
      />
    </div>
  );
};

export default VideoFeed;
