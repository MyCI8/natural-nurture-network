import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Swipeable } from '@/components/ui/swipeable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePostManagement } from '@/hooks/usePostManagement';
import '../styles/explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<(Video & { creator: any; }) | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Record<string, { id: string; content: string; username: string; }[]>>({});
  const [visibleProductLinkByVideo, setVisibleProductLinkByVideo] = useState<{ [videoId: string]: string | null }>({});
  const [productCardOpenFor, setProductCardOpenFor] = useState<string | null>(null);
  const [productCardOverlayAnimatingFor, setProductCardOverlayAnimatingFor] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetVideoId, setDeleteTargetVideoId] = useState<string | null>(null);
  const [userSaves, setUserSaves] = useState<Record<string, boolean>>({});

  const { deletePost, isDeleting } = usePostManagement();

  const handleToggleProductLink = (videoId: string, linkId: string) => {
    setVisibleProductLinkByVideo(prev => ({
      ...prev,
      [videoId]: prev[videoId] === linkId ? null : linkId
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data
      } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        const {
          data: likes
        } = await supabase.from('video_likes').select('video_id').eq('user_id', data.user.id);
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

  useEffect(() => {
    const fetchSaves = async () => {
      if (!currentUser) {
        setUserSaves({});
        return;
      }
      const { data, error } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (!error && data) {
        const savesMap = data.reduce((acc: Record<string, boolean>, row: any) => {
          acc[row.video_id] = true;
          return acc;
        }, {});
        setUserSaves(savesMap);
      }
    };
    fetchSaves();
  }, [currentUser]);

  const {
    data: videos = [],
    isLoading
  } = useQuery({
    queryKey: ['explore-videos'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('videos').select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          ),
          comments:video_comments(count)
        `).eq('status', 'published').not('video_type', 'eq', 'news') // Exclude news videos
      .order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data.map((video: any) => ({
        ...video,
        comments_count: video.comments?.[0]?.count || 0
      })) as (Video & {
        creator: any;
        comments_count: number;
      })[];
    }
  });

  const { data: allProductLinks = [] } = useQuery({
    queryKey: ['all-product-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*');
      
      if (error) throw error;
      return data as ProductLink[];
    }
  });

  const likeMutation = useMutation({
    mutationFn: async ({
      videoId,
      isLiked
    }: {
      videoId: string;
      isLiked: boolean;
    }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      if (isLiked) {
        const {
          error
        } = await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', currentUser.id);
        if (error) throw error;
        return {
          videoId,
          liked: false
        };
      } else {
        const {
          error
        } = await supabase.from('video_likes').insert([{
          video_id: videoId,
          user_id: currentUser.id
        }]);
        if (error) throw error;
        return {
          videoId,
          liked: true
        };
      }
    },
    onSuccess: data => {
      setUserLikes(prev => ({
        ...prev,
        [data.videoId]: data.liked
      }));
      queryClient.invalidateQueries({
        queryKey: ['explore-videos']
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like",
        variant: "destructive"
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({
      videoId,
      comment
    }: {
      videoId: string;
      comment: string;
    }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      const {
        data,
        error
      } = await supabase.from('video_comments').insert([{
        video_id: videoId,
        user_id: currentUser.id,
        content: comment,
        likes_count: 0
      }]).select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `);
      if (error) throw error;
      return {
        videoId,
        comment,
        id: data[0].id
      };
    },
    onSuccess: data => {
      setCommentText('');
      setSubmittingCommentFor(null);
      const newComment = {
        id: data.id,
        content: data.comment,
        username: currentUser?.username || 'User'
      };
      setLocalComments(prev => ({
        ...prev,
        [data.videoId]: [newComment, ...(prev[data.videoId] || [])]
      }));
      queryClient.invalidateQueries({
        queryKey: ['explore-videos']
      });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!"
      });
    },
    onError: error => {
      setSubmittingCommentFor(null);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const handleMenuAction = (action: string, videoId: string) => {
    switch (action) {
      case 'delete':
        setDeleteTargetVideoId(videoId);
        setShowDeleteDialog(true);
        break;
      case 'edit':
        navigate(`/edit-video/${videoId}`);
        break;
      case 'report':
        // TODO: Implement report functionality
        console.log('Report post', videoId);
        break;
    }
  };

  const handleDeletePost = () => {
    if (deleteTargetVideoId) {
      deletePost(deleteTargetVideoId);
      setShowDeleteDialog(false);
      setDeleteTargetVideoId(null);
      // Stay on explore page, video will be removed from list automatically
    }
  };

  // Check if current user owns a specific post
  const isPostOwner = (videoCreatorId: string) => {
    return currentUser && currentUser.id === videoCreatorId;
  };

  const handleShare = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title || 'Check out this video',
          text: video.description || '',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it with others!"
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
        description: "Please log in to like videos"
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
        description: "Please log in to comment"
      });
      return;
    }
    setSubmittingCommentFor(videoId);
    commentMutation.mutate({
      videoId,
      comment: commentText
    });
  };

  const handleNavigateToVideo = (videoId: string) => {
    navigate(`/explore/${videoId}`);
  };

  const handleAudioStateChange = (isMuted: boolean) => {
    setGlobalAudioEnabled(!isMuted);
  };

  const openOrToggleProductCard = (videoId: string) => {
    if (productCardOpenFor === videoId) {
      setProductCardOverlayAnimatingFor(videoId);
      setTimeout(() => {
        setProductCardOpenFor(null);
        setProductCardOverlayAnimatingFor(null);
      }, 320);
    } else {
      setProductCardOpenFor(videoId);
      setProductCardOverlayAnimatingFor(null);
    }
  };

  const getProductLinksForVideo = (videoId: string) => {
    return allProductLinks.filter(link => link.video_id === videoId);
  };

  const handleSave = async (videoId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to save videos"
      });
      return;
    }
    const isSaved = !!userSaves[videoId];
    // Optimistically update UI
    setUserSaves((prev) => ({ ...prev, [videoId]: !isSaved }));

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ user_id: currentUser.id, video_id: videoId });
        if (error) throw error;
      }
      // Sync after change
      const { data, error: syncErr } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', currentUser.id);
      if (!syncErr && data) {
        const savesMap = data.reduce((acc: Record<string, boolean>, row: any) => {
          acc[row.video_id] = true;
          return acc;
        }, {});
        setUserSaves(savesMap);
      }
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error?.message ?? "Failed to update save status.",
        variant: "destructive"
      });
      // Rollback UI if error
      setUserSaves((prev) => ({ ...prev, [videoId]: isSaved }));
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen dark:text-dm-text">Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center w-full bg-white dark:bg-dm-background">
        {videos.map(video => {
          const productLinks = getProductLinksForVideo(video.id);
          const isProductCardOpen = productCardOpenFor === video.id;
          const isAnimatingOut = productCardOverlayAnimatingFor === video.id && !isProductCardOpen;
          const firstProductLink = productLinks[0];
          const hasProductLinks = productLinks.length > 0;

          return (
            <Swipeable
              key={video.id}
              className="instagram-feed-item"
              onSwipe={(direction) => {
                if (direction === 'left' || direction === 'right') {
                  // Optional: Handle horizontal swipes
                }
              }}
            >
              <div className="instagram-header">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-dm-mist">
                  {video.creator?.avatar_url ? <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} /> : <AvatarFallback className="dark:bg-dm-mist dark:text-dm-text">
                      {video.creator?.full_name?.[0] || '?'}
                    </AvatarFallback>}
                </Avatar>
                <div className="flex-1 text-left">
                  <span className="instagram-username" onClick={() => navigate(`/users/${video.creator?.id}`)}>
                    {video.creator?.username || 'Anonymous'}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-700 dark:text-dm-text">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isPostOwner(video.creator_id) && (
                      <>
                        <DropdownMenuItem onClick={() => handleMenuAction('delete', video.id)}>
                          Delete Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuAction('edit', video.id)}>
                          Edit Post
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleMenuAction('report', video.id)}>
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div
                className="instagram-video-container relative"
                style={{
                  aspectRatio: '4/5',
                  position: 'relative'
                }}
                onClick={() => handleNavigateToVideo(video.id)}
              >
                <VideoPlayer
                  video={video}
                  autoPlay
                  showControls={false}
                  globalAudioEnabled={globalAudioEnabled}
                  onAudioStateChange={handleAudioStateChange}
                  onClick={() => handleNavigateToVideo(video.id)}
                  className="w-full h-full"
                  productLinks={productLinks}
                  visibleProductLink={visibleProductLinkByVideo[video.id] || null}
                  toggleProductLink={(linkId) => handleToggleProductLink(video.id, linkId)}
                />

                {(isProductCardOpen || isAnimatingOut) && firstProductLink && (
                  <div
                    className="product-card-overlay-fullwidth"
                    style={{
                      bottom: 0,
                      width: '100%',
                      pointerEvents: 'auto',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                    }}
                  >
                    <div
                      className={
                        `product-card-blur-full bg-white/80 dark:bg-dm-mist/80 glass-morphism
                        ${isAnimatingOut ? "slide-out-down-product-card" : "slide-in-up"}`
                      }
                      style={{
                        position: 'relative',
                        pointerEvents: 'auto'
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium flex items-center gap-1 text-black dark:text-white">
                          <span>
                            <svg width="18" height="18" fill="none">
                              <use href="#lucide-shopping-cart" />
                            </svg>
                          </span>
                          Product
                        </span>
                        <button
                          className="rounded bg-transparent hover:bg-muted transition-colors p-1 ml-2"
                          onClick={e => {
                            e.stopPropagation();
                            openOrToggleProductCard(video.id);
                          }}
                          aria-label="Close product info"
                        >
                          <span className="sr-only">Close</span>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" d="M18 6 6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-4 items-center">
                        {firstProductLink.image_url &&
                          <img
                            src={firstProductLink.image_url}
                            alt={firstProductLink.title}
                            className="product-image-2x"
                          />}
                        <div>
                          <div className="font-semibold text-base text-black dark:text-white">{firstProductLink.title}</div>
                          {firstProductLink.price &&
                            <div className="text-sm font-medium mt-0.5 text-black dark:text-white">${firstProductLink.price.toFixed(2)}</div>}
                          <div className="text-xs text-muted-foreground mt-1">{firstProductLink.description}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          className="product-btn-bw-outline w-full inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold border-black dark:border-white bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:outline-none touch-manipulation"
                          onClick={e => {
                            e.stopPropagation();
                            window.open(firstProductLink.url, '_blank');
                          }}
                          style={{
                            borderRadius: 6,
                          }}
                        >
                          <svg width="18" height="18" fill="none">
                            <use href="#lucide-shopping-cart" />
                          </svg>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="instagram-actions flex items-center gap-4 justify-between w-full px-2 py-2">
                <div className="flex gap-4 flex-shrink-0">
                  <Button variant="ghost" size="icon"
                    className="p-0 hover:bg-transparent text-black dark:text-dm-text touch-manipulation"
                    onClick={e => {
                      e.stopPropagation();
                      handleNavigateToVideo(video.id);
                    }}>
                    <MessageCircle className="h-6 w-6" />
                  </Button>

                  {/* Save/Bookmark Button */}
                  <Button variant="ghost" size="icon"
                    className={`p-0 hover:bg-transparent touch-manipulation 
                      ${userSaves[video.id] 
                        ? 'text-amber-400' 
                        : 'text-black dark:text-dm-text'}
                    `}
                    aria-label={userSaves[video.id] ? "Unsave video" : "Save video"}
                    onClick={e => {
                      e.stopPropagation();
                      handleSave(video.id);
                    }}
                  >
                    <Bookmark
                      className="h-6 w-6"
                      fill={userSaves[video.id] ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                  </Button>

                  <Button variant="ghost" size="icon"
                    className="p-0 hover:bg-transparent text-black dark:text-dm-text touch-manipulation"
                    onClick={e => {
                      e.stopPropagation();
                      handleShare(video);
                    }}>
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
                
                {hasProductLinks && (
                  <button
                    className="product-btn-bw-outline ml-auto touch-manipulation flex items-center gap-2 border border-black dark:border-white text-black dark:text-white bg-transparent px-3 py-[8px] rounded-[6px]"
                    style={{
                      minWidth: 48,
                      minHeight: 38,
                      borderRadius: 6
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      openOrToggleProductCard(video.id);
                    }}
                    aria-label={isProductCardOpen ? "Hide product info" : "View product"}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-semibold">Product</span>
                  </button>
                )}
              </div>

              <div className="instagram-likes flex items-center gap-2 py-[5px]">
                <span>{video.likes_count || 0} likes</span>
                <Button variant="ghost" size="icon" className={`p-0 h-6 w-6 hover:bg-transparent ${userLikes[video.id] ? 'text-red-500' : 'text-black dark:text-dm-text'}`} onClick={e => {
                  e.stopPropagation();
                  handleLike(video.id);
                }}>
                  <Heart className={`h-5 w-5 ${userLikes[video.id] ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="instagram-description">
                <span className="font-semibold mr-2 dark:text-dm-text">{video.creator?.username}</span>
                <span className="dark:text-dm-text">{video.description}</span>
              </div>

              {localComments[video.id]?.length > 0 && <div className="px-4 text-left text-sm space-y-1">
                  {localComments[video.id].map(comment => <div key={comment.id} className="flex">
                      <span className="font-semibold mr-2 dark:text-dm-text">{comment.username}</span>
                      <span className="dark:text-dm-text">{comment.content}</span>
                    </div>)}
                </div>}

              <div className="instagram-view-comments" onClick={() => handleNavigateToVideo(video.id)}>
                View all {video.comments_count || 0} comments
              </div>

              <div className="instagram-comment-input">
                {submittingCommentFor === video.id ? <div className="flex items-center justify-center w-8 h-8">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent dark:border-dm-text dark:border-r-transparent"></div>
                  </div> : <Input type="text" placeholder="Add a comment..." className="text-sm border-none focus-visible:ring-0 px-0 h-auto py-1 dark:text-dm-text dark:bg-transparent" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleComment(video.id);
                  }
                }} />}
                
                <Button variant="ghost" size="sm" className={`text-blue-500 dark:text-dm-primary font-semibold ${!commentText.trim() || submittingCommentFor ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`} disabled={!commentText.trim() || !!submittingCommentFor} onClick={() => handleComment(video.id)}>
                  Post
                </Button>
              </div>
            </Swipeable>
          );
        })}

        <VideoDialog
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          globalAudioEnabled={globalAudioEnabled}
          onAudioStateChange={handleAudioStateChange}
          userLikes={userLikes}
          onLikeToggle={handleLike}
          currentUser={currentUser}
          productLinks={selectedVideo ? getProductLinksForVideo(selectedVideo.id) : []}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Explore;
