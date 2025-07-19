import React, { useRef, useState, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { Video, ProductLink } from '@/types/video';
import { X, Heart, MessageCircle, Share2, ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from '@/components/ui/progress';
import { isImagePost } from './utils/videoPlayerUtils';
import ProductLinkCard from './ProductLinkCard';
import { cn } from '@/lib/utils';

interface NativeVideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  isMuted?: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink?: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onMuteToggle?: (e: React.MouseEvent) => void;
  toggleProductLink?: (linkId: string) => void;
  playbackStarted?: boolean;
  setPlaybackStarted?: (started: boolean) => void;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  onInView?: (inView: boolean) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  showProgress?: boolean;
  progressValue?: number;
  hideControls?: boolean;
  onNaturalAspectRatioChange?: (ratio: number) => void;
}

const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = memo(({
  video,
  productLinks = [],
  autoPlay = true,
  isMuted = true,
  showControls = false,
  isFullscreen = false,
  className,
  visibleProductLink,
  onClick,
  onClose,
  onMuteToggle,
  toggleProductLink,
  playbackStarted = false,
  setPlaybackStarted,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  onInView,
  onTimeUpdate,
  showProgress = false,
  progressValue,
  hideControls = false,
  onNaturalAspectRatioChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProductOverlay, setShowProductOverlay] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [videoNaturalAspectRatio, setVideoNaturalAspectRatio] = useState<number | null>(null);
  const [inViewRef, inView] = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      onInView?.(inView);
    },
  });
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if this is an image post
  const isImage = isImagePost(video.video_url || '');

  // Handle video metadata load to get natural dimensions
  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.currentTarget;
    if (videoElement) {
      const { videoWidth, videoHeight } = videoElement;
      if (videoWidth && videoHeight) {
        const ratio = videoWidth / videoHeight;
        setVideoNaturalAspectRatio(ratio);
        onNaturalAspectRatioChange?.(ratio);
        console.log('Video natural ratio:', { width: videoWidth, height: videoHeight, ratio });
        console.log('Container size:', { containerWidth: containerRef.current?.clientWidth, containerHeight: containerRef.current?.clientHeight });
        console.log('Object-fit decision:', { objectFit: isMobile ? 'cover' : 'contain', isMobile, dimensions: { width: videoWidth, height: videoHeight } });
      }
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onTimeUpdate) {
      onTimeUpdate(e);
    } else {
      const video = e.currentTarget;
      if (video.duration) {
        setCurrentProgress((video.currentTime / video.duration) * 100);
      }
    }
  };

  const handleWaiting = () => {
    setBuffering(true);
  };

  const handlePlaying = () => {
    setBuffering(false);
  };

  useEffect(() => {
    if (videoRef.current && !isImage) {
      videoRef.current.muted = isMuted;
      if (autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
            setPlaybackStarted?.(true);
          }).catch(error => {
            console.error("Autoplay was prevented:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [isMuted, autoPlay, setPlaybackStarted, isImage]);

  useEffect(() => {
    if (inView && videoRef.current && !isPlaying && autoPlay && !isImage) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setPlaybackStarted?.(true);
        }).catch(error => {
          console.error("Autoplay was prevented:", error);
          setIsPlaying(false);
        });
      }
    } else if (!inView && videoRef.current && isPlaying && !isImage) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, autoPlay, isPlaying, setPlaybackStarted, isImage]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && !isImage) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setPlaybackStarted?.(true);
      }
    }
  };

  const handleVideoClick = () => {
    onClick?.();
  };

  // Dynamic object-fit based on screen size
  const getObjectFit = () => {
    return isMobile ? 'cover' : 'contain';
  };

  const renderMobileControls = () => {
    if (!isMobile || !isFullscreen || hideControls) return null;
    
    return (
      <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-20">
        {!isImage && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 touch-manipulation"
            onClick={e => {
              e.stopPropagation();
              onMuteToggle?.(e);
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  const displayProgress = progressValue !== undefined ? progressValue : currentProgress;

  return (
    <div
      className={cn("relative", className)}
      onClick={handleVideoClick}
      ref={inViewRef}
    >
      {useAspectRatio ? (
        <AspectRatio ratio={feedAspectRatio} className="w-full h-full bg-black overflow-hidden rounded-md">
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-black"
          >
            {isImage ? (
              <img 
                src={video.video_url || ''} 
                alt={video.title || ''} 
                className={cn(
                  "w-full h-full object-contain", // Always contain for images
                  "md:max-h-[80vh] md:max-w-[90%] md:mx-auto" // Desktop constraints
                )}
                onLoad={(e) => {
                  console.log("Image loaded successfully:", video.video_url);
                  onInView?.(true);
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    onNaturalAspectRatioChange?.(ratio);
                    console.log('Image natural ratio:', { width: img.naturalWidth, height: img.naturalHeight, ratio });
                  }
                }}
                onError={(e) => {
                  console.error("Error loading image:", video.video_url, e);
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={video.video_url || ''}
                muted={isMuted}
                loop
                playsInline
                disableRemotePlayback={true}
                preload="metadata"
                className={cn(
                  "w-full h-full",
                  isMobile ? "object-cover" : "object-contain", // Responsive object-fit
                  "md:max-h-[80vh] md:max-w-[90%] md:mx-auto" // Desktop constraints
                )}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onLoadedMetadata={handleMetadataLoaded}
              />
            )}
          </div>
          {showProgress && !isImage && (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <Progress value={displayProgress} className="h-1 rounded-none bg-white/20" />
            </div>
          )}
        </AspectRatio>
      ) : (
        <div className="relative w-full h-full">
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-black"
          >
            {isImage ? (
              <img 
                src={video.video_url || ''} 
                alt={video.title || ''} 
                className={cn(
                  "w-full h-full object-contain", // Always contain for images
                  "md:max-h-[80vh] md:max-w-[90%] md:mx-auto" // Desktop constraints
                )}
                onLoad={(e) => {
                  console.log("Image loaded successfully:", video.video_url);
                  onInView?.(true);
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    onNaturalAspectRatioChange?.(ratio);
                  }
                }}
                onError={(e) => {
                  console.error("Error loading image:", video.video_url, e);
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={video.video_url || ''}
                muted={isMuted}
                loop
                playsInline
                disableRemotePlayback={true}
                preload="metadata"
                className={cn(
                  "w-full h-full",
                  isMobile ? "object-cover" : "object-contain", // Responsive object-fit
                  "md:max-h-[80vh] md:max-w-[90%] md:mx-auto" // Desktop constraints
                )}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onLoadedMetadata={handleMetadataLoaded}
              />
            )}
          </div>
          {showProgress && !isImage && (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <Progress value={displayProgress} className="h-1 rounded-none bg-white/20" />
            </div>
          )}
        </div>
      )}

      {buffering && !isImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <div className="h-12 w-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
        </div>
      )}

      {renderMobileControls()}

      {!isMobile && !hideControls && (
        <>
          <div className="absolute bottom-3 right-3 flex gap-2 z-20">
            {!isImage && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/60 hover:bg-black/80 rounded-full border border-white touch-manipulation"
                onClick={e => {
                  e.stopPropagation();
                  onMuteToggle?.(e);
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            )}
          </div>

          {showControls && (
            <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
          )}
        </>
      )}

      {isFullscreen && !hideControls && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
          onClick={e => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
});

NativeVideoPlayer.displayName = 'NativeVideoPlayer';

export default NativeVideoPlayer;
