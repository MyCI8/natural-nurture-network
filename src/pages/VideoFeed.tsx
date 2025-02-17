
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Bookmark, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar } from '@/components/ui/avatar';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch videos
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

  const handleVideoClick = (videoId: string) => {
    navigate(`/videos/${videoId}`);
  };

  const handleUploadClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="sticky top-16 z-10 py-4 bg-background/80 backdrop-blur-sm border-b">
          <Button onClick={handleUploadClick} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Upload Video
          </Button>
        </div>

        <div className="space-y-6 py-6">
          {!videos?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No videos available</p>
              <Button onClick={handleUploadClick}>
                <Plus className="mr-2 h-4 w-4" /> Upload a Video
              </Button>
            </div>
          ) : (
            videos.map((video) => (
              <div 
                key={video.id} 
                className="bg-card rounded-lg overflow-hidden shadow-sm"
              >
                {/* Video Player */}
                <div className="aspect-[9/16] bg-black relative" onClick={() => handleVideoClick(video.id)}>
                  <VideoPlayer
                    video={video}
                    autoPlay
                    showControls={false}
                  />
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      {video.profiles.avatar_url ? (
                        <img src={video.profiles.avatar_url} alt={video.profiles.full_name} />
                      ) : (
                        <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-semibold">
                          {video.profiles.full_name.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                    <span className="font-medium">{video.profiles.full_name}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {video.description?.substring(0, 100)}
                    {video.description?.length > 100 ? '...' : ''}
                  </p>
                  
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <button className="hover:text-primary transition-colors">
                        <Heart className="h-6 w-6" />
                      </button>
                      <button className="hover:text-primary transition-colors" onClick={() => handleVideoClick(video.id)}>
                        <MessageCircle className="h-6 w-6" />
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <Share2 className="h-6 w-6" />
                      </button>
                    </div>
                    <button className="hover:text-primary transition-colors">
                      <Bookmark className="h-6 w-6" />
                    </button>
                  </div>
                  
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
