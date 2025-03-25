
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Video, ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(!globalAudioEnabled);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [playAttempted, setPlayAttempted] = useState(false);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Check if the video URL is a YouTube link
  const isYoutubeVideo = () => {
    if (!video.video_url) return false;
    return video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be');
  };

  // Extract the YouTube video ID from a YouTube URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Force isMuted state to sync with globalAudioEnabled prop
  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
    if (videoRef.current) {
      videoRef.current.muted = !globalAudioEnabled;
    }
  }, [globalAudioEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYoutubeVideo()) return;

    const handleMetadata = () => {
      const ratio = video.videoWidth / video.videoHeight;
      setVideoAspectRatio(ratio);
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, Aspect ratio: ${ratio}`);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, []);

  // More aggressive play attempt specifically for modal scenarios
  useEffect(() => {
    if (isYoutubeVideo() || !videoRef.current || !autoPlay || playbackStarted) return;
    
    if (isOpen(videoRef.current)) {
      console.log("VideoPlayer: Component is visible, attempting modal-specific play");
      attemptPlay();
    }
    
    // Try playing after a short delay to ensure the modal is fully visible
    const timer = setTimeout(() => {
      if (!playbackStarted && videoRef.current) {
        console.log("VideoPlayer: Delayed play attempt");
        attemptPlay();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [autoPlay, showControls]);

  // Check if an element is visible in the viewport
  const isOpen = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Play the video when it's visible or when autoPlay is explicitly set true
  useEffect(() => {
    if (isYoutubeVideo() || !videoRef.current) return;
    
    console.log("Play video attempt. inView:", inView, "autoPlay:", autoPlay, "isFullscreen:", isFullscreen);
    
    if ((inView && autoPlay) || (autoPlay && isFullscreen) || (autoPlay && showControls)) {
      attemptPlay();
    } else if (!inView && !isFullscreen && videoRef.current && !showControls) {
      videoRef.current.pause();
      console.log("Video paused because not in view");
    }
  }, [inView, autoPlay, video.id, isFullscreen, showControls]);

  const attemptPlay = async () => {
    if (!videoRef.current) return;
    
    console.log("Attempting to play video...");
    setPlayAttempted(true);
    
    try {
      // First try with current audio settings
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Video playback started successfully");
          setPlaybackStarted(true);
          logVideoView();
        }).catch(error => {
          console.error("First play attempt failed:", error);
          
          // If failed, try with muted audio
          if (videoRef.current && !videoRef.current.muted) {
            console.log("Trying again with muted audio");
            videoRef.current.muted = true;
            setIsMuted(true);
            
            videoRef.current.play().then(() => {
              console.log("Video playback started with muted audio");
              setPlaybackStarted(true);
              logVideoView();
            }).catch(secondError => {
              console.error("Second play attempt failed:", secondError);
              
              // Last resort: try after user interaction simulation
              setTimeout(() => {
                if (videoRef.current && !playbackStarted) {
                  console.log("Final play attempt");
                  videoRef.current.play().catch(e => 
                    console.error("Final play attempt failed:", e)
                  );
                }
              }, 1000);
            });
          }
        });
      }
    } catch (error) {
      console.error("Error during video play:", error);
    }
  };
  
  const logVideoView = async () => {
    const viewSessionKey = `video_${video.id}_viewed`;
    if (!sessionStorage.getItem(viewSessionKey)) {
      const { error } = await supabase.rpc('increment_video_views', { 
        video_id: video.id 
      });
      if (error) console.error('Error incrementing views:', error);
      sessionStorage.setItem(viewSessionKey, 'true');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || isYoutubeVideo()) return;
    const newMutedState = !videoRef.current.muted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    onAudioStateChange?.(newMutedState);
  };

  const feedAspectRatio = aspectRatio || 4/5;

  const getVideoStyle = () => {
    const baseStyle: React.CSSProperties = {
      objectFit: objectFit,
      width: '100%',
      height: '100%',
    };
    
    if (isFullscreen) {
      return {
        ...baseStyle,
        maxHeight: '100vh',
        width: 'auto',
        maxWidth: '100%',
      };
    }
    
    return baseStyle;
  };

  if (isYoutubeVideo()) {
    const youtubeId = getYoutubeVideoId(video.video_url || '');
    
    if (isFullscreen) {
      return (
        <div 
          ref={(node) => {
            inViewRef(node);
            if (node) containerRef.current = node;
          }}
          className={cn(
            "relative overflow-hidden flex items-center justify-center bg-black", 
            "h-screen w-full",
            className
          )}
          onClick={() => onClick?.()}
        >
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 z-20 text-white bg-black/20 hover:bg-black/40 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&playsinline=1`}
            className="w-auto h-auto max-w-full max-h-screen"
            style={{ aspectRatio: '16/9' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          ></iframe>
        </div>
      );
    }

    return (
      <div 
        ref={(node) => {
          inViewRef(node);
          if (node) containerRef.current = node;
        }}
        className={cn("relative overflow-hidden bg-black", className)}
        onClick={() => onClick?.()}
      >
        {useAspectRatio ? (
          <AspectRatio ratio={feedAspectRatio} className="w-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${showControls ? 1 : 0}&playsinline=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            ></iframe>
          </AspectRatio>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${showControls ? 1 : 0}&playsinline=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          ></iframe>
        )}
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div 
        ref={(node) => {
          inViewRef(node);
          if (node) containerRef.current = node;
        }}
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-black", 
          "h-screen w-full",
          className
        )}
        onClick={() => onClick?.()}
      >
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 text-white bg-black/20 hover:bg-black/40 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <video
          ref={videoRef}
          src={video.video_url || undefined}
          className="max-h-screen w-auto max-w-full"
          style={getVideoStyle()}
          loop
          muted={isMuted}
          playsInline
          controls={showControls}
          poster={video.thumbnail_url || undefined}
          preload="metadata"
        />
        
        {!showControls && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="absolute bottom-3 right-3 z-10 rounded-full p-1 bg-black/30 hover:bg-black/50 w-8 h-8 flex items-center justify-center"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={(node) => {
        inViewRef(node);
        if (node) containerRef.current = node;
      }}
      className={cn(
        "relative overflow-hidden bg-black", 
        className
      )}
      onClick={() => onClick?.()}
    >
      {useAspectRatio ? (
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
      ) : (
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
      )}
      
      {!showControls && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-10 rounded-full p-1 bg-black/30 hover:bg-black/50 w-8 h-8 flex items-center justify-center"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-white" />
          ) : (
            <Volume2 className="h-4 w-4 text-white" />
          )}
        </Button>
      )}

      {productLinks.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {productLinks.map((link) => (
            <div
              key={link.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${link.position_x || 50}%`,
                top: `${link.position_y || 50}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Button
                variant="secondary"
                className="bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm"
                onClick={() => window.open(link.url, '_blank')}
              >
                {link.title}
                {link.price && ` - $${link.price}`}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
