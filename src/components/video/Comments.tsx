
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
  user_has_liked: boolean;
}

interface CommentsProps {
  videoId: string;
  currentUser: any | null;
}

const Comments: React.FC<CommentsProps> = ({ videoId, currentUser }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();

  const { data: comments = [], isLoading: isCommentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['video-comments', videoId],
    queryFn: async () => {
      if (!videoId) return [];
      
      console.log('Fetching comments for video:', videoId);
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
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      
      console.log('Comments data:', data);
      
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
    enabled: !!videoId,
    staleTime: 1000, // Reduce stale time for more frequent refreshes
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      if (!currentUser || !videoId) {
        console.error('User or video missing:', { currentUser, videoId });
        throw new Error('You must be logged in to comment');
      }
      
      console.log('Adding comment for video:', videoId, 'by user:', currentUser.id);
      
      const { data, error } = await supabase
        .from('video_comments')
        .insert([
          { 
            video_id: videoId, 
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
        `);
        
      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
      
      console.log('New comment data:', data);
      if (!data || data.length === 0) {
        throw new Error('No data returned from comment insert');
      }
      
      return { ...data[0], user_has_liked: false };
    },
    onSuccess: (newComment) => {
      setCommentText('');
      setIsSubmittingComment(false);
      
      console.log('Comment added successfully:', newComment);
      
      // Update local query cache
      queryClient.setQueryData(['video-comments', videoId], (oldData: any) => {
        console.log('Updating query cache with new comment', { oldData, newComment });
        return [newComment, ...(oldData || [])];
      });
      
      // Force a refetch of the comments
      refetchComments();
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!"
      });
    },
    onError: (error) => {
      setIsSubmittingComment(false);
      console.error('Error in comment mutation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive"
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
      queryClient.setQueryData(['video-comments', videoId], (oldData: any) => {
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like comment",
        variant: "destructive"
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

  const handleSendComment = () => {
    if (!commentText.trim() || !currentUser) {
      console.log('Cannot post comment:', { commentText, currentUser });
      
      if (!currentUser) {
        toast({
          title: "Login required",
          description: "Please log in to comment"
        });
      }
      return;
    }
    setIsSubmittingComment(true);
    addCommentMutation.mutate(commentText);
  };

  const handleLikeComment = (commentId: string, isLiked: boolean) => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to like comments"
      });
      return;
    }
    likeCommentMutation.mutate({ commentId, isLiked });
  };

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!currentUser) throw new Error('You must be logged in to delete comments');
      
      const { error } = await supabase
        .from('video_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      return commentId;
    },
    onSuccess: (commentId) => {
      queryClient.setQueryData(['video-comments', videoId], (oldData: any) => {
        return oldData?.filter((comment: any) => comment.id !== commentId);
      });
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="w-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-sm">Comments</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 max-h-[400px] scrollbar-hide" 
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
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
                <div className="flex items-start justify-between">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{comment.user?.username}</span>
                    {comment.content}
                  </p>
                  {comment.user?.id === currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 ml-2 hover:bg-transparent hover:text-red-500"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
            disabled={isSubmittingComment}
          />
          <Button
            variant="ghost"
            size="sm"
            className={`text-blue-500 font-semibold ${!commentText.trim() || isSubmittingComment ? 'opacity-50' : 'opacity-100'}`}
            onClick={handleSendComment}
            disabled={!commentText.trim() || isSubmittingComment}
          >
            {isSubmittingComment ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
