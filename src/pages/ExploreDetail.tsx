import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFullscreenFeed } from '@/hooks/useFullscreenFeed';
import { useIsMobile } from '@/hooks/use-mobile';
import FullscreenVideoFeed from '@/components/video/FullscreenVideoFeed';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [swipingInProgress, setSwipingInProgress] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down' | null>(null);
  const { setLayoutMode, setShowRightSection } = useLayout();

  const {
    currentVideo,
    handleSwipe,
    isFirst,
    isLast,
    videos,
    currentIndex
  } = useFullscreenFeed(id || '');

  useEffect(() => {
    if (isMobile) {
      setLayoutMode('full');
      setShowRightSection(false);
    }
    
    return () => {
      setLayoutMode('default');
      setShowRightSection(false);
    };
  }, [isMobile, setLayoutMode, setShowRightSection]);

  const handleClose = () => {
    navigate('/explore');
  };

  const handleVideoSwipe = (direction: 'up' | 'down') => {
    if (swipingInProgress) return;
    
    setSwipingInProgress(true);
    setTransitionDirection(direction);
    
    handleSwipe(direction);
    
    setTimeout(() => {
      if (videos && videos.length > 0) {
        let newIndex = currentIndex;
        
        if (direction === 'up' && currentIndex < videos.length - 1) {
          newIndex = currentIndex + 1;
        } else if (direction === 'down' && currentIndex > 0) {
          newIndex = currentIndex - 1;
        }
        
        const nextVideo = videos[newIndex];
        if (nextVideo && nextVideo.id !== id) {
          navigate(`/explore/${nextVideo.id}`, { replace: true });
        }
      }
      setSwipingInProgress(false);
      setTransitionDirection(null);
    }, 300);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentVideo?.title || 'Check out this video',
          text: currentVideo?.description || '',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard"
        });
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleLike = async () => {
    if (!currentVideo) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos"
      });
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos"
      });
      return;
    }

    const userId = user.user.id;
    const videoId = currentVideo.id;

    queryClient.setQueryData(['explore-videos'], (old: any) => {
      if (!old) return old;

      const updatedVideos = old.map((video: any) => {
        if (video.id === videoId) {
          const isLiked = video.likes_count && video.likes_count > 0;
          return {
            ...video,
            likes_count: isLiked ? video.likes_count - 1 : video.likes_count + 1,
          };
        }
        return video;
      });
      return updatedVideos;
    });

    try {
      const { data: existingLike } = await supabase
        .from('video_likes')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .single();

      if (existingLike) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', userId)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('video_likes')
          .insert([{ user_id: userId, video_id: videoId }]);
      }

      queryClient.invalidateQueries({ queryKey: ['explore-videos'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comment feature coming soon"
    });
  };

  const handleProductClick = () => {
    toast({
      title: "Products",
      description: "Product details coming soon"
    });
  };

  useEffect(() => {
    console.log(`Current video index: ${currentIndex}, total videos: ${videos?.length || 0}`);
  }, [currentIndex, videos]);

  const getTransitionClasses = () => {
    if (!swipingInProgress || !transitionDirection) return '';
    
    return transitionDirection === 'up' 
      ? 'animate-slide-up' 
      : 'animate-slide-down';
  };

  if (!currentVideo) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-white dark:bg-dm-background flex flex-col items-center justify-center relative py-2 px-2 md:py-4 md:px-4">
        <div className="w-full max-w-3xl bg-black rounded-lg overflow-hidden p-2.5 min-h-[200px] flex items-center justify-center">
          <VideoPlayer
            video={currentVideo}
            autoPlay={true}
            showControls={true}
            className="w-full h-full"
            productLinks={[]}
            objectFit="contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${getTransitionClasses()}`}>
      <FullscreenVideoFeed
        video={currentVideo}
        onClose={handleClose}
        onSwipe={handleVideoSwipe}
        productLinks={[]}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onProductClick={handleProductClick}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
};

export default ExploreDetail;
