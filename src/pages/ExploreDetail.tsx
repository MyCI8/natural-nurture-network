import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, X, MoreHorizontal, Volume2, VolumeX, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Swipeable } from '@/components/ui/swipeable';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(id);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  useEffect(() => {
    if (controlsVisible) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [controlsVisible]);

  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(true);
  }, [setShowRightSection]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowComments(scrollPosition > 100);
      
      if (scrollPosition > 10) {
        setControlsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getUser();
      return data?.user || null;
    }
  });

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
    setControlsVisible(!controlsVisible);
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
        
        <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 touch-manipulation"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        <div className={`absolute bottom-24 right-3 flex flex-col items-center space-y-5 z-20 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90`}
            onClick={handleLike}
          >
            <Heart className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
            onClick={scrollToComments}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
          
          {productLinks.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
              onClick={handleShowProducts}
            >
              <ShoppingCart className="h-6 w-6" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
            onClick={handleToggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center">
            <Avatar className="h-10 w-10 border-2 border-white/30 mr-3">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
              ) : (
                <AvatarFallback className="bg-black/50 text-white">
                  {(video.creator?.username || '?')[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-white text-shadow-sm">
                {video.creator?.username || 'Anonymous'}
              </span>
              <p className="text-sm text-white/80 line-clamp-2 max-w-[70vw]">
                {video.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`absolute top-1/2 left-3 transform -translate-y-1/2 z-10 opacity-70 transition-opacity duration-300 ${controlsVisible ? 'opacity-70' : 'opacity-0'}`}>
          {getPrevVideoId() && (
            <div className="bg-white/20 w-1 h-12 rounded-full mb-1"></div>
          )}
        </div>
        <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 opacity-70 transition-opacity duration-300 ${controlsVisible ? 'opacity-70' : 'opacity-0'}`}>
          {getNextVideoId() && (
            <div className="text-white/50 text-xs animate-bounce">
              Swipe up for next video
            </div>
          )}
        </div>
      </Swipeable>
      
      <div 
        ref={commentsRef} 
        className={`w-full bg-white dark:bg-dm-background px-4 ${showComments ? 'absolute inset-0 z-30' : 'hidden'} pt-4`}
      >
        <div className="max-w-3xl mx-auto relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowComments(false)} 
            className="absolute top-0 right-0 z-10 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold mb-4 dark:text-dm-text">Comments</h2>
          <Comments videoId={video.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ExploreDetail;
