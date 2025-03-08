import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types/video';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<(Video & { creator: any }) | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  
  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        
        // Fetch user likes
        const { data: likes } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', data.user.id);
          
        if (likes) {
          const likesMap = likes.reduce((acc: Record<string, boolean>, like) => {
            acc[like.video_id] = true;
            return acc;
          }, {});
          setUserLikes(likesMap);
        }
      }
    };
    
    fetchUser();
  }, []);
  
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['explore-videos'],
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
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Video & { creator: any })[];
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ videoId, isLiked }: { videoId: string, isLiked: boolean }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        return { videoId, liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('video_likes')
          .insert([
            { video_id: videoId, user_id: currentUser.id }
          ]);
          
        if (error) throw error;
        return { videoId, liked: true };
      }
    },
    onSuccess: (data) => {
      // Update local state
      setUserLikes(prev => ({
        ...prev,
        [data.videoId]: data.liked
      }));
      
      // Invalidate video query to refresh like count
      queryClient.invalidateQueries({ queryKey: ['explore-videos'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like",
        variant: "destructive"
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ videoId, comment }: { videoId: string, comment: string }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const { error } = await supabase
        .from('video_comments')
        .insert([
          { video_id: videoId, user_id: currentUser.id, content: comment }
        ]);
        
      if (error) throw error;
      return { videoId, comment };
    },
    onSuccess: (data) => {
      setCommentText('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!"
      });
      
      // Navigate to detail page
      navigate(`/explore/${data.videoId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const handleShare = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title || 'Check out this video',
          text: video.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it with others!",
        });
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleLike = (videoId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos",
      });
      return;
    }
    
    likeMutation.mutate({ 
      videoId, 
      isLiked: userLikes[videoId] || false 
    });
  };

  const handleComment = (videoId: string) => {
    if (!commentText.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
      });
      return;
    }
    
    commentMutation.mutate({ videoId, comment: commentText });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="w-full max-w-[600px] mx-auto bg-white dark:bg-black">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="instagram-feed-item"
        >
          {/* Instagram-like header */}
          <div className="instagram-header">
            <Avatar className="h-8 w-8 border border-gray-200">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
              ) : (
                <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 text-left">
              <span className="instagram-username" onClick={() => navigate(`/users/${video.creator?.id}`)}>
                {video.creator?.username || 'Anonymous'}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-700">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Video player */}
          <div 
            className="w-full cursor-pointer bg-black"
            onClick={() => setSelectedVideo(video)}
          >
            <VideoPlayer 
              video={video} 
              autoPlay 
              showControls={false}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
            />
          </div>

          {/* Instagram-like actions */}
          <div className="instagram-actions justify-between">
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className={`p-0 hover:bg-transparent ${userLikes[video.id] ? 'text-red-500' : 'text-black dark:text-white'}`}
                onClick={() => handleLike(video.id)}
              >
                <Heart className={`h-6 w-6 ${userLikes[video.id] ? 'fill-current' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-0 hover:bg-transparent text-black dark:text-white"
                onClick={() => navigate(`/explore/${video.id}`)}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-0 hover:bg-transparent text-black dark:text-white"
                onClick={() => handleShare(video)}
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="p-0 hover:bg-transparent text-black dark:text-white"
            >
              <Bookmark className="h-6 w-6" />
            </Button>
          </div>

          {/* Instagram-like content */}
          <div className="instagram-likes">
            {video.likes_count || 0} likes
          </div>
          
          <div className="instagram-description">
            <span className="font-semibold mr-2">{video.creator?.username}</span>
            {video.description}
          </div>
          
          <div 
            className="instagram-view-comments"
            onClick={() => navigate(`/explore/${video.id}`)}
          >
            View all comments
          </div>
          
          {/* Comment input - Instagram style */}
          <div className="instagram-comment-input">
            <Input
              type="text"
              placeholder="Add a comment..."
              className="text-sm border-none focus-visible:ring-0 px-0 h-auto py-1"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleComment(video.id);
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className={`text-blue-500 font-semibold ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              disabled={!commentText.trim()}
              onClick={() => handleComment(video.id)}
            >
              Post
            </Button>
          </div>
        </div>
      ))}

      {/* Fullscreen video dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-none w-full h-full p-0 bg-black overflow-hidden">
          {selectedVideo && (
            <VideoPlayer 
              video={selectedVideo}
              autoPlay
              showControls={true}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
              isFullscreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Explore;
