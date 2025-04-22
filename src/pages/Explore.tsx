import React, { useState, useEffect } from 'react';
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
import '../styles/explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<(Video & {
    creator: any;
  }) | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Record<string, {
    id: string;
    content: string;
    username: string;
  }[]>>({});
  const [visibleProductLinkByVideo, setVisibleProductLinkByVideo] = useState<{ [videoId: string]: string | null }>({});

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

  const handleProductButtonClick = (videoId: string) => {
    const links = getProductLinksForVideo(videoId);
    if (!links.length) {
      toast({
        title: "No products",
        description: "No products linked to this video.",
        variant: "default"
      });
      return;
    }
    setVisibleProductLinkByVideo(prev => {
      const curr = prev[videoId];
      return {
        ...prev,
        [videoId]: curr ? null : links[0].id
      };
    });
  };

  const handleToggleProductLink = (videoId: string, linkId: string) => {
    setVisibleProductLinkByVideo(prev => ({
      ...prev,
      [videoId]: prev[videoId] === linkId ? null : linkId,
    }));
  };

  const getProductLinksForVideo = (videoId: string) => {
    return allProductLinks.filter(link => link.video_id === videoId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen dark:text-dm-text">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-dm-background">
      {videos.map(video => (
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
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-dm-text">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          <div 
            className="instagram-video-container" 
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
              productLinks={getProductLinksForVideo(video.id)}
              visibleProductLink={visibleProductLinkByVideo[video.id] || null}
              toggleProductLink={(linkId) => handleToggleProductLink(video.id, linkId)}
            />
          </div>

          <div className="instagram-actions flex items-center gap-4 justify-between w-full px-2 py-2">
            <div className="flex gap-4 flex-shrink-0">
              <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent text-black dark:text-dm-text touch-manipulation" onClick={e => {
                e.stopPropagation();
                handleNavigateToVideo(video.id);
              }}>
                <MessageCircle className="h-6 w-6" />
              </Button>
              
              <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent text-black dark:text-dm-text touch-manipulation">
                <Bookmark className="h-6 w-6" />
              </Button>
              
              <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent text-black dark:text-dm-text touch-manipulation" onClick={e => {
                e.stopPropagation();
                handleShare(video);
              }}>
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                handleProductButtonClick(video.id);
              }}
              aria-label="View product"
              className="ml-auto rounded-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white shadow-lg touch-manipulation transition-colors"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <ShoppingCart className="h-6 w-6" />
            </Button>
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
      ))}

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
  );
};

export default Explore;
