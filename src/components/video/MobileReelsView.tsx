
import React, { useState, useEffect, useRef } from 'react';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import { useMobileSwipe } from '@/hooks/useMobileSwipe'; // <-- use new swipe hook!

interface MobileReelsViewProps {
  currentId: string;
  videos: Video[];
  currentIndex: number;
  onClose: () => void;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
}

const MobileReelsView: React.FC<MobileReelsViewProps> = ({
  currentId,
  videos,
  currentIndex,
  onClose,
  globalAudioEnabled,
  onAudioStateChange
}) => {
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [swipeHint, setSwipeHint] = useState<boolean>(true);
  const { setIsInReelsMode } = useLayout();
  const [swipingDirection, setSwipingDirection] = useState<'up' | 'down' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 1
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(currentIndex);

  // Get current video from videos array
  const currentVideo = videos[activeVideoIndex] || videos[0];
  const prevVideo = videos[activeVideoIndex - 1];
  const nextVideo = videos[activeVideoIndex + 1];

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  // Handle robust, cross-browser vertical swipes
  const swipeHandlers = useMobileSwipe({
    onSwipe: (direction) => {
      if (direction === 'up' && activeVideoIndex < videos.length - 1) {
        setActiveVideoIndex(idx => {
          const newIndex = idx + 1;
          // Update history for SPA navigation
          const nextVideo = videos[newIndex];
          if (nextVideo) {
            window.history.replaceState({}, '', `/explore/${nextVideo.id}`);
          }
          return newIndex;
        });
      }
      if (direction === 'down' && activeVideoIndex > 0) {
        setActiveVideoIndex(idx => {
          const newIndex = idx - 1;
          const prevVideo = videos[newIndex];
          if (prevVideo) {
            window.history.replaceState({}, '', `/explore/${prevVideo.id}`);
          }
          return newIndex;
        });
      }
      // reset swipe transition state
      setSwipingDirection(null);
      setSwipeProgress(0);
    },
    onSwipeProgress: (direction, progress) => {
      setSwipingDirection(direction);
      setSwipeProgress(progress);
    },
    verticalOnly: true,
    thresholdPx: 72, // More forgiving for big screens
  });

  // Enable reels mode on mount, disable on unmount
  useEffect(() => {
    setIsInReelsMode(true);
    return () => { setIsInReelsMode(false); };
  }, [setIsInReelsMode]);

  // Reset to the correct index when videos or currentId changes
  useEffect(() => {
    if (videos.length > 0) {
      const index = videos.findIndex(v => v.id === currentId);
      if (index >= 0) setActiveVideoIndex(index);
    }
  }, [currentId, videos]);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    if (swipeHint) {
      const timer = setTimeout(() => {
        setSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [swipeHint]);

  // Reset swipe hint when video changes
  useEffect(() => {
    setSwipeHint(true);
  }, [currentVideo?.id]);

  // Calculate transform styles based on swipe progress
  const getTransformStyle = (position: 'prev' | 'current' | 'next') => {
    if (!swipingDirection) return {};
    const distance = 100 * swipeProgress; // percentage of screen height
    if (position === 'current') {
      return { 
        transform: swipingDirection === 'up' 
          ? `translateY(-${distance}%)` 
          : `translateY(${distance}%)`
      };
    } 
    else if (position === 'next' && swipingDirection === 'up') {
      return { transform: `translateY(${100 - distance}%)` };
    } 
    else if (position === 'prev' && swipingDirection === 'down') {
      return { transform: `translateY(-${100 - distance}%)` };
    }
    return {};
  };

  // Prevent scroll on mobile when swiping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventScroll = (e: TouchEvent) => {
      if (swipingDirection && Math.abs(e.touches[0].clientY - (e.touches[0] || {clientY:0}).clientY) > 2) {
        e.preventDefault();
      }
    };
    if (swipingDirection) {
      el.addEventListener('touchmove', preventScroll, { passive: false });
      return () => el.removeEventListener('touchmove', preventScroll);
    }
  }, [swipingDirection]);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      ref={containerRef}
      style={{ touchAction: 'pan-y' }}
      {...swipeHandlers}
    >
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
      
      <div className="relative w-full h-full">
        {/* Previous video */}
        {prevVideo && (
          <div 
            className="absolute inset-0 z-10 transform translate-y-[-100%] transition-transform duration-300 ease-out"
            style={getTransformStyle('prev')}
          >
            <VideoPlayer 
              video={prevVideo} 
              productLinks={[]} 
              autoPlay={false} 
              showControls={false}
              globalAudioEnabled={false}
              onAudioStateChange={() => {}}
              isFullscreen={true}
              className="w-full h-full" 
              objectFit="contain"
              useAspectRatio={false}
              showProgress={false}
              hideControls={true}
              onClick={() => {}}
            />
          </div>
        )}
        
        {/* Current video */}
        {currentVideo && (
          <div 
            className="absolute inset-0 z-20 transition-transform duration-300 ease-out"
            style={getTransformStyle('current')}
          >
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
              hideControls={true}
              onClick={() => {}}
            />
          </div>
        )}
        
        {/* Next video */}
        {nextVideo && (
          <div 
            className="absolute inset-0 z-10 transform translate-y-[100%] transition-transform duration-300 ease-out"
            style={getTransformStyle('next')}
          >
            <VideoPlayer 
              video={nextVideo} 
              productLinks={[]} 
              autoPlay={false} 
              showControls={false}
              globalAudioEnabled={false}
              onAudioStateChange={() => {}}
              isFullscreen={true}
              className="w-full h-full" 
              objectFit="contain"
              useAspectRatio={false}
              showProgress={false}
              hideControls={true}
              onClick={() => {}}
            />
          </div>
        )}
      </div>
      
      {/* Swipe hint */}
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
      {currentVideo && (
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
      )}
      
      {/* Action buttons */}
      {currentVideo && (
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
      )}
    </div>
  );
};

export default MobileReelsView;

