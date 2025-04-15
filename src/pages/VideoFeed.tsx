
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video } from '@/types/video';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Swipeable } from '@/components/ui/swipeable';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:creator_id (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Video & { profiles: { id: string; full_name: string; avatar_url: string | null; username: string | null } })[];
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: userLikes } = useQuery({
    queryKey: ['userLikes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(like => like.video_id);
    },
    enabled: !!currentUser,
  });

  const { data: userSaves } = useQuery({
    queryKey: ['userSaves', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(save => save.video_id);
    },
    enabled: !!currentUser,
  });

  const { data: productLinks = [] } = useQuery({
    queryKey: ['allProductLinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const getProductLinksForVideo = (videoId: string) => {
    return productLinks.filter(link => link.video_id === videoId);
  };

  useEffect(() => {
    // Set up intersection observer for videos to auto-play the visible one
    if (videos && videos.length > 0) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const videoId = entry.target.getAttribute('data-video-id');
            const index = videos.findIndex(v => v.id === videoId);
            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        });
      }, { threshold: 0.8 });
      
      // Clean up on unmount
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [videos]);

  useEffect(() => {
    // Apply observer to video elements
    const videoElements = document.querySelectorAll('.video-container');
    
    if (observerRef.current && videoElements.length > 0) {
      videoElements.forEach(el => {
        observerRef.current?.observe(el);
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, isLoading]);

  // Function to handle video swipe navigation
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!videos || videos.length === 0) return;
    
    if (direction === 'up' && currentIndex < videos.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      
      // Scroll to the next video
      const nextVideoElement = document.querySelector(`[data-video-id="${videos[currentIndex + 1].id}"]`);
      if (nextVideoElement) {
        nextVideoElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      
      // Scroll to the previous video
      const prevVideoElement = document.querySelector(`[data-video-id="${videos[currentIndex - 1].id}"]`);
      if (prevVideoElement) {
        prevVideoElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLike = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isLiked = userLikes?.includes(videoId);
    try {
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('video_likes')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userLikes', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isSaved = userSaves?.includes(videoId);
    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('saved_posts')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userSaves', currentUser.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoClick = (video: Video) => {
    setIsFullscreen(true);
  };

  const handleBackClick = () => {
    setIsFullscreen(false);
  };

  const handleShare = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videos?.find(v => v.id === videoId);
    if (!video) return;
    
    const shareUrl = `${window.location.origin}/explore/${videoId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title || 'Check out this video',
          text: video.description || '',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard!"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCommentClick = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/explore/${videoId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <p className="text-[#666666]">Loading videos...</p>
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

  return (
    <div className="min-h-screen bg-background pt-16 overflow-y-auto" ref={videoContainerRef}>
      <Swipeable 
        onSwipe={handleSwipe} 
        className="h-full w-full touch-manipulation"
        enableZoom={false}
      >
        <div className="w-full">
          {!videos?.length ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-[#666666] mb-4">No videos available</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <div 
                key={video.id} 
                className={`video-container w-full relative ${
                  isFullscreen ? 'h-screen fixed inset-0 z-50 bg-black' : 'h-[calc(100vh-4rem)]'
                }`}
                data-video-id={video.id}
                onClick={() => handleVideoClick(video)}
              >
                <VideoPlayer
                  video={video}
                  autoPlay={index === currentIndex}
                  showControls={false}
                  globalAudioEnabled={globalAudioEnabled}
                  onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
                  isFullscreen={isFullscreen}
                  className="w-full h-full object-cover"
                  productLinks={getProductLinksForVideo(video.id)}
                />
                
                {/* Overlay UI for controls */}
                <div className="absolute inset-0 z-10 pointer-events-none" onClick={e => e.stopPropagation()}>
                  {/* Top bar with back button and more menu */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
                    {isFullscreen && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleBackClick}
                        className="text-white hover:bg-white/20 h-10 w-10 rounded-full touch-manipulation"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="ml-auto">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white hover:bg-white/20 h-10 w-10 rounded-full touch-manipulation"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Not interested
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Add to favorites
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Side action buttons */}
                  <div className="absolute right-4 bottom-20 flex flex-col space-y-4 pointer-events-auto">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation ${
                        userLikes?.includes(video.id) ? 'text-red-500' : ''
                      }`}
                      onClick={(e) => handleLike(video.id, e)}
                    >
                      <Heart className={`h-6 w-6 ${userLikes?.includes(video.id) ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation"
                      onClick={(e) => handleCommentClick(video.id, e)}
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation ${
                        userSaves?.includes(video.id) ? 'text-[#4CAF50]' : ''
                      }`}
                      onClick={(e) => handleSave(video.id, e)}
                    >
                      <Bookmark 
                        className="h-6 w-6" 
                        fill={userSaves?.includes(video.id) ? "currentColor" : "none"}
                      />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation"
                      onClick={(e) => handleShare(video.id, e)}
                    >
                      <Share2 className="h-6 w-6" />
                    </Button>
                    
                    {getProductLinksForVideo(video.id).length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/explore/${video.id}`);
                        }}
                      >
                        <ShoppingCart className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                  
                  {/* User info at bottom */}
                  <div className="absolute bottom-4 left-4 right-16 flex items-center pointer-events-auto">
                    <Avatar 
                      className="h-10 w-10 border-2 border-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (video.profiles?.id) {
                          navigate(`/users/${video.profiles.id}`);
                        }
                      }}
                    >
                      {video.profiles?.avatar_url ? (
                        <AvatarImage src={video.profiles.avatar_url} alt={video.profiles?.full_name || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                          {video.profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3 text-white">
                      <p className="font-semibold text-sm drop-shadow-md">
                        {video.profiles?.username || video.profiles?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-white/80 drop-shadow-md line-clamp-2 mt-1 max-w-[250px]">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Swipeable>
    </div>
  );
};

export default VideoFeed;
