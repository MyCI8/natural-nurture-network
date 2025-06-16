
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedSwipe } from '@/hooks/useOptimizedSwipe';
import VideoPreloader, { VideoElement } from './VideoPreloader';

interface MobileReelsContainerProps {
  currentId: string;
  videos: Video[];
  currentIndex: number;
  onClose: () => void;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
  onSwipeToNext: () => void;
  onSwipeToPrev: () => void;
}

const MobileReelsContainer: React.FC<MobileReelsContainerProps> = ({
  currentId,
  videos,
  currentIndex,
  onClose,
  globalAudioEnabled,
  onAudioStateChange,
  onSwipeToNext,
  onSwipeToPrev
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [audioEnabled, setAudioEnabled] = useState(globalAudioEnabled);
  const [videoStates, setVideoStates] = useState<Record<number, 'ready' | 'loading' | 'error'>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<number>(0);

  // Get current/prev/next video
  const currentVideo = videos[currentIndex];
  const prevVideo = videos[currentIndex - 1];
  const nextVideo = videos[currentIndex + 1];

  const handleVideoReady = useCallback((index: number) => {
    setVideoStates(prev => ({ ...prev, [index]: 'ready' }));
  }, []);

  const updateTransform = useCallback((progress: number, direction: 'up' | 'down') => {
    const container = containerRef.current;
    if (!container) return;

    const translateY = direction === 'up' ? -progress * 100 : progress * 100;
    transformRef.current = translateY;
    
    // Use transform3d for hardware acceleration
    container.style.transform = `translate3d(0, ${translateY}%, 0)`;
    container.style.willChange = 'transform';
  }, []);

  const resetTransform = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.transform = 'translate3d(0, 0, 0)';
    container.style.willChange = 'auto';
    transformRef.current = 0;
  }, []);

  const swipeCallbacks = {
    onSwipeStart: () => {
      // Optional: Add haptic feedback here
    },
    onSwipeProgress: (progress: number, direction: 'up' | 'down') => {
      setSwipeProgress(progress);
      setSwipeDirection(direction);
      updateTransform(progress, direction);
    },
    onSwipeEnd: (direction: 'up' | 'down', velocity: number) => {
      setSwipeProgress(0);
      setSwipeDirection(null);
      resetTransform();
      
      if (direction === 'up' && currentIndex < videos.length - 1) {
        onSwipeToNext();
      } else if (direction === 'down' && currentIndex > 0) {
        onSwipeToPrev();
      }
    },
    onSwipeCancel: () => {
      setSwipeProgress(0);
      setSwipeDirection(null);
      resetTransform();
    }
  };

  const swipeHandlers = useOptimizedSwipe(swipeCallbacks, {
    threshold: 70,
    velocityThreshold: 0.3,
    maxSwipeTime: 400,
    preventScroll: true
  });

  const toggleLike = useCallback((videoId: string) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  }, []);

  const handleMuteToggle = useCallback(() => {
    setAudioEnabled(prev => {
      const newValue = !prev;
      onAudioStateChange(!newValue);
      return newValue;
    });
  }, [onAudioStateChange]);

  // Update local audioEnabled when globalAudioEnabled changes
  useEffect(() => {
    setAudioEnabled(globalAudioEnabled);
  }, [globalAudioEnabled]);

  // Prevent default touch behaviors for smooth experience
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // Allow pinch zoom
      e.preventDefault();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchmove', preventDefault, { passive: false });
      return () => container.removeEventListener('touchmove', preventDefault);
    }
  }, []);

  if (!currentVideo) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <VideoPreloader
        videos={videos}
        currentIndex={currentIndex}
        onVideoReady={handleVideoReady}
        preloadRadius={2}
      />
      
      {/* Close button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-black/30 border-none hover:bg-black/50 text-white touch-manipulation"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Video container with hardware-accelerated transforms */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ touchAction: 'pan-y' }}
        {...swipeHandlers}
      >
        {/* Previous video */}
        {prevVideo && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'translate3d(0, -100%, 0)',
              willChange: swipeDirection === 'down' ? 'transform' : 'auto'
            }}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoPlayer 
            video={currentVideo} 
            productLinks={[]} 
            autoPlay={true} 
            showControls={false}
            globalAudioEnabled={audioEnabled}
            onAudioStateChange={setAudioEnabled}
            isFullscreen={true}
            className="w-full h-full"
            objectFit="contain"
            useAspectRatio={false}
            showProgress={true}
            hideControls={true}
            onClick={() => {}}
          />
        </div>
        
        {/* Next video */}
        {nextVideo && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'translate3d(0, 100%, 0)',
              willChange: swipeDirection === 'up' ? 'transform' : 'auto'
            }}
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
      
      {/* Video info overlay */}
      <div className="absolute bottom-28 left-4 right-20 z-20 pointer-events-none">
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
      
      {/* Action buttons */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-20 pointer-events-auto">
        {/* Like */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleLike(currentVideo.id)}
          className={cn(
            "bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 touch-manipulation",
            likedVideos[currentVideo.id] && "text-red-500"
          )}
        >
          <Heart className={cn("h-6 w-6", likedVideos[currentVideo.id] && "fill-current")} />
        </Button>
        
        {/* Comment */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 touch-manipulation"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Share */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 touch-manipulation"
        >
          <Share2 className="h-6 w-6" />
        </Button>

        {/* Audio Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={audioEnabled ? "Mute" : "Unmute"}
          onClick={handleMuteToggle}
          className={cn(
            "bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 touch-manipulation",
            !audioEnabled && "opacity-70"
          )}
        >
          {audioEnabled ? (
            <Volume2 className="h-6 w-6" />
          ) : (
            <VolumeX className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      {/* Swipe progress indicator (optional) */}
      {swipeProgress > 0.1 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className={cn(
            "w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-white",
            "transition-opacity duration-200",
            swipeProgress > 0.3 ? "opacity-100" : "opacity-50"
          )}>
            <ChevronDown 
              className={cn(
                "h-8 w-8 transition-transform duration-200",
                swipeDirection === 'up' ? "rotate-180" : "rotate-0"
              )} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileReelsContainer;
