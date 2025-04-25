
import React, { useState, useCallback } from 'react';
import { Video } from '@/types/video';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Swipeable } from '@/components/ui/swipeable';

interface MobileVideoFeedProps {
  videos: Video[];
  userLikes: Record<string, boolean>;
  onLikeToggle: (videoId: string, e?: React.MouseEvent) => void;
  currentUser: any;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
}

const MobileVideoFeed: React.FC<MobileVideoFeedProps> = ({
  videos,
  userLikes,
  onLikeToggle,
  currentUser,
  globalAudioEnabled,
  onAudioStateChange,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handleVideoClick = useCallback((videoId: string) => {
    setActiveVideoId(prevId => prevId === videoId ? null : videoId);
  }, []);

  const handleSwipe = useCallback((direction: 'up' | 'down', currentVideoId: string) => {
    const currentIndex = videos.findIndex(v => v.id === currentVideoId);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex < videos.length - 1) {
      setActiveVideoId(videos[currentIndex + 1].id);
    } else if (direction === 'down' && currentIndex > 0) {
      setActiveVideoId(videos[currentIndex - 1].id);
    }
  }, [videos]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-full">
        <div className="space-y-4 py-4">
          {videos.map((video) => (
            <Swipeable
              key={video.id}
              onSwipe={(direction) => {
                if (activeVideoId === video.id && (direction === 'up' || direction === 'down')) {
                  handleSwipe(direction, video.id);
                }
              }}
              className={`relative ${
                activeVideoId === video.id
                  ? 'fixed top-0 left-0 right-0 z-50 h-[calc(100vh-4rem)] bg-black'
                  : 'h-[80vh] bg-black rounded-lg overflow-hidden'
              }`}
            >
              <div className="relative w-full h-full" onClick={() => handleVideoClick(video.id)}>
                <VideoPlayer
                  video={video}
                  autoPlay
                  showControls={false}
                  globalAudioEnabled={globalAudioEnabled}
                  onAudioStateChange={onAudioStateChange}
                  isFullscreen={activeVideoId === video.id}
                  className="w-full h-full"
                  useAspectRatio={false}
                  objectFit="cover"
                />
                
                {/* Creator info overlay */}
                <div className="absolute bottom-20 left-4 z-20 flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    {video.creator?.avatar_url ? (
                      <AvatarImage src={video.creator.avatar_url} alt={video.creator?.full_name || ''} />
                    ) : (
                      <AvatarFallback>
                        {video.creator?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-white">
                    <div className="font-semibold">{video.creator?.full_name || 'Anonymous'}</div>
                    <div className="text-sm opacity-90">{video.description}</div>
                  </div>
                </div>
              </div>
            </Swipeable>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileVideoFeed;
