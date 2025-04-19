
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Video, ProductLink } from '@/types/video';
import VideoContainer from './native-player/VideoContainer';
import ProductLinksOverlay from './native-player/ProductLinksOverlay';
import { useVideoVisibility } from './native-player/useVideoVisibility';
import { Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NativeVideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  isMuted: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  toggleProductLink: (linkId: string) => void;
  playbackStarted: boolean;
  setPlaybackStarted: (started: boolean) => void;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  onInView?: (inView: boolean) => void;
  onZoomChange?: (isZoomed: boolean) => void;
  isZoomed?: boolean;
}

const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  video,
  productLinks = [],
  autoPlay = true,
  isMuted,
  showControls = false,
  isFullscreen = false,
  className,
  visibleProductLink,
  onClick,
  onClose,
  onMuteToggle,
  toggleProductLink,
  playbackStarted,
  setPlaybackStarted,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  onInView,
  onZoomChange,
  isZoomed = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  
  useVideoVisibility(
    videoRef,
    containerRef,
    autoPlay,
    isFullscreen,
    showControls,
    video.id,
    playbackStarted,
    setPlaybackStarted,
    onInView
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const element = mutation.target as HTMLElement;
          const transform = element.style.transform;
          const isCurrentlyZoomed = transform && !transform.includes('scale(1)');
          onZoomChange?.(isCurrentlyZoomed);
        }
      });
    });

    const videoContainer = containerRef.current?.querySelector('div > div');
    if (videoContainer) {
      observer.observe(videoContainer, { attributes: true });
    }

    return () => observer.disconnect();
  }, [onZoomChange]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden h-full w-full touch-manipulation", 
        isFullscreen ? "fixed inset-0 z-10" : "",
        className
      )}
      onClick={() => {
        if (!isZoomed && onClick) onClick();
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <VideoContainer 
        video={video}
        autoPlay={autoPlay}
        isMuted={isMuted}
        showControls={showControls}
        isFullscreen={isFullscreen}
        videoRef={videoRef}
        useAspectRatio={useAspectRatio}
        feedAspectRatio={feedAspectRatio}
        objectFit={objectFit}
        playbackStarted={playbackStarted}
      />

      {!isMobile && isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between pointer-events-none">
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation pointer-events-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon"
            onClick={onMuteToggle}
            className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation pointer-events-auto"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      )}

      <ProductLinksOverlay 
        productLinks={productLinks}
        visibleProductLink={visibleProductLink}
        toggleProductLink={toggleProductLink}
        disabled={isZoomed}
      />
    </div>
  );
};

export default NativeVideoPlayer;
