
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, X } from 'lucide-react';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showShare, setShowShare] = React.useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
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
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShare(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShare(false);
      // You might want to show a toast here
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <div className="md:flex-1">
          <div className="aspect-video">
            <VideoPlayer video={video} autoPlay={false} showControls />
          </div>
        </div>

        <div className="md:w-[350px] border-l border-gray-200 dark:border-gray-800">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
                ) : (
                  <AvatarFallback>{video.creator?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium">{video.creator?.username || 'Anonymous'}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
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
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:text-[#4CAF50] transition-colors"
                  aria-label="Share video"
                  onClick={handleShare}
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
            </div>

            {/* Comments section will be implemented in the next phase */}
          </div>
        </div>
      </div>

      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="sm:max-w-md">
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Share this video</h2>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              Copy link
            </Button>
            {/* Additional share options will be implemented */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreDetail;
