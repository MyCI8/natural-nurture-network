import React, { useState } from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      setCommentText('');
      
      queryClient.setQueryData(['video-comments', video?.id], (oldData: any) => {
        return [newComment, ...(oldData || [])];
      });
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string, isLiked: boolean }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to like comments');
      }
      
      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        
        const { error: updateError } = await supabase
          .from('video_comments')
          .update({ likes_count: Math.max(0, (await getLikesCount(commentId)) - 1) })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        return { commentId, liked: false };
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert([
            { comment_id: commentId, user_id: currentUser.id }
          ]);
          
        if (error) throw error;
        
        const { error: updateError } = await supabase
          .from('video_comments')
          .update({ likes_count: (await getLikesCount(commentId)) + 1 })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        return { commentId, liked: true };
      }
    },
    onSuccess: ({ commentId, liked }) => {
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

  if (!video || !isOpen) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto">
        <div className="md:hidden p-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="hidden md:block md:w-[240px] border-r border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
              ) : (
                <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium text-sm">{video.creator?.username || 'Anonymous'}</span>
          </div>
        </div>
        
        <div className="relative md:flex-1 bg-black">
          <div className="py-6 px-4 md:px-8 flex items-center justify-center min-h-[300px] max-h-[calc(100vh-120px)]">
            <div className="w-full max-w-[800px] mx-auto">
              <VideoPlayer
                video={video}
                autoPlay={true}
                showControls={true}
                globalAudioEnabled={globalAudioEnabled}
                onAudioStateChange={onAudioStateChange}
                isFullscreen={false}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50 rounded-full z-10 hidden md:flex"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="w-full md:w-[350px] bg-white dark:bg-gray-900 flex flex-col h-full border-l border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-3">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                ) : (
                  <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{video.creator?.username || 'Anonymous'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
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
            
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-sm">{video.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(video.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
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
              
              <p className="font-semibold text-sm">{video.likes_count || 0} likes</p>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-medium text-sm">Comments</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {isCommentsLoading ? (
              <p className="text-center text-gray-500 py-4">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No comments yet</p>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="flex items-start mb-6">
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
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
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
  );
};

export default VideoDialog;
