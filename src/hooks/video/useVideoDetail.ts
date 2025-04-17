
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVideoData } from './useVideoData';
import { useVideoInteractions } from './useVideoInteractions';
import { useMobileVideoControls } from './useMobileVideoControls';

export function useVideoDetail(videoId: string | undefined) {
  const {
    video,
    isVideoLoading,
    currentUser,
    userLikeStatus,
    currentVideoId,
    setCurrentVideoId,
    getPrevVideoId,
    getNextVideoId,
    hasNextVideo,
    hasPrevVideo
  } = useVideoData(videoId);
  
  // Fetch product links for the video
  const { data: productLinks = [] } = useQuery({
    queryKey: ['videoProductLinks', currentVideoId],
    queryFn: async () => {
      if (!currentVideoId) return [];
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', currentVideoId);
        
      if (error) {
        console.error("Error fetching product links:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!currentVideoId
  });

  // Prefetch next video's product links
  useQuery({
    queryKey: ['nextVideoProductLinks', getNextVideoId()],
    queryFn: async () => {
      const nextId = getNextVideoId();
      if (!nextId) return [];
      
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', nextId);
        
      if (error) return [];
      return data || [];
    },
    enabled: !!getNextVideoId()
  });

  const {
    isMuted,
    setIsMuted,
    handleClose,
    handleToggleMute,
    handleLike,
    handleShare,
    handleShowProducts
  } = useVideoInteractions(currentVideoId, currentUser, productLinks);

  const {
    isMobile,
    showComments,
    setShowComments,
    controlsVisible,
    setControlsVisible,
    isHovering,
    setIsHovering,
    handleSwipe: baseHandleSwipe,
    handleScreenTap
  } = useMobileVideoControls();
  
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    baseHandleSwipe(direction, 
      // Next video function
      () => {
        const nextId = getNextVideoId();
        if (nextId) setCurrentVideoId(nextId);
      },
      // Previous video function
      () => {
        const prevId = getPrevVideoId();
        if (prevId) setCurrentVideoId(prevId);
      }
    );
  };

  return {
    // State
    video,
    isVideoLoading,
    productLinks,
    currentUser,
    userLikeStatus,
    isMuted,
    isHovering,
    setIsHovering,
    controlsVisible,
    setControlsVisible,
    showComments,
    setShowComments,
    currentVideoId,
    
    // Navigation
    handleClose,
    handleToggleMute,
    handleLike,
    handleShare,
    handleShowProducts,
    handleSwipe,
    handleScreenTap,
    
    // Navigation helpers
    getPrevVideoId,
    getNextVideoId,
    hasNextVideo,
    hasPrevVideo,
    
    // Device info
    isMobile
  };
}
