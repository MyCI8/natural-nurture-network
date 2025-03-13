import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Video } from '@/types/video';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Comments from '@/components/video/Comments';
import VideoDialog from '@/components/video/VideoDialog';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
      }
    };
    
    fetchUser();
  }, []);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Video[];
    },
  });

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="video-feed-container">
      <div className="video-list">
        {videos.map((video) => (
          <div key={video.id} className="video-item" onClick={() => handleVideoSelect(video)}>
            <VideoPlayer video={video} />
            <div className="video-info">
              <Avatar>
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.full_name || ''} />
                ) : (
                  <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                )}
              </Avatar>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="video-details-container">
          <VideoPlayer video={selectedVideo} />
          <Comments videoId={selectedVideo.id} currentUser={currentUser} />
        </div>
      )}

      <VideoDialog
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};

export default VideoFeed;
