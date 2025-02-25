
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: comments = [], isLoading } = useQuery({
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

  // Real-time subscriptions for live updates
  useEffect(() => {
    if (!videoId) return;

    const channel = supabase
      .channel(`video_comments_${videoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'video_comments', filter: `video_id=eq.${videoId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to comment",
        variant: "destructive",
      });
      navigate('/auth');
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

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          {comment.profiles.avatar_url ? (
            <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.full_name} />
          ) : (
            <AvatarFallback>{comment.profiles.full_name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold text-sm text-[#222222]">{comment.profiles.full_name}</p>
            <p className="text-sm text-[#666666]">{comment.content}</p>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs text-[#666666]">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#4CAF50] hover:text-[#388E3C]"
              onClick={() => setReplyingTo(comment.id)}
            >
              Reply
            </Button>
          </div>
          {replyingTo === comment.id && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] border-gray-300 focus:border-[#4CAF50]"
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#4CAF50] hover:bg-[#388E3C]"
                  onClick={(e) => handleSubmit(e, comment.id)}
                  disabled={!newComment.trim()}
                >
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[#666666]"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="ml-8 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="p-4 text-[#666666]">Loading comments...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#4CAF50]">Comments</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {currentUser ? (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] border-gray-300 focus:border-[#4CAF50]"
          />
          <Button 
            type="submit" 
            className="bg-[#4CAF50] hover:bg-[#388E3C]"
            disabled={!newComment.trim()}
          >
            Post
          </Button>
        </form>
      ) : (
        <p className="text-sm text-[#666666]">
          Please {' '}
          <Button 
            variant="link" 
            className="text-[#4CAF50] p-0 h-auto font-semibold"
            onClick={() => navigate('/auth')}
          >
            log in
          </Button>
          {' '} to comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
