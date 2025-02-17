
import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video } from '@/types/video';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleVideoClick = useCallback((videoId: string) => {
    navigate(`/videos/${videoId}`);
  }, [navigate]);

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
      // Trigger a refetch of the userLikes query
      await supabase.query.invalidate(['userLikes', currentUser.id]);
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
      // Trigger a refetch of the userSaves query
      await supabase.query.invalidate(['userSaves', currentUser.id]);
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
        <p>Loading videos...</p>
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
      <div className="max-w-[600px] mx-auto px-4">
        <div className="space-y-6 py-6">
          {!videos?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No videos available</p>
            </div>
          ) : (
            videos.map((video) => (
              <div 
                key={video.id} 
                className="bg-card rounded-xl overflow-hidden shadow-sm"
              >
                {/* Video Container */}
                <div 
                  className="w-full relative cursor-pointer" 
                  onClick={() => handleVideoClick(video.id)}
                >
                  <VideoPlayer
                    video={video}
                    autoPlay
                    showControls={false}
                  />

                  {/* Video Interaction Overlay */}
                  <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 z-20">
                    <button 
                      className={`transition-transform hover:scale-110 ${
                        userLikes?.includes(video.id) 
                          ? 'text-red-500' 
                          : 'text-white hover:text-primary'
                      }`}
                      onClick={(e) => handleLike(video.id, e)}
                    >
                      <Heart className="h-7 w-7" fill={userLikes?.includes(video.id) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      className="text-white hover:text-primary transition-transform hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick(video.id);
                      }}
                    >
                      <MessageCircle className="h-7 w-7" />
                    </button>
                    <button 
                      className={`transition-transform hover:scale-110 ${
                        userSaves?.includes(video.id) 
                          ? 'text-primary' 
                          : 'text-white hover:text-primary'
                      }`}
                      onClick={(e) => handleSave(video.id, e)}
                    >
                      <Bookmark 
                        className="h-7 w-7" 
                        fill={userSaves?.includes(video.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div 
                    className="flex items-center space-x-3 mb-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/users/${video.profiles.id}`);
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      {video.profiles.avatar_url ? (
                        <AvatarImage src={video.profiles.avatar_url} alt={video.profiles.full_name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {video.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium hover:text-primary transition-colors">
                      {video.profiles.full_name}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {video.description?.substring(0, 100)}
                    {video.description?.length > 100 && '...'}
                  </p>
                  
                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="mr-4">{video.likes_count || 0} likes</span>
                    <span>{video.views_count || 0} views</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
