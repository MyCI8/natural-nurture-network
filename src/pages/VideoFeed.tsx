
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video } from '@/types/video';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Comments from '@/components/video/Comments';
import VideoDialog from '@/components/video/VideoDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const isMobile = useIsMobile();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:creator_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Video & { profiles: { id: string; full_name: string; avatar_url: string | null } })[];
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: userLikes } = useQuery({
    queryKey: ['userLikes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(like => like.video_id);
    },
    enabled: !!currentUser,
  });

  const { data: userSaves } = useQuery({
    queryKey: ['userSaves', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data.map(save => save.video_id);
    },
    enabled: !!currentUser,
  });

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  const handleLike = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isLiked = userLikes?.includes(videoId);
    try {
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('video_likes')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userLikes', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const isSaved = userSaves?.includes(videoId);
    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('saved_posts')
          .insert({ user_id: currentUser.id, video_id: videoId });
      }
      queryClient.invalidateQueries({ queryKey: ['userSaves', currentUser.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <p className="text-[#666666]">Loading videos...</p>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load videos. Please try again.",
      variant: "destructive",
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className={`mx-auto px-2 sm:px-4 ${isMobile ? 'max-w-full' : 'max-w-[600px]'}`}>
        <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
          {!videos?.length ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-[#666666] mb-4">No videos available</p>
            </div>
          ) : (
            videos.map((video) => (
              <div 
                key={video.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
              >
                {/* User Info */}
                <div 
                  className="flex items-center space-x-3 p-3 sm:p-4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (video.profiles?.id) {
                      navigate(`/users/${video.profiles.id}`);
                    }
                  }}
                >
                  <Avatar className="h-8 w-8">
                    {video.profiles?.avatar_url ? (
                      <AvatarImage src={video.profiles.avatar_url} alt={video.profiles?.full_name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                        {video.profiles?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium hover:text-[#4CAF50] transition-colors">
                    {video.profiles?.full_name || 'Anonymous User'}
                  </span>
                </div>

                {/* Video Container */}
                <div 
                  className="w-full relative cursor-pointer" 
                  onClick={() => handleVideoClick(video)}
                >
                  <VideoPlayer
                    video={video}
                    autoPlay
                    showControls={false}
                  />
                </div>

                {/* Rearranged action buttons: chat, save, share directly below media */}
                <div className="flex items-center justify-around sm:justify-start sm:space-x-4 mb-3 pt-3 px-3 sm:px-4">
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-[#666666] hover:text-[#4CAF50] transition-transform hover:scale-110 touch-manipulation"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    size="icon"
                    className={`h-11 w-11 transition-transform hover:scale-110 touch-manipulation ${
                      userSaves?.includes(video.id) 
                        ? 'text-[#4CAF50]' 
                        : 'text-[#666666] hover:text-[#4CAF50]'
                    }`}
                    onClick={(e) => handleSave(video.id, e)}
                  >
                    <Bookmark 
                      className="h-6 w-6" 
                      fill={userSaves?.includes(video.id) ? "currentColor" : "none"}
                    />
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-[#666666] hover:text-[#4CAF50] transition-transform hover:scale-110 touch-manipulation"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>

                {/* Video Description and Likes */}
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <p className="text-sm text-[#666666] text-left mb-2">
                    {video.description?.substring(0, 100)}
                    {video.description?.length > 100 && '...'}
                  </p>
                  
                  {/* Moved likes count with heart icon to the bottom */}
                  <div className="mt-2 mb-3 text-sm text-[#666666] flex items-center space-x-2">
                    <span className="mr-1">{video.likes_count || 0} likes</span>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 p-0 transition-transform hover:scale-110 ${
                        userLikes?.includes(video.id) 
                          ? 'text-red-500' 
                          : 'text-[#666666] hover:text-[#4CAF50]'
                      }`}
                      onClick={(e) => handleLike(video.id, e)}
                    >
                      <Heart className="h-5 w-5" fill={userLikes?.includes(video.id) ? "currentColor" : "none"} />
                    </Button>
                    <span className="ml-2">{video.views_count || 0} views</span>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-1">
                    <Comments videoId={video.id} currentUser={currentUser} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <VideoDialog
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default VideoFeed;
