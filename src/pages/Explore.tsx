import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video } from '@/types/video';
import type { UserProfileData } from '@/types/user';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<(Video & { creator: any }) | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Record<string, { id: string, content: string, username: string }[]>>({});
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [userProfileData, setUserProfileData] = useState<Record<string, UserProfileData>>({});
  const [isLoadingUserData, setIsLoadingUserData] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        
        const { data: likes } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', data.user.id);
          
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
  
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['explore-videos'],
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
          ),
          comments:video_comments(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map((video: any) => ({
        ...video,
        comments_count: video.comments?.[0]?.count || 0
      })) as (Video & { creator: any, comments_count: number })[];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ videoId, isLiked }: { videoId: string, isLiked: boolean }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      
      if (isLiked) {
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        return { videoId, liked: false };
      } else {
        const { error } = await supabase
          .from('video_likes')
          .insert([
            { video_id: videoId, user_id: currentUser.id }
          ]);
          
        if (error) throw error;
        return { videoId, liked: true };
      }
    },
    onSuccess: (data) => {
      setUserLikes(prev => ({
        ...prev,
        [data.videoId]: data.liked
      }));
      
      queryClient.invalidateQueries({ queryKey: ['explore-videos'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like",
        variant: "destructive"
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ videoId, comment }: { videoId: string, comment: string }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const { data, error } = await supabase
        .from('video_comments')
        .insert([
          { video_id: videoId, user_id: currentUser.id, content: comment }
        ])
        .select('id');
        
      if (error) throw error;
      return { videoId, comment, id: data[0].id };
    },
    onSuccess: (data) => {
      setCommentText('');
      setSubmittingCommentFor(null);
      
      // Create a new comment object to update local state
      const newComment = {
        id: data.id,
        content: data.comment,
        username: currentUser?.username || 'scoviumdesign'
      };
      
      // Update local comments state
      setLocalComments(prev => ({
        ...prev,
        [data.videoId]: [newComment, ...(prev[data.videoId] || [])]
      }));
      
      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ['explore-videos'] });
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!"
      });
    },
    onError: (error) => {
      setSubmittingCommentFor(null);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const fetchUserProfile = async (userId: string) => {
    if (isLoadingUserData[userId] || userProfileData[userId]) return;
    
    setIsLoadingUserData(prev => ({ ...prev, [userId]: true }));
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      const { data: recentVideos, error: videosError } = await supabase
        .from('videos')
        .select('id, thumbnail_url')
        .eq('creator_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (videosError) throw videosError;
      
      const { count: videosCount } = await supabase
        .from('videos')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', userId)
        .eq('status', 'published');
        
      setUserProfileData(prev => ({
        ...prev,
        [userId]: {
          id: userId,
          full_name: profile?.full_name,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          posts: recentVideos || [],
          posts_count: videosCount || 0,
          followers_count: 0,
          following_count: 0
        }
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingUserData(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleShare = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title || 'Check out this video',
          text: video.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it with others!",
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
        description: "Please log in to like videos",
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
        description: "Please log in to comment",
      });
      return;
    }
    
    setSubmittingCommentFor(videoId);
    commentMutation.mutate({ videoId, comment: commentText });
  };

  const handleNavigateToVideo = (videoId: string) => {
    navigate(`/explore/${videoId}`);
  };

  const handleUserHover = (userId: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoverPosition({ 
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });
    setHoveredUser(userId);
    fetchUserProfile(userId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-black">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="instagram-feed-item"
        >
          <div className="instagram-header">
            <Avatar className="h-8 w-8 border border-gray-200">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
              ) : (
                <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 text-left">
              <span 
                className="instagram-username" 
                onClick={() => navigate(`/users/${video.creator?.id}`)}
                onMouseEnter={(e) => handleUserHover(video.creator?.id, e)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                {video.creator?.username || 'Anonymous'}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-700">
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
              onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
              onClick={() => handleNavigateToVideo(video.id)}
              className="w-full h-full"
            />
          </div>

          <div className="instagram-actions">
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className={`p-0 hover:bg-transparent ${userLikes[video.id] ? 'text-red-500' : 'text-black dark:text-white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(video.id);
                }}
              >
                <Heart className={`h-6 w-6 ${userLikes[video.id] ? 'fill-current' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-0 hover:bg-transparent text-black dark:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateToVideo(video.id);
                }}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-0 hover:bg-transparent text-black dark:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(video);
                }}
              >
                <Share2 className="h-6 w-6" />
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

          <div className="instagram-likes">
            {video.likes_count || 0} likes
          </div>
          
          <div className="instagram-description">
            <span 
              className="font-semibold mr-2" 
              onClick={() => navigate(`/users/${video.creator?.id}`)}
              onMouseEnter={(e) => handleUserHover(video.creator?.id, e)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              {video.creator?.username}
            </span>
            {video.description}
          </div>
          
          {localComments[video.id]?.length > 0 && (
            <div className="px-4 text-left text-sm space-y-1">
              {localComments[video.id].map(comment => (
                <div key={comment.id} className="flex">
                  <span 
                    className="font-semibold mr-2"
                    onClick={() => navigate(`/users/${currentUser?.id}`)}
                    onMouseEnter={(e) => handleUserHover(currentUser?.id, e)}
                    onMouseLeave={() => setHoveredUser(null)}
                  >
                    {comment.username}
                  </span>
                  <span>{comment.content}</span>
                </div>
              ))}
            </div>
          )}
          
          <div 
            className="instagram-view-comments"
            onClick={() => handleNavigateToVideo(video.id)}
          >
            View all {video.comments_count || 0} comments
          </div>
          
          <div className="instagram-comment-input">
            {submittingCommentFor === video.id ? (
              <div className="flex items-center justify-center w-8 h-8">
                <Loader className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Add a comment..."
                className="text-sm border-none focus-visible:ring-0 px-0 h-auto py-1"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleComment(video.id);
                  }
                }}
              />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className={`text-blue-500 font-semibold ${!commentText.trim() || submittingCommentFor ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              disabled={!commentText.trim() || !!submittingCommentFor}
              onClick={() => handleComment(video.id)}
            >
              Post
            </Button>
          </div>
        </div>
      ))}

      {hoveredUser && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-[320px] overflow-hidden"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y + 10}px`
          }}
          onMouseEnter={() => setHoveredUser(hoveredUser)}
          onMouseLeave={() => setHoveredUser(null)}
        >
          {isLoadingUserData[hoveredUser] ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
              <div className="grid grid-cols-3 gap-[1px]">
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
              </div>
            </div>
          ) : userProfileData[hoveredUser] ? (
            <div>
              <div className="p-4 flex items-start gap-4">
                <Avatar className="h-14 w-14 border border-gray-200">
                  {userProfileData[hoveredUser]?.avatar_url ? (
                    <AvatarImage src={userProfileData[hoveredUser].avatar_url} alt={userProfileData[hoveredUser].full_name || ''} />
                  ) : (
                    <AvatarFallback><UserRound className="h-7 w-7" /></AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {userProfileData[hoveredUser]?.username || 'User'}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {userProfileData[hoveredUser]?.full_name || ''}
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 h-7"
                  >
                    Follow
                  </Button>
                </div>
              </div>
              
              <div className="flex border-y border-gray-200 dark:border-gray-700">
                <div className="flex-1 text-center py-2">
                  <div className="font-semibold">
                    {userProfileData[hoveredUser]?.posts_count || 0}
                  </div>
                  <div className="text-xs text-gray-500">posts</div>
                </div>
                <div className="flex-1 text-center py-2">
                  <div className="font-semibold">
                    {userProfileData[hoveredUser]?.followers_count || 0}
                  </div>
                  <div className="text-xs text-gray-500">followers</div>
                </div>
                <div className="flex-1 text-center py-2">
                  <div className="font-semibold">
                    {userProfileData[hoveredUser]?.following_count || 0}
                  </div>
                  <div className="text-xs text-gray-500">following</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-[1px] bg-gray-200 dark:bg-gray-700">
                {userProfileData[hoveredUser]?.posts?.length > 0 ? (
                  userProfileData[hoveredUser].posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="aspect-square bg-cover bg-center" 
                      style={{ 
                        backgroundImage: post.thumbnail_url ? `url(${post.thumbnail_url})` : undefined,
                        backgroundColor: post.thumbnail_url ? undefined : '#000'
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center p-4 text-center text-gray-500 text-xs">
                    <div>
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No posts yet
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Failed to load profile</div>
          )}
        </div>
      )}

      <VideoDialog
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
        userLikes={userLikes}
        onLikeToggle={handleLike}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Explore;
