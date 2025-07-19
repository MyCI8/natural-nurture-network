import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { X, Volume2, VolumeX, MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { Video, ProductLink } from '@/types/video';
import { isYoutubeVideo, isImagePost, getYouTubeVideoId } from '@/components/video/utils/videoPlayerUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductLinkCard from '@/components/video/ProductLinkCard';

interface OptimizedVideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink?: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: Error) => void;
  onMuteToggle?: (e: React.MouseEvent) => void;
  toggleProductLink?: (linkId: string) => void;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  showProgress?: boolean;
  progressValue?: number;
  hideControls?: boolean;
  onNaturalAspectRatioChange?: (ratio: number) => void;
}

const OptimizedVideoPlayer = memo<OptimizedVideoPlayerProps>(({
  video,
  productLinks = [],
  autoPlay = false,
  muted = true,
  showControls = false,
  isFullscreen = false,
  className,
  visibleProductLink,
  onClick,
  onClose,
  onPlay,
  onPause,
  onError,
  onMuteToggle,
  toggleProductLink,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  showProgress = false,
  progressValue,
  hideControls = false,
  onNaturalAspectRatioChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [videoNaturalAspectRatio, setVideoNaturalAspectRatio] = useState<number | null>(null);
  const [dynamicAspectRatio, setDynamicAspectRatio] = useState(feedAspectRatio);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Dynamic aspect ratio based on screen size
  useEffect(() => {
    if (isMobile) {
      setDynamicAspectRatio(4/5); // Portrait for mobile
    } else {
      setDynamicAspectRatio(16/9); // Widescreen for desktop
    }
    console.log('Dynamic aspect ratio set:', { isMobile, ratio: isMobile ? '4/5' : '16/9' });
  }, [isMobile]);

  // Memoize video type checks
  const isYoutube = useMemo(() => isYoutubeVideo(video.video_url || ''), [video.video_url]);
  const isImage = useMemo(() => isImagePost(video.video_url || ''), [video.video_url]);
  const youtubeId = useMemo(() => isYoutube ? getYouTubeVideoId(video.video_url || '') : null, [isYoutube, video.video_url]);

  // Optimized play/pause handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleError = useCallback((error: Error) => {
    console.error('Video error:', error);
    onError?.(error);
  }, [onError]);

  // Handle native video metadata
  const handleMetadataLoaded = useCallback(() => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      if (videoWidth && videoHeight) {
        const ratio = videoWidth / videoHeight;
        setVideoNaturalAspectRatio(ratio);
        onNaturalAspectRatioChange?.(ratio);
        console.log('Video natural ratio:', { width: videoWidth, height: videoHeight, ratio });
        console.log('Object-fit decision:', { 
          objectFit: isMobile ? 'cover' : 'contain', 
          isMobile, 
          dimensions: { width: videoWidth, height: videoHeight } 
        });
      }
    }
  }, [onNaturalAspectRatioChange, isMobile]);

  // Handle time updates with throttling
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setCurrentProgress((video.currentTime / video.duration) * 100);
    }
  }, []);

  // Intersection observer effect for autoplay
  useEffect(() => {
    if (!isImage && !isYoutube && videoRef.current) {
      const video = videoRef.current;
      
      if (inView && autoPlay && !isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(handlePlay)
            .catch(handleError);
        }
      } else if (!inView && isPlaying) {
        video.pause();
        handlePause();
      }
    }
  }, [inView, autoPlay, isPlaying, handlePlay, handlePause, handleError, isImage, isYoutube]);

  // Mute state management
  useEffect(() => {
    if (videoRef.current && !isImage) {
      videoRef.current.muted = muted;
    }
  }, [muted, isImage]);

  // Set natural aspect ratio for YouTube videos
  useEffect(() => {
    if (isYoutube && onNaturalAspectRatioChange) {
      onNaturalAspectRatioChange(16 / 9);
      console.log('YouTube video natural ratio set to 16:9');
    }
  }, [isYoutube, onNaturalAspectRatioChange]);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && !isImage) {
      if (isPlaying) {
        videoRef.current.pause();
        handlePause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(handlePlay).catch(handleError);
        }
      }
    }
  }, [isPlaying, handlePlay, handlePause, handleError, isImage]);

  const handleVideoClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Mobile controls component
  const MobileControls = useMemo(() => {
    if (!isMobile || !isFullscreen || hideControls) return null;
    
    return (
      <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-20">
        {!isImage && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 touch-manipulation"
            onClick={onMuteToggle}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
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
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>
    );
  }, [isMobile, isFullscreen, hideControls, isImage, muted, onMuteToggle, onClick]);

  // YouTube player component
  const YouTubePlayer = useMemo(() => {
    if (!isYoutube || !youtubeId) return null;

    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${showControls ? 1 : 0}&playsinline=1&rel=0&showinfo=0&modestbranding=1&color=white&iv_load_policy=3`}
        className={cn(
          "w-full h-full",
          !isMobile && "md:max-h-[80vh] md:max-w-[90%] md:mx-auto"
        )}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={video.title}
      />
    );
  }, [isYoutube, youtubeId, autoPlay, muted, showControls, video.title, isMobile]);

  // Native video/image component
  const MediaElement = useMemo(() => {
    if (isYoutube) return YouTubePlayer;

    if (isImage) {
      return (
        <img 
          src={video.video_url || ''} 
          alt={video.title || ''} 
          className={cn(
            "w-full h-full object-contain", // Always contain for images
            "md:max-h-[80vh] md:max-w-[90%] md:mx-auto" // Desktop constraints
          )}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              const ratio = img.naturalWidth / img.naturalHeight;
              onNaturalAspectRatioChange?.(ratio);
              console.log('Image natural ratio:', { width: img.naturalWidth, height: img.naturalHeight, ratio });
            }
          }}
          onError={(e) => {
            handleError(new Error('Image failed to load'));
          }}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={video.video_url || ''}
        muted={muted}
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
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onLoadedMetadata={handleMetadataLoaded}
        onError={(e) => {
          const video = e.currentTarget;
          handleError(new Error(video.error?.message || 'Video error'));
        }}
      />
    );
  }, [isYoutube, YouTubePlayer, isImage, video.video_url, video.title, onNaturalAspectRatioChange, handleError, muted, handleTimeUpdate, handleMetadataLoaded, isMobile]);

  const displayProgress = progressValue !== undefined ? progressValue : currentProgress;

  const content = (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {MediaElement}
      
      {buffering && !isImage && !isYoutube && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <div className="h-12 w-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
        </div>
      )}

      {showProgress && !isImage && !isYoutube && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Progress value={displayProgress} className="h-1 rounded-none bg-white/20" />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn("relative", className)}
      onClick={handleVideoClick}
      ref={inViewRef}
    >
      {useAspectRatio ? (
        <AspectRatio 
          ratio={dynamicAspectRatio} 
          className={cn(
            "w-full h-full bg-black overflow-hidden rounded-md",
            !isMobile && "md:max-h-[80vh] lg:max-w-[90%] mx-auto" // Flexible caps for desktop
          )}
        >
          {content}
        </AspectRatio>
      ) : (
        <div className="relative w-full h-full">
          {content}
        </div>
      )}

      {MobileControls}

      {/* Desktop controls */}
      {!isMobile && !hideControls && (
        <div className="absolute bottom-3 right-3 flex gap-2 z-20">
          {!isImage && !isYoutube && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/60 hover:bg-black/80 rounded-full border border-white touch-manipulation"
              onClick={onMuteToggle}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>
      )}

      {/* Close button for fullscreen */}
      {isFullscreen && !hideControls && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Product links */}
      {productLinks.length > 0 && (
        <>
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                toggleProductLink?.(productLinks[0].id);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="text-xs">Products</span>
            </Button>
          </div>

          {productLinks.map((link) => (
            <div key={link.id} className={cn(
              "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
              visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
            )}>
              <ProductLinkCard 
                link={link} 
                onClose={() => toggleProductLink?.(link.id)} 
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
});

OptimizedVideoPlayer.displayName = 'OptimizedVideoPlayer';

export default OptimizedVideoPlayer;
