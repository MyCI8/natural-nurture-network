
import React from 'react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Video } from '@/types/video';

interface VideoContainerProps {
  video: Video;
  autoPlay: boolean;
  isMuted: boolean;
  showControls: boolean;
  isFullscreen: boolean;
  className?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  playbackStarted: boolean;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
  video,
  autoPlay,
  isMuted,
  showControls,
  isFullscreen,
  className,
  videoRef,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  playbackStarted
}) => {
  const getVideoStyle = () => {
    if (isFullscreen) {
      return {
        objectFit: objectFit, 
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
      };
    }
    
    return {
      objectFit, 
      width: '100%',
      height: '100%',
    };
  };

  if (isFullscreen) {
    return (
      <video
        ref={videoRef}
        src={video.video_url || undefined}
        className={cn("w-full h-full", className)}
        style={getVideoStyle()}
        loop
        muted={isMuted}
        playsInline
        controls={showControls}
        poster={video.thumbnail_url || undefined}
        preload="metadata"
        autoPlay={autoPlay}
      />
    );
  }

  if (useAspectRatio) {
    return (
      <AspectRatio ratio={feedAspectRatio} className="w-full">
        <video
          ref={videoRef}
          src={video.video_url || undefined}
          className="w-full h-full"
          style={getVideoStyle()}
          loop
          muted={isMuted}
          playsInline
          controls={showControls}
          poster={video.thumbnail_url || undefined}
          preload="auto"
          autoPlay={autoPlay}
        />
      </AspectRatio>
    );
  }

  return (
    <video
      ref={videoRef}
      src={video.video_url || undefined}
      className="w-full h-full"
      style={getVideoStyle()}
      loop
      muted={isMuted}
      playsInline
      controls={showControls}
      poster={video.thumbnail_url || undefined}
      preload="auto"
      autoPlay={autoPlay}
    />
  );
};

export default VideoContainer;
