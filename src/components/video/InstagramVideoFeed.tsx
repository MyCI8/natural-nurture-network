import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { useOptimizedVideoFeed } from '@/features/video/hooks/useOptimizedVideoFeed';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, ShoppingCart } from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { getCdnUrl } from '@/utils/cdnUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InstagramVideoFeedProps {
  type?: 'explore' | 'news' | 'general';
  className?: string;
  onVideoClick?: (video: Video) => void;
}

const InstagramVideoFeed: React.FC<InstagramVideoFeedProps> = ({
  type = 'general',
  className,
  onVideoClick,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { videos, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching, error } = useOptimizedVideoFeed({ 
    type,
    limit: 10
  });

  // State for user interactions
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userSaves, setUserSaves] = useState<string[]>([]);
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<Record<string, boolean>>({});

  // Load more when scrolling near bottom
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle like action
  const handleLike = useCallback(async (videoId: string) => {
    if (!currentUser) {
      toast.error('Please log in to like videos');
      return;
    }
    
    try {
      const isLiked = userLikes[videoId];
      
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: currentUser.id });
      }
      
      setUserLikes(prev => ({ ...prev, [videoId]: !isLiked }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  }, [currentUser, userLikes]);

  // Handle save action
  const handleSave = useCallback(async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please log in to save videos');
      return;
    }
    
    try {
      const isSaved = userSaves.includes(videoId);
      
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
        
        setUserSaves(prev => prev.filter(id => id !== videoId));
        toast.success('Video removed from saved');
      } else {
        await supabase
          .from('saved_posts')
          .insert({ video_id: videoId, user_id: currentUser.id });
        
        setUserSaves(prev => [...prev, videoId]);
        toast.success('Video saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save video');
    }
  }, [currentUser, userSaves]);

  // Handle share action
  const handleShare = useCallback(async (video: Video) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description || '',
          url: window.location.origin + `/videos/${video.id}`,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/videos/${video.id}`);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share video');
    }
  }, []);

  // Handle comment submission
  const handleSubmitComment = useCallback(async (videoId: string) => {
    const content = commentInputs[videoId]?.trim();
    if (!content || !currentUser) return;

    setSubmittingCommentFor(videoId);
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .insert({
          video_id: videoId,
          user_id: currentUser.id,
          content
        })
        .select('*, profiles:user_id(full_name, avatar_url)')
        .single();

      if (error) throw error;

      // Add to local comments
      setLocalComments(prev => ({
        ...prev,
        [videoId]: [...(prev[videoId] || []), data]
      }));

      // Clear input
      setCommentInputs(prev => ({ ...prev, [videoId]: '' }));
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingCommentFor(null);
    }
  }, [commentInputs, currentUser]);

  // Handle menu actions
  const handleMenuAction = useCallback(async (action: string, videoId: string) => {
    if (action === 'delete') {
      // TODO: Implement delete functionality
      toast.info('Delete functionality not implemented yet');
    } else if (action === 'report') {
      // TODO: Implement report functionality
      toast.info('Report functionality not implemented yet');
    }
  }, []);

  // Navigate to video detail
  const handleNavigateToVideo = useCallback((videoId: string) => {
    onVideoClick?.(videos.find(v => v.id === videoId)!);
  }, [onVideoClick, videos]);

  // Handle loading state
  if (isFetching && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load videos</p>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!isFetching && videos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Check back later for new content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {videos.map((video) => {
        const isPostOwner = currentUser?.id === video.creator_id;
        const videoComments = localComments[video.id] || [];
        const isImagePost = video.video_url?.includes('.jpg') || video.video_url?.includes('.png') || video.video_url?.includes('.jpeg');

        return (
          <div key={video.id} className="instagram-feed-item">
            {/* Header */}
            <div className="instagram-header">
              <Avatar className="h-8 w-8">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={getCdnUrl(video.creator.avatar_url) || ''} alt={video.creator?.full_name || 'User'} />
                ) : (
                  <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                    {video.creator?.full_name?.charAt(0) || video.creator?.username?.charAt(0) || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <span className="instagram-username" onClick={() => video.creator?.id && navigate(`/users/${video.creator.id}`)}>
                  {video.creator?.username || video.creator?.full_name || 'Anonymous User'}
                </span>
                <span className="text-gray-500 ml-1">• 10h</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isPostOwner && (
                    <DropdownMenuItem onClick={() => handleMenuAction('delete', video.id)}>
                      Delete Post
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleMenuAction('report', video.id)}>
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Media Container with Overlay Text */}
            <div className="instagram-video-container relative" onClick={() => handleNavigateToVideo(video.id)}>
              {isImagePost ? (
                <div className="relative">
                  <img 
                    src={video.video_url} 
                    alt={video.title}
                    className="w-full h-auto object-contain bg-black"
                  />
                  {video.title && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <h2 className="text-white text-2xl md:text-3xl font-bold text-center leading-tight max-w-[90%] drop-shadow-2xl">
                        {video.title}
                      </h2>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <VideoPlayer 
                    video={video} 
                    autoPlay={false}
                    showControls={true}
                  />
                  {video.title && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <h2 className="text-white text-2xl md:text-3xl font-bold text-center leading-tight max-w-[90%] drop-shadow-2xl">
                        {video.title}
                      </h2>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="instagram-actions">
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowCommentsFor(prev => ({ ...prev, [video.id]: !prev[video.id] }))}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => handleSave(video.id, e)}
                >
                  <Bookmark 
                    className="h-6 w-6" 
                    fill={userSaves.includes(video.id) ? "currentColor" : "none"}
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleShare(video)}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Likes */}
            <div className="instagram-likes">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 p-0 mr-2 ${userLikes[video.id] ? 'text-red-500' : ''}`}
                onClick={() => handleLike(video.id)}
              >
                <Heart className="h-5 w-5" fill={userLikes[video.id] ? "currentColor" : "none"} />
              </Button>
              <span>❤️ {video.likes_count || 0} likes</span>
            </div>

            {/* Description */}
            <div className="instagram-description">
              <span className="font-semibold">{video.creator?.username || 'user'}</span>
              <span className="ml-1">{video.description}</span>
            </div>

            {/* Local Comments */}
            {videoComments.length > 0 && (
              <div className="px-3 pb-2">
                {videoComments.slice(0, 2).map((comment, idx) => (
                  <div key={idx} className="text-sm mb-1">
                    <span className="font-semibold">{comment.profiles?.full_name || 'User'}</span>
                    <span className="ml-1">{comment.content}</span>
                  </div>
                ))}
              </div>
            )}

            {/* View Comments */}
            <div 
              className="instagram-view-comments"
              onClick={() => setShowCommentsFor(prev => ({ ...prev, [video.id]: !prev[video.id] }))}
            >
              View all {(video.comments_count || 0) + videoComments.length} comments
            </div>

            {/* Comment Input */}
            <div className="instagram-comment-input">
              {submittingCommentFor === video.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  <span className="text-sm text-muted-foreground">Posting...</span>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Add a comment..."
                    value={commentInputs[video.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [video.id]: e.target.value }))}
                    className="border-none bg-transparent p-0 focus-visible:ring-0"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment(video.id);
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={!commentInputs[video.id]?.trim()}
                    onClick={() => handleSubmitComment(video.id)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Post
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="w-full py-4">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramVideoFeed;