import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { useOptimizedVideoFeed } from '@/features/video/hooks/useOptimizedVideoFeed';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Search } from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { SmartMediaRenderer } from '@/components/explore/SmartMediaRenderer';
import { getCdnUrl } from '@/utils/cdnUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ExploreVideoFeedProps {
  type?: 'explore' | 'news' | 'general';
  className?: string;
  onVideoClick?: (video: Video) => void;
}

const ExploreVideoFeed: React.FC<ExploreVideoFeedProps> = ({
  type = 'general',
  className,
  onVideoClick,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
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
  const [videoVisibility, setVideoVisibility] = useState<Record<string, boolean>>({});

  // Load more when scrolling near bottom
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  // IntersectionObserver for video autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) return;

          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;
          console.log('Video visibility changed:', { videoId, isVisible, ratio: entry.intersectionRatio });
          
          setVideoVisibility(prev => ({ ...prev, [videoId]: isVisible }));
          
          const videoElement = videoRefs.current[videoId];
          if (videoElement) {
            if (isVisible) {
              console.log('Video visible/autoplaying', videoId);
              videoElement.muted = true;
              videoElement.play().catch(console.error);
            } else {
              console.log('Video hidden/pausing', videoId);
              videoElement.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all video containers
    const videoContainers = document.querySelectorAll('[data-video-id]');
    videoContainers.forEach(container => observer.observe(container));

    return () => observer.disconnect();
  }, [videos]);

  // Load more when scrolling near bottom
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
        const response = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
        console.log('Like toggled (removed)', { videoId, response });
      } else {
        const response = await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: currentUser.id });
        console.log('Like toggled (added)', { videoId, response });
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
        const response = await supabase
          .from('saved_posts')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
        
        setUserSaves(prev => prev.filter(id => id !== videoId));
        console.log('Save toggled (removed)', { videoId, response });
        toast.success('Video removed from saved');
      } else {
        const response = await supabase
          .from('saved_posts')
          .insert({ video_id: videoId, user_id: currentUser.id });
        
        setUserSaves(prev => [...prev, videoId]);
        console.log('Save toggled (added)', { videoId, response });
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
      console.log('Comment submitted', { videoId, data });
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
    if (action === 'save') {
      const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
      handleSave(videoId, mockEvent);
    } else if (action === 'share') {
      const video = videos.find(v => v.id === videoId);
      if (video) handleShare(video);
    } else if (action === 'delete') {
      toast.info('Delete functionality not implemented yet');
    } else if (action === 'report') {
      toast.info('Report functionality not implemented yet');
    }
  }, [videos, handleSave, handleShare]);

  // Navigate to video detail
  const handleNavigateToVideo = useCallback((videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) onVideoClick?.(video);
  }, [onVideoClick, videos]);

  // Get responsive media info for dynamic handling
  const getResponsiveMediaInfo = (url: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    return { 
      isImage,
      // Responsive max heights based on breakpoint
      maxHeight: breakpoint === 'mobile' ? '80vh' : 
                 breakpoint === 'tablet' ? '70vh' : '75vh',
      // Responsive aspect ratios for videos
      aspectRatio: breakpoint === 'mobile' ? '4/5' : 
                   breakpoint === 'tablet' ? '3/4' : '4/5'
    };
  };

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
    <div className={cn("w-full border-0 m-0 p-0 space-y-2", className)}>
      {videos.map((video, index) => {
        const isPostOwner = currentUser?.id === video.creator_id;
        const videoComments = localComments[video.id] || [];
        const mediaInfo = getResponsiveMediaInfo(video.video_url || '');

        return (
          <div key={video.id} className="feed-item border-0 m-0 p-0">
            {/* Header */}
            <div className="post-header">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={getCdnUrl(video.creator.avatar_url) || ''} alt={video.creator?.full_name || 'User'} />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {video.creator?.full_name?.charAt(0) || video.creator?.username?.charAt(0) || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <span 
                  className="post-username transition-colors hover:text-primary cursor-pointer" 
                  onClick={() => video.creator?.id && navigate(`/users/${video.creator.id}`)}
                >
                  {video.creator?.username || video.creator?.full_name || 'Anonymous User'}
                </span>
              </div>
              
              {/* Mobile Bottom Sheet Menu */}
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto">
                    <div className="space-y-4 p-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleMenuAction('save', video.id)}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleMenuAction('share', video.id)}
                      >
                        Share
                      </Button>
                      {isPostOwner && (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => handleMenuAction('delete', video.id)}
                        >
                          Delete
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-500"
                        onClick={() => handleMenuAction('report', video.id)}
                      >
                        Report
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                // Desktop dropdown menu with hover state
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Responsive Media Container */}
            <div 
              className="feed-video-container responsive-media-container" 
              data-video-id={video.id}
              onClick={() => handleNavigateToVideo(video.id)}
            >
              {mediaInfo.isImage ? (
                <img 
                  src={video.video_url} 
                  alt={video.title}
                  className={cn(
                    "aspect-auto object-contain m-auto transition-opacity hover:opacity-95",
                    `max-h-[${mediaInfo.maxHeight}]`
                  )}
                  style={{ maxHeight: mediaInfo.maxHeight }}
                  onLoad={() => console.log('Responsive media rendered', video.id)}
                />
              ) : (
                <div 
                  className="object-cover transition-transform hover:scale-[1.01]"
                  style={{ aspectRatio: mediaInfo.aspectRatio }}
                >
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[video.id] = el;
                    }}
                    src={video.video_url || ''}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedData={() => console.log('Responsive video rendered', video.id)}
                  />
                </div>
              )}
            </div>

            {/* Actions with responsive sizing */}
            <div className="post-actions">
              <div className="flex gap-3 md:gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 md:h-10 md:w-10 text-white hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 md:h-10 md:w-10 hover:bg-white/10 transition-colors"
                  onClick={() => handleLike(video.id)}
                >
                  <Heart 
                    className={cn(
                      "h-5 w-5 md:h-6 md:w-6", 
                      userLikes[video.id] ? "text-red-500 fill-red-500" : "text-white"
                    )}
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 md:h-10 md:w-10 hover:bg-white/10 transition-colors"
                  onClick={(e) => handleSave(video.id, e)}
                >
                  <Bookmark 
                    className={cn(
                      "h-5 w-5 md:h-6 md:w-6", 
                      userSaves.includes(video.id) ? "text-yellow-500 fill-yellow-500" : "text-white"
                    )}
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 md:h-10 md:w-10 text-white hover:text-white/80 hover:bg-white/10 transition-colors"
                  onClick={() => handleShare(video)}
                >
                  <Share2 className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </div>
            </div>

            {/* Description with responsive typography */}
            <div className="post-description text-sm md:text-base">
              <span className="font-bold">{video.creator?.username || video.creator?.full_name || 'user'}</span>
              <span className="ml-1">{video.description}</span>
            </div>

            {/* View Comments with responsive text */}
            <div className="post-view-comments text-sm md:text-base">
              View all {(video.comments_count || 0) + videoComments.length} comments
            </div>

            {/* Comment Input with responsive sizing */}
            <div className="post-comment-input">
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
                    className="border-none bg-transparent p-0 focus-visible:ring-0 flex-1 text-sm md:text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment(video.id);
                      }
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 hover:bg-muted transition-colors">
                    <Search className="h-4 w-4 md:h-5 md:w-5" />
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

export default ExploreVideoFeed;
