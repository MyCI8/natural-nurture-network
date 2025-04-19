
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
    // Show right section for comments when in detail view
    setShowRightSection(true);
    return () => setShowRightSection(false);
  }, [setShowRightSection]);

  const handleCommentsClick = () => {
    // On desktop, just ensure right section is visible
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

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'down') {
      handleClose();
    }
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <Swipeable onSwipe={handleSwipe} threshold={100} className="min-h-screen bg-white dark:bg-dm-background flex flex-col touch-manipulation">
      <div className="w-full h-full relative flex items-center justify-center p-4">
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
        
        <div className="w-full max-w-3xl bg-black rounded-lg overflow-hidden p-2.5">
          <VideoPlayer 
            video={video} 
            productLinks={[]} // No product links directly on video in detail view
            autoPlay={true} 
            showControls={false} 
            onClose={handleClose} 
            isFullscreen={false} 
            className="w-full rounded-md overflow-hidden" 
            objectFit="contain" 
            useAspectRatio={true} 
          />
        </div>
      </div>
      
      <div className="w-full absolute right-0 bottom-20 md:bottom-10 px-4 z-10 flex flex-col items-end">
        <div className="flex flex-col space-y-4 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 touch-manipulation ${userLikeStatus ? 'text-red-500' : 'text-white'}`}
          >
            <Heart className={`h-6 w-6 ${userLikeStatus ? 'fill-current' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white touch-manipulation" 
            onClick={handleCommentsClick}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white touch-manipulation" 
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Swipeable>
  );
};

export default ExploreDetail;
