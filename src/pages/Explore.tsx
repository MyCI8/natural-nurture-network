
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types/video';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<(Video & { creator: any }) | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  
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
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Video & { creator: any })[];
    },
  });

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
      // Fallback to copying link
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-[600px] mx-auto">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="bg-white dark:bg-gray-900 mb-4 rounded-lg overflow-hidden"
        >
          <div 
            className="p-4 flex items-center space-x-2"
            onClick={() => navigate(`/users/${video.creator?.id}`)}
            role="button"
            aria-label={`View ${video.creator?.username}'s profile`}
          >
            <Avatar className="h-8 w-8">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
              ) : (
                <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium hover:text-[#4CAF50] transition-colors">
              {video.creator?.username || 'Anonymous'}
            </span>
          </div>

          <div 
            className="aspect-video cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <VideoPlayer 
              video={video} 
              autoPlay 
              showControls={false}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
            />
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Like video"
                >
                  <Heart className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Comment on video"
                  onClick={() => navigate(`/explore/${video.id}`)}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Share video"
                  onClick={() => handleShare(video)}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:text-[#4CAF50] transition-colors"
                aria-label="Save video"
              >
                <Bookmark className="h-6 w-6" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {video.likes_count || 0} likes
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium mr-2">{video.creator?.username}</span>
                {video.description}
              </p>
              <button 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => navigate(`/explore/${video.id}`)}
              >
                View all comments
              </button>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden">
          {selectedVideo && (
            <VideoPlayer 
              video={selectedVideo}
              autoPlay
              showControls={true}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={(isMuted) => setGlobalAudioEnabled(!isMuted)}
              isFullscreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Explore;
