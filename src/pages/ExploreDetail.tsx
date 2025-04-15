import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, X, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ShoppingCart } from 'lucide-react';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(true);
  }, [setShowRightSection]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowComments(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    queryKey: ['video', id],
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
        `).eq('id', id).single();
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
      const {
        data
      } = await supabase.auth.getUser();
      return data?.user || null;
    }
  });

  const { data: userLikeStatus } = useQuery({
    queryKey: ['video-like-status', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !id) return false;
      const {
        data
      } = await supabase.from('video_likes').select('id').eq('video_id', id).eq('user_id', currentUser.id).maybeSingle();
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

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black flex flex-col touch-manipulation">
      <div className="w-full h-screen relative flex items-center justify-center">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-dm-foreground dark:text-dm-text dark:border-dm-mist">
              <DropdownMenuItem className="dark:text-dm-text">
                Not interested
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 dark:text-red-400">
                Report
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-dm-mist" />
              <DropdownMenuItem className="dark:text-dm-text">
                Add to favorites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                toast({
                  title: "Link copied",
                  description: "Video link copied to clipboard"
                });
              }} className="dark:text-dm-text">
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="w-full h-full">
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
          />
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation ${
              userLikeStatus ? 'text-red-500' : ''
            }`}
          >
            <Heart className={`h-6 w-6 ${userLikeStatus ? 'fill-current' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation" 
            onClick={scrollToComments}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation" 
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
          
          {productLinks && productLinks.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/30 text-white h-12 w-12 touch-manipulation"
            >
              <ShoppingCart className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        <div className="absolute bottom-20 left-4 right-24 flex items-center z-20">
          <Avatar className="h-10 w-10 mr-2 border-2 border-white/30">
            {video.creator?.avatar_url ? (
              <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
            ) : (
              <AvatarFallback className="bg-black/50 text-white">
                {(video.creator?.username || '?')[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <span className="font-medium text-white text-shadow-sm">
              {video.creator?.username || 'Anonymous'}
            </span>
            <p className="text-white/80 text-sm mt-1 line-clamp-2 max-w-[250px]">
              {video.description}
            </p>
          </div>
        </div>
      </div>
      
      <div ref={commentsRef} className={`w-full bg-white dark:bg-dm-background px-4 ${showComments ? 'opacity-100' : 'opacity-0'} pt-4`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 dark:text-dm-text">Comments</h2>
          <Comments videoId={video.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ExploreDetail;
