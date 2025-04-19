
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
  React.useEffect(() => {
    setIsMuted(!globalAudioEnabled);
  }, [globalAudioEnabled]);
  
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
  };

  const feedAspectRatio = aspectRatio || 4/5;

  // Filter product links for fullscreen/detail view to remove them from the video player
  const activeProductLinks = isFullscreen ? [] : productLinks;

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
      productLinks={activeProductLinks}
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
