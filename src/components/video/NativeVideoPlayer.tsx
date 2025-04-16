
import React, { useRef } from 'react';
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
  onInView
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

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black", 
        className
      )}
      onClick={() => onClick?.()}
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
      />
    </div>
  );
};

export default NativeVideoPlayer;
