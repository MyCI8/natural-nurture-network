import React, { useEffect, useRef, useState } from 'react';
import { Video, ProductLink } from '@/types/video';
import { Volume2, VolumeX, PlayCircle, ShoppingCart, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { Progress } from '@/components/ui/progress';
import { 
  isImagePost,
  isPlayableVideoFormat,
  sanitizeVideoUrl,
  logVideoInfo,
  validateMediaAvailability
} from './utils/videoPlayerUtils';
import ProductLinkCard from './ProductLinkCard';
import ImageCarousel from './ImageCarousel';
import { isCarousel } from '@/utils/videoUtils';
import { toast } from 'sonner';
import useTouchGestures from '@/hooks/use-touch-gestures';

interface NativeVideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  isMuted?: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onMuteToggle?: (e: React.MouseEvent) => void;
  toggleProductLink?: (linkId: string) => void;
  playbackStarted: boolean;
  setPlaybackStarted: React.Dispatch<React.SetStateAction<boolean>>;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  onInView?: (inView: boolean) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  showProgress?: boolean;
  progressValue?: number;
  hideControls?: boolean;
}

const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  video,
  productLinks = [],
  autoPlay = true,
  isMuted = true,
  showControls = false,
  isFullscreen = false,
  className = '',
  visibleProductLink,
  onClick,
  onClose,
  onMuteToggle,
  toggleProductLink,
  playbackStarted,
  setPlaybackStarted,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  onInView,
  onTimeUpdate,
  showProgress = false,
  progressValue,
  hideControls = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaybackControls, setShowPlaybackControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [loading, setLoading] = useState(autoPlay);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryScheduled, setAutoRetryScheduled] = useState(false);
  const maxRetries = 3;
  
  // Use intersection observer to detect when the video is in view
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });
  
  // Reset error state when video changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
    setRetryCount(0);
    setIsRetrying(false);
    setAutoRetryScheduled(false);
    
    // Additional validation for video URLs when video changes
    if (video && video.video_url) {
      // Early validation to prevent loading errors
      validateMediaAvailability(video.video_url)
        .then(isAvailable => {
          if (!isAvailable && !hasError) {
            console.warn(`Media validation failed for ${video.video_url}, will attempt to play anyway`);
          }
        })
        .catch(err => {
          console.warn(`Media validation error: ${err.message}`);
        });
    }
  }, [video.id, video.video_url]);
  
  // Combine the inViewRef with the videoRef
  const setRefs = (element: HTMLVideoElement | null) => {
    // Set the inViewRef
    if (inViewRef) {
      // @ts-ignore - This is a known issue with the react-intersection-observer types
      inViewRef(element);
    }
    
    // Set the videoRef
    if (element) {
      videoRef.current = element;
    }
  };
  
  // Touch gesture handlers
  const { handlers } = useTouchGestures({
    onSwipe: (direction) => {
      // Existing swipe handling if any
    },
    onTap: () => {
      if (hasError) {
        handleRetry();
        return;
      }
      
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(err => {
            console.error("Failed to play video:", err);
            handlePlayError(err);
          });
        } else {
          videoRef.current.pause();
        }
        toggleControls();
      }
    },
    onDoubleTap: () => {
      // Handle double tap like toggling fullscreen or other special actions
      if (onClick) {
        onClick();
      }
    },
    onLongPress: () => {
      // Show more options or specialized actions
      setControlsVisible(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      const timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  });
  
  // Handle when the video comes into view
  useEffect(() => {
    if (onInView) {
      onInView(inView);
    }
    
    // Auto-play when in view if autoPlay is true and no errors
    if (videoRef.current && inView && autoPlay && !hasError && !isRetrying) {
      // Use sanitized URL for better compatibility
      const sanitizedUrl = sanitizeVideoUrl(video.video_url);
      if (sanitizedUrl && videoRef.current.src !== sanitizedUrl) {
        videoRef.current.src = sanitizedUrl;
      }
      
      videoRef.current.play().catch(err => {
        console.error("Failed to autoplay video:", err);
        handlePlayError(err);
      });
    } else if (videoRef.current && !inView) {
      videoRef.current.pause();
    }
  }, [inView, autoPlay, onInView, hasError, video, isRetrying]);
  
  // Helper function to handle play errors
  const handlePlayError = (err: any) => {
    console.error("Play error details:", err);
    
    setHasError(true);
    setErrorMessage(`Playback failed: ${err.message || 'Unknown error'}`);
    
    // Schedule automatic retry if we haven't reached the limit
    if (retryCount < maxRetries && !autoRetryScheduled) {
      setAutoRetryScheduled(true);
      
      // Use exponential backoff for retries
      const delay = Math.min(1000 * (2 ** retryCount), 8000);
      
      console.log(`Scheduling automatic retry #${retryCount + 1} in ${delay}ms`);
      
      setTimeout(() => {
        if (!hasError) return; // Skip if error was resolved
        
        console.log(`Executing automatic retry #${retryCount + 1}`);
        handleRetry();
        setAutoRetryScheduled(false);
      }, delay);
    }
    
    // Log detailed video info to help with debugging
    logVideoInfo(video, "Error playing video:");
  };
  
  // Set up video autoplay when component mounts
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && autoPlay && inView && !hasError && !isRetrying) {
      // Small delay to ensure DOM is ready
      const playTimer = setTimeout(() => {
        if (videoElement) {
          videoElement.play().catch(err => {
            console.error("Failed to autoplay video on mount:", err);
            handlePlayError(err);
          });
        }
      }, 100);
      
      return () => clearTimeout(playTimer);
    }
    
    return () => {
      // Pause and remove when component unmounts to free up resources
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [autoPlay, inView, hasError, isRetrying]);
  
  // Update the video's muted state when the isMuted prop changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Function to validate video URL
  const isValidVideoUrl = (url: string | null): boolean => {
    if (!url) return false;
    
    // Check if URL is properly formatted
    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    
    // For Supabase URLs, we'll be more lenient with formats
    if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
      return true;
    }
    
    // Check if URL ends with common video formats
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };
  
  // Handle play/pause and update the isPlaying state
  const handlePlayPause = () => {
    if (hasError) {
      handleRetry();
      return;
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Failed to play video:", err);
          handlePlayError(err);
        });
      }
    }
  };
  
  const handleRetry = () => {
    if (retryCount >= maxRetries) {
      toast.error("Video playback failed after multiple attempts. Please try again later.");
      return;
    }
    
    setIsRetrying(true);
    setHasError(false);
    setErrorMessage("");
    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Reset the video element
    if (videoRef.current) {
      // If we're retrying, add a cache-busting parameter
      const currentSrc = videoRef.current.src;
      let newSrc = currentSrc;
      
      if (video.video_url) {
        // Add timestamp to bust cache
        const timestamp = Date.now();
        newSrc = sanitizeVideoUrl(video.video_url) || video.video_url;
        
        // Add cache busting parameter
        if (newSrc.includes('?')) {
          newSrc = `${newSrc}&_cb=${timestamp}`;
        } else {
          newSrc = `${newSrc}?_cb=${timestamp}`;
        }
        
        // Force download flag for Supabase URLs
        if ((newSrc.includes('storage.googleapis.com') || newSrc.includes('supabase.co')) && 
            !newSrc.includes('download=true')) {
          newSrc = `${newSrc}&download=true`;
        }
      }
      
      // If we have a new URL, use it
      if (newSrc !== currentSrc) {
        videoRef.current.src = newSrc;
      }
      
      // Force reload and clear any previous errors
      videoRef.current.load();
      
      console.log(`Retry attempt ${retryCount + 1}/${maxRetries}`, { 
        originalUrl: video.video_url,
        newSrc
      });
      
      // Small delay before trying to play again
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => {
            console.error(`Retry ${retryCount + 1}/${maxRetries} failed:`, err);
            handlePlayError(err);
          }).finally(() => {
            setIsRetrying(false);
          });
        } else {
          setIsRetrying(false);
        }
      }, 800);
      
      // Toast notification for feedback
      if (retryCount > 0) {
        toast.info(`Retrying playback (${retryCount + 1}/${maxRetries})...`);
      }
    } else {
      setIsRetrying(false);
    }
  };
  
  // Toggle visibility of playback controls
  const toggleControls = () => {
    setControlsVisible(prev => !prev);
    
    // Clear any existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set a timeout to hide controls after 3 seconds
    if (!controlsVisible) {
      const timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  };
  
  // Handle video events
  const handlePlay = () => {
    setIsPlaying(true);
    setPlaybackStarted(true);
    setHasError(false);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
    
    if (onTimeUpdate) {
      onTimeUpdate(e);
    }
  };
  
  const handleLoadStart = () => {
    setLoading(true);
  };
  
  const handleCanPlay = () => {
    setLoading(false);
    setHasError(false);
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video error:", e);
    const videoElement = e.currentTarget;
    console.error("Video error code:", videoElement.error?.code);
    console.error("Video error message:", videoElement.error?.message);
    
    setLoading(false);
    
    // Don't set error if we're already retrying
    if (!isRetrying) {
      setHasError(true);
      
      // Set appropriate error message based on error code
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            setErrorMessage("Video playback was aborted");
            break;
          case 2: // MEDIA_ERR_NETWORK
            setErrorMessage("Network error occurred while loading the video");
            break;
          case 3: // MEDIA_ERR_DECODE
            setErrorMessage("Video decode error");
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            setErrorMessage("Video format not supported");
            break;
          default:
            setErrorMessage(`Error playing video: ${videoElement.error.message}`);
        }
      } else {
        setErrorMessage("Unknown error occurred while playing video");
      }
      
      // Schedule automatic retry
      if (retryCount < maxRetries && !autoRetryScheduled) {
        handlePlayError(videoElement.error || new Error("Unknown video error"));
      }
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (hideControls) {
      if (onClick) {
        onClick();
      }
      return;
    }
    
    e.stopPropagation();
    toggleControls();
    
    if (onClick) {
      onClick();
    }
  };

  // Determine if the video is an image post by checking the video URL
  const isImage = isImagePost(video.video_url);

  // Check if video URL is invalid and not an image
  const isInvalidVideoUrl = !isImage && !isPlayableVideoFormat(video.video_url);
  
  // If URL is invalid, show error state immediately
  useEffect(() => {
    if (isInvalidVideoUrl && !isRetrying && !hasError) {
      setHasError(true);
      setErrorMessage("Invalid video format or URL");
      setLoading(false);
      console.error("Invalid video format detected:", video.video_url);
    }
  }, [isInvalidVideoUrl, isRetrying, hasError]);

  // Error state renderer with enhanced retry button
  const renderErrorState = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-20 flex-col p-4 text-center">
      <div className="text-white mb-4">
        {errorMessage}
        {retryCount > 0 && <div className="text-sm text-gray-400 mt-1">Attempt {retryCount}/{maxRetries}</div>}
      </div>
      <Button 
        variant="outline" 
        onClick={(e) => {
          e.stopPropagation();
          handleRetry();
        }}
        className="bg-primary/20 hover:bg-primary/30 text-white flex items-center gap-2 touch-manipulation"
        disabled={isRetrying || retryCount >= maxRetries}
      >
        {isRetrying ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Retrying...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </>
        )}
      </Button>
      {video.thumbnail_url && (
        <div className="mt-4 opacity-60">
          <img 
            src={video.thumbnail_url} 
            alt={video.title || "Video thumbnail"} 
            className="max-h-[120px] object-contain"
          />
        </div>
      )}
    </div>
  );
  
  // Show a preview when loading or retrying
  const renderLoadingState = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 flex-col">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
      
      {/* Show thumbnail while loading if available */}
      {video.thumbnail_url && !isRetrying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={video.thumbnail_url} 
            alt={video.title || "Loading thumbnail"} 
            className="max-h-full max-w-full object-contain opacity-50"
          />
        </div>
      )}
      
      <div className="text-white text-sm mt-2">
        {isRetrying ? `Retrying (${retryCount}/${maxRetries})...` : 'Loading...'}
      </div>
    </div>
  );
  
  // Render an image if the post is an image rather than a video
  if (isImage) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-black", 
          className
        )}
        onClick={handleClick}
        {...handlers}
      >
        {useAspectRatio ? (
          <div className="w-full" style={{ aspectRatio: feedAspectRatio }}>
            <img 
              src={video.video_url || ''} 
              alt={video.title || 'Media content'} 
              className={cn(
                "w-full h-full", 
                objectFit === 'contain' ? 'object-contain' : 'object-cover'
              )}
              loading="lazy"
            />
          </div>
        ) : (
          <img 
            src={video.video_url || ''} 
            alt={video.title || 'Media content'} 
            className={cn(
              "w-full h-full", 
              objectFit === 'contain' ? 'object-contain' : 'object-cover'
            )}
            loading="lazy"
          />
        )}
      
        {/* Close button for fullscreen mode */}
        {isFullscreen && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="absolute top-2 right-2 z-20 text-white bg-black/20 hover:bg-black/40 h-8 w-8 p-1 rounded-full touch-manipulation"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Product links button */}
        {productLinks.length > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                if (toggleProductLink) toggleProductLink(productLinks[0].id);
              }}
              aria-label="View products"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="text-xs">Products</span>
            </Button>
          </div>
        )}
        
        {/* Display product link cards */}
        {productLinks.map((link) => (
          <div 
            key={link.id} 
            className={cn(
              "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
              visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
            )}
          >
            <ProductLinkCard 
              link={link} 
              onClose={() => {
                if (toggleProductLink) toggleProductLink(link.id);
              }} 
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Otherwise render a video player
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-black touch-manipulation", 
        className
      )}
      onClick={handleClick}
      {...handlers}
    >
      {useAspectRatio ? (
        <div className="w-full" style={{ aspectRatio: feedAspectRatio }}>
          <video
            ref={setRefs}
            src={sanitizeVideoUrl(video.video_url) || ''}
            className={cn(
              "w-full h-full", 
              objectFit === 'contain' ? 'object-contain' : 'object-cover'
            )}
            muted={isMuted}
            loop
            playsInline
            autoPlay={autoPlay && !hasError && !isRetrying}
            controls={showControls}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleError}
            preload="metadata"
          />
        </div>
      ) : (
        <video
          ref={setRefs}
          src={sanitizeVideoUrl(video.video_url) || ''}
          className={cn(
            "w-full h-full", 
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          )}
          muted={isMuted}
          loop
          playsInline
          autoPlay={autoPlay && !hasError && !isRetrying}
          controls={showControls}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
          preload="metadata"
        />
      )}
      
      {/* Loading indicator */}
      {(loading || isRetrying) && !hasError && renderLoadingState()}
      
      {/* Error state */}
      {hasError && renderErrorState()}
      
      {/* Video controls - only show if no errors */}
      {!hasError && !hideControls && controlsVisible && !showControls && (
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center z-10"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white bg-black/40 hover:bg-black/60 h-12 w-12 rounded-full" 
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="h-6 w-6"
              >
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="h-6 w-6"
              >
                <path 
                  fill="currentColor" 
                  d="M8 5v14l11-7z"
                />
              </svg>
            )}
          </Button>
          
          {onMuteToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute bottom-3 right-3 text-white bg-black/40 hover:bg-black/60 h-8 w-8 rounded-full" 
              onClick={onMuteToggle}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}
      
      {/* Close button for fullscreen mode */}
      {isFullscreen && onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="absolute top-2 right-2 z-20 text-white bg-black/20 hover:bg-black/40 h-8 w-8 p-1 rounded-full touch-manipulation"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* Product links button */}
      {!hasError && productLinks.length > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              if (toggleProductLink) toggleProductLink(productLinks[0].id);
            }}
            aria-label="View products"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span className="text-xs">Products</span>
          </Button>
        </div>
      )}
      
      {/* Progress bar - only show if no errors */}
      {!hasError && (showProgress || progressValue !== undefined) && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Progress value={progressValue !== undefined ? progressValue : progress} className="h-1 rounded-none bg-white/20" />
        </div>
      )}
      
      {/* Display product link cards - only if no errors */}
      {!hasError && productLinks.map((link) => (
        <div 
          key={link.id} 
          className={cn(
            "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
            visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
          )}
        >
          <ProductLinkCard 
            link={link} 
            onClose={() => {
              if (toggleProductLink) toggleProductLink(link.id);
            }} 
          />
        </div>
      ))}
    </div>
  );
};

export default NativeVideoPlayer;
