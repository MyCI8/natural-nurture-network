
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Bookmark, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar } from '@/components/ui/avatar';

const VideoFeed = () => {
  const { toast } = useToast();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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

  // Fetch product links for current video
  const { data: productLinks } = useQuery({
    queryKey: ['productLinks', videos?.[currentVideoIndex]?.id],
    queryFn: async () => {
      if (!videos?.[currentVideoIndex]?.id) return [];
      
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', videos[currentVideoIndex].id);

      if (error) throw error;
      return data as ProductLink[];
    },
    enabled: !!videos?.[currentVideoIndex]?.id
  });

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

  if (!videos?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-16">
        <p className="text-muted-foreground mb-4">No videos available</p>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Upload a Video
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
          {videos.map((video, index) => (
            <div key={video.id} className="relative bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="aspect-video relative">
                <img
                  src={video.thumbnail_url || '/placeholder.svg'}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    className="text-white bg-black/50 hover:bg-black/70"
                    onClick={() => setCurrentVideoIndex(index)}
                  >
                    Play
                  </Button>
                </div>
              </div>
              
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
                
                <h3 className="font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {video.description?.substring(0, 100)}
                  {video.description?.length > 100 ? '...' : ''}
                </p>
                
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <button className="hover:text-primary transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="hover:text-primary transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                    <button className="hover:text-primary transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                  <button className="hover:text-primary transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="mr-4">{video.likes_count || 0} likes</span>
                  <span>{video.views_count || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal would go here */}
    </div>
  );
};

export default VideoFeed;
