
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Swipeable } from '@/components/ui/swipeable';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(false);
  }, [setShowRightSection]);

  // When clicking on the comments, we should open the right section
  const handleCommentsClick = () => {
    setShowRightSection(true);
  };

  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', id],
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
        .eq('id', id)
        .single();
      if (error) throw error;

      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    }
  });

  const { data: userLikeStatus } = useQuery({
    queryKey: ['video-like-status', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !id) return false;
      const { data } = await supabase
        .from('video_likes')
        .select('id')
        .eq('video_id', id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!currentUser && !!id
  });

  const { data: productLinks = [] } = useQuery({
    queryKey: ['videoProductLinks', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', id);  
      if (error) {
        console.error("Error fetching product links:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!id
  });

  // Redirect back to explore page
  const handleClose = () => {
    navigate('/explore');
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

  // Handle swipe gestures
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'down') {
      handleClose();
    }
  };

  // Close on video click
  const handleVideoClick = () => {
    handleClose();
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <Swipeable 
      onSwipe={handleSwipe} 
      threshold={100} 
      className="min-h-screen bg-white dark:bg-dm-background flex flex-col touch-manipulation relative"
    >
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative py-2 px-2 md:py-4 md:px-4">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Video Content with min 10px padding and aspect ratio */}
        <div 
          className="w-full max-w-3xl bg-black rounded-lg overflow-hidden p-2.5 min-h-[200px] flex items-center justify-center"
        >
          <VideoPlayer 
            video={video} 
            productLinks={[]} // No product links overlay in detail view
            autoPlay={true} 
            showControls={false} 
            isFullscreen={false} 
            className="w-full rounded-md overflow-hidden" 
            objectFit="contain"
            useAspectRatio={true}
            onClick={handleVideoClick}
          />
        </div>
      </div>
      {/* No description or comments here; all in right panel */}
    </Swipeable>
  );
};

export default ExploreDetail;
