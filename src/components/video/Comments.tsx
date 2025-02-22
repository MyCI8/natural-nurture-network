
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  video_id: string;
  parent_id: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface CommentsProps {
  videoId: string;
  onClose?: () => void;
}

export const Comments = ({ videoId, onClose }: CommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group comments by parent_id to organize replies
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      data.forEach((comment: Comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
        
        if (comment.parent_id) {
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            parentComment.replies?.push(comment);
          }
        } else {
          topLevelComments.push(comment);
        }
      });

      return topLevelComments;
    },
  });

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('video_comments')
        .insert({
          content: newComment.trim(),
          video_id: videoId,
          user_id: currentUser.id,
          parent_id: parentId || null,
        });

      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('video_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          {comment.profiles.avatar_url ? (
            <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.full_name} />
          ) : (
            <AvatarFallback>{comment.profiles.full_name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            {currentUser && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </Button>
                {currentUser.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px]"
              />
              <div className="flex space-x-2">
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px]"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          Post
        </Button>
      </form>

      <div className="space-y-6">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
