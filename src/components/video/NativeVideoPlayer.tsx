
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video, ProductLink } from '@/types/video';
import VideoContainer from './native-player/VideoContainer';
import ProductLinksOverlay from './native-player/ProductLinksOverlay';
import { useVideoVisibility } from './native-player/useVideoVisibility';

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
  
  // Use the visibility hook to handle autoplay and visibility tracking
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

  // Handle zoom changes
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
        "relative overflow-hidden bg-black h-full w-full touch-manipulation", 
        isFullscreen ? "fixed inset-0 z-10" : "",
        className
      )}
      onClick={() => {
        if (!isZoomed && onClick) onClick();
      }}
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
