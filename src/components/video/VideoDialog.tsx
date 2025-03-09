
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface VideoDialogProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  userLikes?: Record<string, boolean>;
  onLikeToggle?: (videoId: string) => void;
  currentUser?: any;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
  likes_count: number;
  user_has_liked: boolean;
}

const VideoDialog = ({ 
  video, 
  isOpen, 
  onClose,
  globalAudioEnabled = false,
  onAudioStateChange,
  userLikes = {},
  onLikeToggle,
  currentUser
}: VideoDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['video-comments', video?.id],
    queryFn: async () => {
      if (!video?.id) return [];
      
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
        .eq('video_id', video.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Check if user has liked each comment
      if (currentUser && data.length > 0) {
        const commentIds = data.map(comment => comment.id);
        const { data: commentLikes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', currentUser.id)
          .in('comment_id', commentIds);
          
        const likedCommentIds = commentLikes?.reduce((acc: Record<string, boolean>, like) => {
          acc[like.comment_id] = true;
          return acc;
        }, {}) || {};
        
        return data.map(comment => ({
          ...comment,
          user_has_liked: !!likedCommentIds[comment.id]
        }));
      }
      
      return data.map(comment => ({
        ...comment,
        user_has_liked: false
      }));
    },
    enabled: !!video?.id && isOpen,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      if (!currentUser || !video) {
        throw new Error('You must be logged in to comment');
      }
      
      const { data, error } = await supabase
        .from('video_comments')
        .insert([
          { 
            video_id: video.id, 
            user_id: currentUser.id, 
            content: commentText,
            likes_count: 0
          }
        ])
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .single();
        
      if (error) throw error;
      return { ...data, user_has_liked: false };
    },
    onSuccess: (newComment) => {
      // Reset comment text
      setCommentText('');
      
      // Update comments cache
      queryClient.setQueryData(['video-comments', video?.id], (oldData: any) => {
        return [newComment, ...(oldData || [])];
      });
    }
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string, isLiked: boolean }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to like comments');
      }
      
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        
        // Decrement likes count
        const { error: updateError } = await supabase
          .from('video_comments')
          .update({ likes_count: Math.max(0, (await getLikesCount(commentId)) - 1) })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        return { commentId, liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert([
            { comment_id: commentId, user_id: currentUser.id }
          ]);
          
        if (error) throw error;
        
        // Increment likes count
        const { error: updateError } = await supabase
          .from('video_comments')
          .update({ likes_count: (await getLikesCount(commentId)) + 1 })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        return { commentId, liked: true };
      }
    },
    onSuccess: ({ commentId, liked }) => {
      // Update comments cache
      queryClient.setQueryData(['video-comments', video?.id], (oldData: any) => {
        return oldData?.map((comment: any) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: liked 
                ? (comment.likes_count || 0) + 1 
                : Math.max(0, (comment.likes_count || 0) - 1),
              user_has_liked: liked
            };
          }
          return comment;
        });
      });
    }
  });
  
  // Helper function to get current likes count
  const getLikesCount = async (commentId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);
      
    if (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
    
    return count || 0;
  };

  const handleViewDetails = () => {
    if (video) {
      navigate(`/explore/${video.id}`);
      onClose();
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !currentUser || !video) return;
    addCommentMutation.mutate(commentText);
  };

  const handleLikeComment = (commentId: string, isLiked: boolean) => {
    if (!currentUser) return;
    likeCommentMutation.mutate({ commentId, isLiked });
  };

  const handleCopyLink = () => {
    if (video) {
      const url = `${window.location.origin}/explore/${video.id}`;
      navigator.clipboard.writeText(url);
    }
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[1300px] p-0 bg-black h-[98vh] overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Video Details</DialogTitle>
        </VisuallyHidden>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Video Side */}
          <div className="relative flex-1 bg-black flex items-center justify-center">
            <VideoPlayer
              video={video}
              autoPlay={true}
              showControls={true}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={onAudioStateChange}
              className="h-full dialog-video"
              isFullscreen={false}
            />
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50 rounded-full z-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Comments Side */}
          <div className="w-full md:w-[420px] bg-white dark:bg-gray-900 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  {video.creator?.avatar_url ? (
                    <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                  ) : (
                    <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{video.creator?.username || 'Anonymous'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-500">
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Add to favorites
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Share to...
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onClose}>
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              {/* Description */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 mr-3">
                    {video.creator?.avatar_url ? (
                      <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                    ) : (
                      <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold mr-2">{video.creator?.username}</span>
                      {video.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(video.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="p-4">
                {isCommentsLoading ? (
                  <p className="text-center text-gray-500 py-4">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No comments yet</p>
                ) : (
                  comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex items-start mb-4">
                      <Avatar className="h-8 w-8 mr-3">
                        {comment.user?.avatar_url ? (
                          <AvatarImage src={comment.user.avatar_url} alt={comment.user.username || ''} />
                        ) : (
                          <AvatarFallback>{(comment.user?.username || '?')[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">{comment.user?.username}</span>
                          {comment.content}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          {comment.likes_count > 0 && (
                            <span className="ml-3">{comment.likes_count} likes</span>
                          )}
                          <button className="ml-3 font-medium">Reply</button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`p-0 hover:bg-transparent ${comment.user_has_liked ? 'text-red-500' : 'text-black dark:text-white'}`}
                        onClick={() => handleLikeComment(comment.id, comment.user_has_liked)}
                      >
                        <Heart className={`h-4 w-4 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Actions Bar */}
            <div className="border-t border-gray-200 dark:border-gray-800">
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="flex space-x-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`p-0 hover:bg-transparent ${userLikes[video.id] ? 'text-red-500' : 'text-black dark:text-white'}`}
                      onClick={() => onLikeToggle?.(video.id)}
                    >
                      <Heart className={`h-6 w-6 ${userLikes[video.id] ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="p-0 hover:bg-transparent text-black dark:text-white"
                      onClick={handleViewDetails}
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="p-0 hover:bg-transparent text-black dark:text-white"
                    >
                      <Send className="h-6 w-6" />
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
                
                <p className="font-semibold text-sm mb-1">{video.likes_count || 0} likes</p>
                <p className="text-xs text-gray-500">
                  {new Date(video.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              {/* Comment Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 text-sm border-none focus-visible:ring-0 px-0 py-1.5"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-blue-500 font-semibold ${!commentText.trim() ? 'opacity-50' : 'opacity-100'}`}
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;
