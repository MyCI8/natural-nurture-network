
import React, { useState } from 'react';
import { Video, ProductLink } from '@/types/video';
import { isYoutubeVideo } from './utils/videoPlayerUtils';
import YouTubePlayer from './YouTubePlayer';
import NativeVideoPlayer from './NativeVideoPlayer';

interface VideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  showControls?: boolean;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  isFullscreen?: boolean;
  className?: string;
  onClose?: () => void;
  onClick?: () => void;
  aspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  useAspectRatio?: boolean;
  visibleProductLink?: string | null;
  toggleProductLink?: (linkId: string) => void;
  isMuted?: boolean; // Added isMuted prop to the interface
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  productLinks = [], 
  autoPlay = true,
  showControls = false,
  globalAudioEnabled = false,
  onAudioStateChange,
  isFullscreen = false,
  className,
  onClose,
  onClick,
  aspectRatio,
  objectFit = 'contain',
  useAspectRatio = true,
  visibleProductLink = null,
  toggleProductLink,
  isMuted: propIsMuted
}) => {
  // If prop is provided, use it, otherwise default based on globalAudioEnabled
  const [isMuted, setIsMuted] = useState(
    propIsMuted !== undefined ? propIsMuted : !globalAudioEnabled
  );
  
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [localVisibleProductLink, setLocalVisibleProductLink] = useState<string | null>(null);
  
  // Effect to handle mute state changes based on external props or global audio setting
  React.useEffect(() => {
    if (propIsMuted !== undefined) {
      setIsMuted(propIsMuted);
    } else {
      setIsMuted(!globalAudioEnabled);
    }
  }, [globalAudioEnabled, propIsMuted]);
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onAudioStateChange?.(!newMutedState);
  };

  const handleToggleProductLink = (linkId: string) => {
    if (toggleProductLink) {
      toggleProductLink(linkId);
    } else {
      // Use local state if no external handler is provided
      if (localVisibleProductLink === linkId) {
        setLocalVisibleProductLink(null);
      } else {
        setLocalVisibleProductLink(linkId);
      }
    }
  };
  
  const handleInView = (inView: boolean) => {
    // This can be used for additional visibility logic if needed
    console.log(`Video is ${inView ? 'in view' : 'out of view'}`);
  };

  const feedAspectRatio = aspectRatio || 4/5;
  
  // Use provided visibleProductLink if available, otherwise fall back to local state
  const activeProductLink = visibleProductLink !== undefined ? visibleProductLink : localVisibleProductLink;

  // Filter product links for fullscreen/detail view to remove them from the video player
  const activeProductLinks = isFullscreen ? [] : productLinks;

  // Handle touch interactions
  const handleVideoTouch = () => {
    if (onClick) {
      onClick();
    }
  };

  // Render the appropriate player based on video type
  if (isYoutubeVideo(video.video_url)) {
    return (
      <YouTubePlayer
        video={video}
        productLinks={activeProductLinks}
        autoPlay={autoPlay}
        isMuted={isMuted}
        showControls={showControls}
        isFullscreen={isFullscreen}
        className={className}
        visibleProductLink={activeProductLink}
        onClick={onClick}
        onClose={onClose}
        toggleProductLink={handleToggleProductLink}
        useAspectRatio={useAspectRatio}
        feedAspectRatio={feedAspectRatio}
      />
    );
  }

  return (
    <NativeVideoPlayer
      video={video}
      productLinks={activeProductLinks}
      autoPlay={autoPlay}
      isMuted={isMuted}
      showControls={showControls}
      isFullscreen={isFullscreen}
      className={className}
      visibleProductLink={activeProductLink}
      onClick={onClick}
      onClose={onClose}
      onMuteToggle={toggleMute}
      toggleProductLink={handleToggleProductLink}
      playbackStarted={playbackStarted}
      setPlaybackStarted={setPlaybackStarted}
      useAspectRatio={useAspectRatio}
      feedAspectRatio={feedAspectRatio}
      objectFit={objectFit}
      onInView={handleInView}
    />
  );
};

export default VideoPlayer;
