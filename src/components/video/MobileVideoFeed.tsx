
import React, { useState, useCallback } from 'react';
import { Video } from '@/types/video';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Swipeable } from '@/components/ui/swipeable';
import { Button } from '@/components/ui/button';
import { X, Share2, MessageCircle, Heart, MoreHorizontal, ShoppingCart } from 'lucide-react';

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

  const closeFullscreen = () => {
    setActiveVideoId(null);
  };

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
                
                {/* Fullscreen overlay controls */}
                {activeVideoId === video.id && (
                  <>
                    {/* Top controls */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeFullscreen();
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Right side controls */}
                    <div className="absolute bottom-20 right-4 flex flex-col gap-6 z-20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikeToggle(video.id, e);
                        }}
                      >
                        <Heart 
                          className="h-6 w-6" 
                          fill={userLikes[video.id] ? "currentColor" : "none"}
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <MessageCircle className="h-6 w-6" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <Share2 className="h-6 w-6" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <ShoppingCart className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Creator info */}
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
                  </>
                )}
              </div>
            </Swipeable>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileVideoFeed;
