
import React, { useState, useEffect } from 'react';
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
  useAspectRatio = true
}) => {
  const [isMuted, setIsMuted] = useState(!globalAudioEnabled);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [visibleProductLink, setVisibleProductLink] = useState<string | null>(null);
  
  // Effect to handle mute state changes based on global audio setting
  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
  }, [globalAudioEnabled]);
  
  // Effect to log when the fullscreen state changes
  useEffect(() => {
    if (isFullscreen) {
      console.log('Video player is in fullscreen mode');
    }
  }, [isFullscreen]);
  
  // Effect to listen for product link show events
  useEffect(() => {
    const handleShowProductLink = (e: CustomEvent) => {
      if (e.detail && e.detail.linkId) {
        setVisibleProductLink(e.detail.linkId);
      }
    };
    
    window.addEventListener('show-product-link', handleShowProductLink as EventListener);
    
    return () => {
      window.removeEventListener('show-product-link', handleShowProductLink as EventListener);
    };
  }, []);
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onAudioStateChange?.(!newMutedState);
  };

  const toggleProductLink = (linkId: string) => {
    if (visibleProductLink === linkId) {
      setVisibleProductLink(null);
    } else {
      setVisibleProductLink(linkId);
    }
  };
  
  const handleInView = (inView: boolean) => {
    // This can be used for additional visibility logic if needed
    console.log(`Video is ${inView ? 'in view' : 'out of view'}`);
    
    // When entering fullscreen view, unmute the video if global audio is enabled
    if (inView && isFullscreen && globalAudioEnabled) {
      setIsMuted(false);
    }
  };

  const feedAspectRatio = aspectRatio || 4/5;

  // Render the appropriate player based on video type
  if (isYoutubeVideo(video.video_url)) {
    return (
      <YouTubePlayer
        video={video}
        productLinks={productLinks}
        autoPlay={autoPlay}
        isMuted={isMuted}
        showControls={showControls}
        isFullscreen={isFullscreen}
        className={className}
        visibleProductLink={visibleProductLink}
        onClick={onClick}
        onClose={onClose}
        toggleProductLink={toggleProductLink}
        useAspectRatio={useAspectRatio}
        feedAspectRatio={feedAspectRatio}
      />
    );
  }

  return (
    <NativeVideoPlayer
      video={video}
      productLinks={productLinks}
      autoPlay={autoPlay}
      isMuted={isMuted}
      showControls={showControls}
      isFullscreen={isFullscreen}
      className={className}
      visibleProductLink={visibleProductLink}
      onClick={onClick}
      onClose={onClose}
      onMuteToggle={toggleMute}
      toggleProductLink={toggleProductLink}
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
