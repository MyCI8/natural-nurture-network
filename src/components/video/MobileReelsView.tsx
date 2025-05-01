
import React, { useState } from 'react';
import { Video } from '@/types/video';
import { Swipeable } from '@/components/ui/swipeable';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileReelsViewProps {
  currentVideo: Video;
  adjacentVideos: Video[];
  currentIndex: number;
  onClose: () => void;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
  onSwipeNavigate: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

const MobileReelsView: React.FC<MobileReelsViewProps> = ({
  currentVideo,
  adjacentVideos,
  currentIndex,
  onClose,
  globalAudioEnabled,
  onAudioStateChange,
  onSwipeNavigate
}) => {
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [swipeHint, setSwipeHint] = useState<boolean>(true);

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  // Hide swipe hint after 3 seconds
  React.useEffect(() => {
    if (swipeHint) {
      const timer = setTimeout(() => {
        setSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [swipeHint]);

  // Reset swipe hint when video changes
  React.useEffect(() => {
    setSwipeHint(true);
  }, [currentVideo.id]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button at top */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-black/30 border-none hover:bg-black/50 text-white"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Navigation indicator */}
      {adjacentVideos.length > 1 && (
        <div className="absolute top-4 right-4 z-40">
          <div className="text-white bg-black/30 px-3 py-1 rounded-full text-xs">
            {currentIndex + 1} / {adjacentVideos.length}
          </div>
        </div>
      )}
      
      {/* Main video display with swipe gestures */}
      <Swipeable 
        onSwipe={onSwipeNavigate} 
        threshold={80}
        disableScroll={true}
        className="flex-1 touch-manipulation relative"
      >
        <div className="w-full h-full bg-black flex items-center justify-center">
          <VideoPlayer 
            video={currentVideo} 
            productLinks={[]} 
            autoPlay={true} 
            showControls={false}
            globalAudioEnabled={globalAudioEnabled}
            onAudioStateChange={onAudioStateChange}
            isFullscreen={true}
            className="w-full h-full" 
            objectFit="contain"
            useAspectRatio={false}
            showProgress={true}
            onClick={() => {}} // Prevent default click behavior
          />
        </div>
        
        {/* Swipe hint overlay - shows briefly on load */}
        {swipeHint && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-none">
            <div className="text-white text-center space-y-4">
              <div className="animate-bounce">
                <div className="flex flex-col items-center gap-1">
                  <ChevronDown className="h-8 w-8" />
                  <p className="text-sm font-medium">Swipe for more videos</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Video info overlay */}
        <div className="absolute bottom-28 left-4 right-16 z-20 pointer-events-none">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              {currentVideo.creator?.avatar_url ? (
                <AvatarImage src={currentVideo.creator.avatar_url} alt={currentVideo.creator?.username || ''} />
              ) : (
                <AvatarFallback>
                  {currentVideo.creator?.username?.[0] || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-white">
              <div className="font-semibold text-sm">
                {currentVideo.creator?.username || 'Anonymous'}
              </div>
              <div className="mt-1 text-sm opacity-90 line-clamp-2">
                {currentVideo.description || currentVideo.title}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons on right side */}
        <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLike(currentVideo.id)}
            className={cn(
              "bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12",
              likedVideos[currentVideo.id] && "text-red-500"
            )}
          >
            <Heart className={cn("h-6 w-6", likedVideos[currentVideo.id] && "fill-current")} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </Swipeable>
    </div>
  );
};

export default MobileReelsView;
