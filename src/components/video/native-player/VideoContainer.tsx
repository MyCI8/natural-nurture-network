
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { useGestures } from '@/hooks/useGestures';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoContainerProps {
  video: Video;
  autoPlay?: boolean;
  isMuted: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  playbackStarted: boolean;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
  video,
  autoPlay = true,
  isMuted,
  showControls = false,
  isFullscreen = false,
  videoRef,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  playbackStarted,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scale, translateX, translateY, isZoomed } = useGestures(containerRef);
  const isMobile = useIsMobile();
  
  // Add access to layout context to control mobile header visibility
  const { setMobileHeaderVisible } = useLayout();
  
  // Hide mobile header when video is interacted with (mobile only)
  useEffect(() => {
    if (isFullscreen && isMobile) {
      // Hide the mobile header when in fullscreen mode
      setMobileHeaderVisible(false);
      
      // Show header again when component unmounts or exits fullscreen
      return () => {
        setMobileHeaderVisible(true);
      };
    }
  }, [isFullscreen, setMobileHeaderVisible, isMobile]);

  // Track video view status
  useEffect(() => {
    if (playbackStarted && video?.id) {
      console.log(`Video ${video.id} playback started, tracking view`);
    }
  }, [playbackStarted, video?.id]);

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full bg-black"
    >
      {useAspectRatio ? (
        <div
          className="relative w-full max-w-full overflow-hidden touch-manipulation"
          style={{ aspectRatio: `${feedAspectRatio}` }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: isMobile ? `scale(${scale}) translate(${translateX}px, ${translateY}px)` : 'none',
              transition: isZoomed ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <video
              ref={videoRef}
              src={video?.video_url || ''}
              autoPlay={autoPlay}
              loop
              muted={isMuted}
              playsInline
              controls={showControls}
              poster={video?.thumbnail_url}
              className={cn(
                "max-h-full max-w-full",
                isMobile ? "touch-manipulation" : "",
                objectFit === 'contain' ? 'object-contain' : 'object-cover'
              )}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: isMobile ? `scale(${scale}) translate(${translateX}px, ${translateY}px)` : 'none',
            transition: isZoomed ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <video
            ref={videoRef}
            src={video?.video_url || ''}
            autoPlay={autoPlay}
            loop
            muted={isMuted}
            playsInline
            controls={showControls}
            poster={video?.thumbnail_url}
            className={cn(
              "max-h-full max-w-full w-full h-full",
              isMobile ? "touch-manipulation" : "",
              objectFit === 'contain' ? 'object-contain' : 'object-cover'
            )}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
