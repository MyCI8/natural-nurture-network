
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import { Swipeable } from '@/components/ui/swipeable';
import { useToast } from '@/hooks/use-toast';
import VideoControls from '@/components/video/explore/VideoControls';
import VideoProfileInfo from '@/components/video/explore/VideoProfileInfo';
import SwipeIndicators from '@/components/video/explore/SwipeIndicators';
import CommentSection from '@/components/video/explore/CommentSection';
import { useIsMobile } from '@/hooks/use-mobile';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection, setMobileHeaderVisible } = useLayout();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(id);
  const [controlsVisible, setControlsVisible] = useState(true);
  const isMobile = useIsMobile();
  
  // Hide mobile header when entering fullscreen mode (mobile only)
  useEffect(() => {
    if (isMobile) {
      setMobileHeaderVisible(false);
      
      return () => {
        setMobileHeaderVisible(true);
      };
    }
  }, [setMobileHeaderVisible, isMobile]);
  
  // Hide controls after 3 seconds of inactivity (mobile only)
  useEffect(() => {
    if (controlsVisible && isMobile) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [controlsVisible, isMobile]);

  // Show right section on desktop, hide on mobile
  useEffect(() => {
    setShowRightSection(!isMobile);
    
    // Clean up when leaving the page
    return () => setShowRightSection(false);
  }, [setShowRightSection, isMobile]);

  // Handle scroll and hide controls when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowComments(scrollPosition > 100);
      
      if (scrollPosition > 10 && isMobile) {
        setControlsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Update URL when currentVideoId changes
  useEffect(() => {
    if (currentVideoId && currentVideoId !== id) {
      window.history.replaceState(null, '', `/explore/${currentVideoId}`);
    }
  }, [currentVideoId, id]);

  const scrollToComments = () => {
    setShowComments(true);
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  // Fetch current video data
  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', currentVideoId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('videos').select(`
          *,
          related_article_id,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `).eq('id', currentVideoId).single();
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

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getUser();
      return data?.user || null;
    }
  });

  // Check if user liked the video
  const { data: userLikeStatus } = useQuery({
    queryKey: ['video-like-status', currentVideoId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !currentVideoId) return false;
      const {
        data
      } = await supabase.from('video_likes').select('id').eq('video_id', currentVideoId).eq('user_id', currentUser.id).maybeSingle();
      return !!data;
    },
    enabled: !!currentUser && !!currentVideoId
  });

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
  const { data: nextVideoLinks = [] } = useQuery({
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

  const handleClose = () => {
    navigate('/explore');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = async () => {
    if (!currentUser || !currentVideoId) return;
    
    try {
      if (userLikeStatus) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', currentVideoId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('video_likes')
          .insert([{ 
            video_id: currentVideoId, 
            user_id: currentUser.id 
          }]);
      }
      window.dispatchEvent(new CustomEvent('refetch-like-status'));
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  };

  const handleShare = async () => {
    if (!video) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title || 'Check out this video',
          text: video.description || '',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard"
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleShowProducts = () => {
    if (productLinks.length > 0) {
      window.dispatchEvent(new CustomEvent('show-product-link', { 
        detail: { linkId: productLinks[0].id } 
      }));
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    // Mobile-only swipe handling
    if (!isMobile) return;
    
    if (direction === 'up') {
      const nextId = getNextVideoId();
      if (nextId) {
        setCurrentVideoId(nextId);
      }
    } else if (direction === 'down') {
      const prevId = getPrevVideoId();
      if (prevId) {
        setCurrentVideoId(prevId);
      }
    }
  };

  const handleScreenTap = () => {
    // Only toggle controls visibility on mobile
    if (isMobile) {
      setControlsVisible(!controlsVisible);
    }
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black w-full h-full flex flex-col touch-manipulation fixed inset-0">
      <Swipeable 
        onSwipe={handleSwipe} 
        className="relative w-full h-full flex-1 touch-manipulation"
        threshold={60}
        disabled={!isMobile} // Disable swipe on desktop
      >
        <div 
          className="absolute inset-0 w-full h-full z-0"
          onClick={handleScreenTap}
        >
          <VideoPlayer 
            video={video} 
            productLinks={productLinks}
            autoPlay={true} 
            showControls={false}
            onClose={handleClose} 
            isFullscreen={true} 
            className="w-full h-full" 
            objectFit="contain" 
            useAspectRatio={false}
            globalAudioEnabled={!isMuted}
            onAudioStateChange={(muted) => setIsMuted(muted)}
          />
        </div>
        
        {isMobile && (
          <>
            <VideoControls
              controlsVisible={controlsVisible}
              handleClose={handleClose}
              handleLike={handleLike}
              scrollToComments={scrollToComments}
              handleShare={handleShare}
              handleShowProducts={handleShowProducts}
              handleToggleMute={handleToggleMute}
              productLinks={productLinks}
              isMuted={isMuted}
              userLikeStatus={userLikeStatus}
            />
            
            <VideoProfileInfo 
              video={video} 
              controlsVisible={controlsVisible} 
            />
            
            <SwipeIndicators
              controlsVisible={controlsVisible}
              hasNextVideo={!!getNextVideoId()}
              hasPrevVideo={!!getPrevVideoId()}
            />
          </>
        )}
      </Swipeable>
      
      {isMobile && (
        <CommentSection
          showComments={showComments}
          setShowComments={setShowComments}
          videoId={video.id}
          currentUser={currentUser}
          commentsRef={commentsRef}
        />
      )}
    </div>
  );
};

export default ExploreDetail;
