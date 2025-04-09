
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  
  // Always show right section when on the explore detail page
  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(true); // Keep it visible on unmount too
  }, [setShowRightSection]);

  // Handle scroll to show/hide comments based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show comments when scrolled down a bit
      setShowComments(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to comments when clicking comment button
  const scrollToComments = () => {
    setShowComments(true);
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
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
      
      // Ensure related_article_id is included
      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    },
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
    enabled: !!currentUser && !!id,
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

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col touch-manipulation">
      {/* Video section - always visible */}
      <div className="w-full h-screen max-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center">
          <VideoPlayer 
            video={video} 
            autoPlay={true} 
            showControls 
            onClose={handleClose}
            isFullscreen={false}
            className="w-full h-full max-h-[80vh]"
            objectFit="contain"
            useAspectRatio={false}
          />
        </div>
        
        {/* Video interaction buttons that float on video */}
        <div className="absolute bottom-8 right-6 flex flex-col space-y-4 z-10">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60 touch-manipulation"
            onClick={scrollToComments}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60 touch-manipulation"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 touch-manipulation ${
              userLikeStatus ? 'text-red-500' : 'text-white'
            }`}
          >
            <Heart className={`h-6 w-6 ${userLikeStatus ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Comments section - visible when scrolled */}
      <div 
        ref={commentsRef}
        className={`w-full bg-white dark:bg-dm-background transition-opacity duration-300 px-4 sm:px-6 lg:px-8 ${
          showComments ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Video info */}
        <div className="max-w-3xl mx-auto pt-8 pb-4">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
              ) : (
                <AvatarFallback className="dark:bg-dm-mist dark:text-dm-text">
                  {(video.creator?.username || '?')[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold dark:text-dm-text">{video.creator?.username || 'Anonymous'}</p>
              <p className="text-sm text-gray-500 dark:text-dm-text-supporting">
                {new Date(video.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <h1 className="text-xl font-bold mb-2 dark:text-dm-text">{video.title}</h1>
          <p className="text-gray-700 dark:text-dm-text-supporting mb-6">{video.description}</p>
          
          <div className="border-t border-gray-200 dark:border-dm-mist pt-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-dm-text">Comments</h2>
            <Comments videoId={video.id} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreDetail;
