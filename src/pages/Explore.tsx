
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types/video';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
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
    <div className="w-full max-w-full mx-auto bg-white dark:bg-gray-900">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="border-b border-gray-200 dark:border-gray-800 mb-6"
        >
          <div className="max-w-2xl mx-auto px-4">
            <div 
              className="flex items-center space-x-2 py-3"
              onClick={() => navigate(`/users/${video.creator?.id}`)}
              role="button"
              aria-label={`View ${video.creator?.username}'s profile`}
            >
              <Avatar className="h-8 w-8">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
                ) : (
                  <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium hover:text-[#4CAF50] transition-colors">
                {video.creator?.username || 'Anonymous'}
              </span>
            </div>
          </div>

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

          <div className="max-w-2xl mx-auto px-4">
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`transition-colors ${userLikes[video.id] ? 'text-red-500 hover:text-red-600' : 'hover:text-[#4CAF50]'}`}
                    aria-label={userLikes[video.id] ? "Unlike video" : "Like video"}
                    onClick={() => handleLike(video.id)}
                  >
                    <Heart className={`h-6 w-6 ${userLikes[video.id] ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:text-[#4CAF50] transition-colors"
                    aria-label="Comment on video"
                    onClick={() => navigate(`/explore/${video.id}`)}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:text-[#4CAF50] transition-colors"
                    aria-label="Share video"
                    onClick={() => handleShare(video)}
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Save video"
                >
                  <Bookmark className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {video.likes_count || 0} likes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">{video.creator?.username}</span>
                  {video.description}
                </p>
                <button 
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => navigate(`/explore/${video.id}`)}
                >
                  View all comments
                </button>
                
                {/* Add comment input field - Instagram style */}
                <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
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
                    className={`text-[#4CAF50] font-semibold ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                    disabled={!commentText.trim()}
                    onClick={() => handleComment(video.id)}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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
