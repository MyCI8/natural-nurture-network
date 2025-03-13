import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import Comments from '@/components/video/Comments';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, X, Send, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showShare, setShowShare] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        
        if (id) {
          const { data: like } = await supabase
            .from('video_likes')
            .select('id')
            .eq('video_id', id)
            .eq('user_id', data.user.id)
            .single();
            
          setIsLiked(!!like);
        }
      }
    };
    
    fetchUser();
  }, [id]);

  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
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
      return data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      
      if (isLiked) {
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', id)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        return { liked: false };
      } else {
        const { error } = await supabase
          .from('video_likes')
          .insert([
            { video_id: id, user_id: currentUser.id }
          ]);
          
        if (error) throw error;
        return { liked: true };
      }
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like",
        variant: "destructive"
      });
    }
  });

  const handleShare = async () => {
    if (!video) return;
    
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShare(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShare(false);
      toast({
        title: "Success",
        description: "Link copied to clipboard!"
      });
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleLike = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos",
      });
      return;
    }
    
    likeMutation.mutate();
  };

  const handleClose = () => {
    navigate('/explore');
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <div className="md:flex-1">
          <div className="comments-view-container w-full p-4">
            <div className="instagram-dialog-video">
              <VideoPlayer 
                video={video} 
                autoPlay={false} 
                showControls 
                onClose={handleClose}
              />
            </div>
          </div>
        </div>

        <div className="md:w-[350px] border-l border-gray-200 dark:border-gray-800">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-8 w-8">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
                ) : (
                  <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium">{video.creator?.username || 'Anonymous'}</span>
            </div>

            <div className="text-left mb-2">
              <p className="text-sm">{video.description}</p>
            </div>

            <div className="text-left mb-2 text-sm text-[#666666]">
              <p>{video.likes_count || 0} likes</p>
            </div>

            <div className="flex items-center space-x-4 mb-2 border-t pt-2">
              <Button 
                variant="ghost" 
                size="icon"
                className={`transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-[#4CAF50]'}`}
                aria-label={isLiked ? "Unlike video" : "Like video"}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:text-[#4CAF50] transition-colors"
                aria-label="Comment on video"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:text-[#4CAF50] transition-colors"
                aria-label="Share video"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:text-[#4CAF50] transition-colors"
                aria-label="Save video"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-1">
              {id && <Comments videoId={id} currentUser={currentUser} />}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="sm:max-w-md">
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Share this video</h2>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              Copy link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreDetail;
