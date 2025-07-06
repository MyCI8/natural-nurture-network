
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video, ProductLink } from '@/types/video';

export function useVideoPlayer(videoId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  // Get video and product links data
  const { data: videoData, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          creator: creator_id (
            id, 
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', videoId)
        .single();
      
      if (error) {throw error;}
      return data as Video;
    },
    enabled: !!videoId,
  });
  
  const { data: productLinks = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['videoProductLinks', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', videoId);
        
      if (error) {throw error;}
      return data as ProductLink[];
    },
    enabled: !!videoId,
  });
  
  useEffect(() => {
    setIsLoading(isVideoLoading || isLinksLoading);
  }, [isVideoLoading, isLinksLoading]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleControls = () => {
    setShowControls(!showControls);
  };

  return {
    video: videoData,
    productLinks,
    isLoading,
    error,
    isMuted,
    showControls,
    handleToggleMute,
    handleToggleControls
  };
}
