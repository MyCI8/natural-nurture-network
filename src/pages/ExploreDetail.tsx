
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showShare, setShowShare] = React.useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        
        // Check if user has liked this video
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

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['video-comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('video_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', id)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        return { liked: false };
      } else {
        // Like
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
      // Update local state
      setIsLiked(data.liked);
      
      // Invalidate video query to refresh like count
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

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const { error } = await supabase
        .from('video_comments')
        .insert([
          { video_id: id, user_id: currentUser.id, content: comment }
        ]);
        
      if (error) throw error;
      return { comment };
    },
    onSuccess: () => {
      setCommentText('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!"
      });
      
      // Invalidate comments query to refresh
      queryClient.invalidateQueries({ queryKey: ['video-comments', id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
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

  const handleComment = () => {
    if (!commentText.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
      });
      return;
    }
    
    commentMutation.mutate(commentText);
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
          <div className="w-full bg-black">
            <VideoPlayer video={video} autoPlay={false} showControls />
          </div>
        </div>

        <div className="md:w-[350px] border-l border-gray-200 dark:border-gray-800">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
                ) : (
                  <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium">{video.creator?.username || 'Anonymous'}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-[#4CAF50]'}`}
                  aria-label={isLiked ? "Unlike video" : "Like video"}
                  onClick={handleLike}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Comment on video"
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Share video"
                  onClick={handleShare}
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

            <div className="space-y-2 mb-4">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {video.likes_count || 0} likes
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium mr-2">{video.creator?.username}</span>
                {video.description}
              </p>
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
              <h3 className="font-medium text-sm mb-4">Comments</h3>
              
              {isCommentsLoading ? (
                <p className="text-sm text-gray-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {comment.user?.avatar_url ? (
                          <AvatarImage src={comment.user.avatar_url} alt={comment.user.username || ''} />
                        ) : (
                          <AvatarFallback>{comment.user?.username?.[0] || '?'}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{comment.user?.username || 'Anonymous'}</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{comment.content}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add comment input */}
              <div className="flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  className="text-sm border-none focus-visible:ring-0 px-0 h-auto py-1"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-[#4CAF50] ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                  disabled={!commentText.trim()}
                  onClick={handleComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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
            {/* Additional share options will be implemented */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreDetail;
