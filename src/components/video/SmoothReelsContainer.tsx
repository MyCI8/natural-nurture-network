
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInstagramSwipe } from '@/hooks/useInstagramSwipe';
import VideoPreloader from './VideoPreloader';

interface SmoothReelsContainerProps {
  currentId: string;
  videos: Video[];
  currentIndex: number;
  onClose: () => void;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
  onSwipeToNext: () => void;
  onSwipeToPrev: () => void;
}

const SmoothReelsContainer: React.FC<SmoothReelsContainerProps> = ({
  currentId,
  videos,
  currentIndex,
  onClose,
  globalAudioEnabled,
  onAudioStateChange,
  onSwipeToNext,
  onSwipeToPrev
}) => {
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [audioEnabled, setAudioEnabled] = useState(globalAudioEnabled);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const prevVideoRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLDivElement>(null);
  const nextVideoRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<number>(0);

  const currentVideo = videos[currentIndex];
  const prevVideo = videos[currentIndex - 1];
  const nextVideo = videos[currentIndex + 1];

  // Apply transform to video elements with hardware acceleration
  const updateVideoTransforms = useCallback((deltaY: number, animate = false) => {
    const screenHeight = window.innerHeight;
    const progress = deltaY / screenHeight;
    
    // Apply transforms to each video individually
    const transforms = {
      prev: `translate3d(0, ${(-100 + progress * 100)}%, 0)`,
      current: `translate3d(0, ${progress * 100}%, 0)`,
      next: `translate3d(0, ${(100 + progress * 100)}%, 0)`
    };

    const duration = animate ? '0.3s' : '0s';
    const easing = animate ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';

    [
      { ref: prevVideoRef, transform: transforms.prev },
      { ref: currentVideoRef, transform: transforms.current },
      { ref: nextVideoRef, transform: transforms.next }
    ].forEach(({ ref, transform }) => {
      if (ref.current) {
        ref.current.style.transform = transform;
        ref.current.style.transition = animate ? `transform ${duration} ${easing}` : 'none';
        ref.current.style.willChange = animate ? 'auto' : 'transform';
      }
    });
  }, []);

  // Reset transforms to default positions
  const resetTransforms = useCallback((animate = true) => {
    updateVideoTransforms(0, animate);
    setSwipeProgress(0);
    setSwipeDirection(null);
  }, [updateVideoTransforms]);

  // Smooth momentum animation after swipe release
  const animateWithMomentum = useCallback((velocity: number, direction: 'up' | 'down') => {
    const startTime = performance.now();
    const startDelta = momentumRef.current;
    const targetDelta = direction === 'up' ? -window.innerHeight : window.innerHeight;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const duration = Math.max(200, Math.min(400, Math.abs(velocity * 100)));
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic bezier easing for natural feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentDelta = startDelta + (targetDelta - startDelta) * eased;
      
      updateVideoTransforms(currentDelta);
      momentumRef.current = currentDelta;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - trigger navigation
        setIsTransitioning(false);
        if (direction === 'up' && nextVideo) {
          onSwipeToNext();
        } else if (direction === 'down' && prevVideo) {
          onSwipeToPrev();
        }
        momentumRef.current = 0;
        resetTransforms(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [updateVideoTransforms, resetTransforms, onSwipeToNext, onSwipeToPrev, nextVideo, prevVideo]);

  const swipeCallbacks = {
    onSwipeStart: () => {
      setIsTransitioning(false);
    },
    onSwipeProgress: (progress: number, direction: 'up' | 'down', deltaY: number) => {
      if (isTransitioning) return;
      
      setSwipeProgress(progress);
      setSwipeDirection(direction);
      
      // Check boundaries and apply resistance
      const canGoUp = !!nextVideo;
      const canGoDown = !!prevVideo;
      
      let resistedDeltaY = deltaY;
      
      // Apply rubber band resistance at boundaries
      if ((direction === 'up' && !canGoUp) || (direction === 'down' && !canGoDown)) {
        const resistance = Math.pow(0.4, Math.abs(deltaY) / 150);
        resistedDeltaY = deltaY * resistance;
      }
      
      momentumRef.current = resistedDeltaY;
      updateVideoTransforms(resistedDeltaY);
    },
    onSwipeEnd: (direction: 'up' | 'down', velocity: number, shouldSnap: boolean) => {
      if (shouldSnap) {
        const canGoUp = !!nextVideo;
        const canGoDown = !!prevVideo;
        
        if ((direction === 'up' && canGoUp) || (direction === 'down' && canGoDown)) {
          setIsTransitioning(true);
          animateWithMomentum(velocity, direction);
        } else {
          // Bounce back with elastic animation
          resetTransforms(true);
        }
      } else {
        resetTransforms(true);
      }
    },
    onSwipeCancel: () => {
      resetTransforms(true);
    }
  };

  const swipeHandlers = useInstagramSwipe(swipeCallbacks, {
    threshold: 25,
    velocityThreshold: 0.15,
    snapBackThreshold: 0.25,
    resistance: 0.35
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

  // Reset transforms when video changes
  useEffect(() => {
    momentumRef.current = 0;
    resetTransforms(false);
  }, [currentIndex, resetTransforms]);

  if (!currentVideo) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <VideoPreloader
        videos={videos}
        currentIndex={currentIndex}
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
      
      {/* Video container with touch handlers */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ touchAction: 'pan-y' }}
        {...swipeHandlers}
      >
        {/* Previous video */}
        {prevVideo && (
          <div 
            ref={prevVideoRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              transform: 'translate3d(0, -100%, 0)',
              willChange: 'transform'
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
        <div 
          ref={currentVideoRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        >
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
            ref={nextVideoRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              transform: 'translate3d(0, 100%, 0)',
              willChange: 'transform'
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
      
      {/* Visual feedback for swipe progress */}
      {swipeProgress > 0.1 && !isTransitioning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className={cn(
            "w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-white",
            "transition-all duration-100",
            swipeProgress > 0.3 ? "opacity-100 scale-110" : "opacity-60 scale-100"
          )}>
            <ChevronDown 
              className={cn(
                "h-8 w-8 transition-transform duration-100",
                swipeDirection === 'up' ? "rotate-180" : "rotate-0"
              )} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmoothReelsContainer;
