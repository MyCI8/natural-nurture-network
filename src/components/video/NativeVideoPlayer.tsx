import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video, ProductLink } from '@/types/video';
import { Volume2, VolumeX, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useInView } from 'react-intersection-observer';
import ProductLinkCard from './ProductLinkCard';
import { useTouchGestures } from '@/hooks/use-touch-gestures';

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
  
  // Use intersection observer to detect when the video is in view
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });
  
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
    onTap: () => {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
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
    
    // Auto-play when in view if autoPlay is true
    if (videoRef.current && inView && autoPlay) {
      videoRef.current.play().catch(err => {
        console.error("Failed to autoplay video:", err);
      });
    } else if (videoRef.current && !inView) {
      videoRef.current.pause();
    }
  }, [inView, autoPlay, onInView]);
  
  // Set up video autoplay when component mounts
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && autoPlay && inView) {
      videoElement.play().catch(err => {
        console.error("Failed to autoplay video:", err);
      });
    }
    
    return () => {
      // Pause and remove when component unmounts to free up resources
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [autoPlay, inView]);
  
  // Update the video's muted state when the isMuted prop changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Handle play/pause and update the isPlaying state
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Failed to play video:", err);
        });
      }
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
  const isImage = video.video_url?.endsWith('.jpg') || 
                video.video_url?.endsWith('.jpeg') || 
                video.video_url?.endsWith('.png') || 
                video.video_url?.endsWith('.webp') || 
                video.video_url?.endsWith('.gif');

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
            src={video.video_url || ''}
            className={cn(
              "w-full h-full", 
              objectFit === 'contain' ? 'object-contain' : 'object-cover'
            )}
            muted={isMuted}
            loop
            playsInline
            autoPlay={autoPlay}
            controls={showControls}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          />
        </div>
      ) : (
        <video
          ref={setRefs}
          src={video.video_url || ''}
          className={cn(
            "w-full h-full", 
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          )}
          muted={isMuted}
          loop
          playsInline
          autoPlay={autoPlay}
          controls={showControls}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        />
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Video controls */}
      {!hideControls && controlsVisible && !showControls && (
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
      
      {/* Progress bar */}
      {(showProgress || progressValue !== undefined) && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Progress value={progressValue !== undefined ? progressValue : progress} className="h-1 rounded-none bg-white/20" />
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
};

export default NativeVideoPlayer;
