import React, { useState, useEffect } from 'react';
import { Video, ProductLink } from '@/types/video';
import { isYoutubeVideo, isImagePost, isPlayableVideoFormat } from './utils/videoPlayerUtils';
import { isCarousel } from '@/utils/videoUtils';
import YouTubePlayer from './YouTubePlayer';
import NativeVideoPlayer from './NativeVideoPlayer';
import { toast } from 'sonner';

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
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  showProgress?: boolean;
  progressValue?: number;
  hideControls?: boolean;
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
  onTimeUpdate,
  showProgress = false,
  progressValue,
  hideControls = false
}) => {
  const [isMuted, setIsMuted] = useState(!globalAudioEnabled);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [localVisibleProductLink, setLocalVisibleProductLink] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Validate video data
  useEffect(() => {
    if (!video) {
      setVideoError("Invalid video data");
      return;
    }
    
    // For carousel posts, we only need media_files
    if (isCarousel(video.media_files)) {
      if (!video.media_files || video.media_files.length === 0) {
        setVideoError("No images available in carousel");
      } else {
        // Valid carousel, clear any errors
        setVideoError(null);
      }
      return;
    }
    
    // Otherwise check video_url
    if (!video.video_url) {
      setVideoError("Video URL is missing");
      return;
    }
    
    // Apply additional validation for playable formats
    if (!isYoutubeVideo(video.video_url) && !isImagePost(video.video_url) && !isPlayableVideoFormat(video.video_url)) {
      console.warn(`Video format may not be supported: ${video.video_url}`);
      // But don't set error yet - let the native player try anyway
    }
    
    // Reset error when video changes
    setVideoError(null);
  }, [video]);
  
  // Check if this is an image post or carousel
  const isImage = isImagePost(video.video_url);
  const isImageCarousel = isCarousel(video.media_files);
  
  // Effect to handle mute state changes based on global audio setting
  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
  }, [globalAudioEnabled]);
  
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

  // Default to 9:16 (portrait) for fullscreen mobile view, or use provided aspectRatio
  const feedAspectRatio = aspectRatio || (isFullscreen ? 9/16 : 4/5);
  
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

  // Error handling for missing video URL
  if (videoError && !isImageCarousel) {
    console.error("Video player error:", videoError, video);
    
    // Log detailed info about this video for debugging
    if (video) {
      console.log("Video ID:", video.id);
      console.log("Video URL:", video.video_url);
      console.log("Thumbnail URL:", video.thumbnail_url);
      console.log("Is carousel:", isImageCarousel);
      if (isImageCarousel) {
        console.log("Media files:", video.media_files);
      }
    }
    
    // Return a simple placeholder instead of throwing an error
    return (
      <div className={`${className || ''} bg-gray-900 flex items-center justify-center rounded-md overflow-hidden`} 
           style={useAspectRatio ? { aspectRatio: feedAspectRatio } : {}}>
        <div className="text-center p-4 text-white">
          <p>Unable to play this media</p>
          <p className="text-sm text-gray-400 mt-2">{videoError}</p>
          
          {/* Display thumbnail as fallback if available */}
          {video && video.thumbnail_url && (
            <div className="mt-3">
              <img 
                src={video.thumbnail_url} 
                alt={video.title || "Video thumbnail"} 
                className="max-h-32 mx-auto rounded-md object-contain"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

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
      autoPlay={autoPlay && !isImage && !isImageCarousel} // Don't autoplay images or carousels
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
      onTimeUpdate={onTimeUpdate}
      showProgress={showProgress}
      progressValue={progressValue}
      hideControls={hideControls}
    />
  );
};

export default VideoPlayer;
