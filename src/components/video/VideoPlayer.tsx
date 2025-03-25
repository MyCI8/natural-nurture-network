
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
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Force isMuted state to sync with globalAudioEnabled prop
  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
    if (videoRef.current) {
      videoRef.current.muted = !globalAudioEnabled;
    }
  }, [globalAudioEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

  // Play the video when it's visible or when autoPlay is explicitly set true
  useEffect(() => {
    const playVideo = async () => {
      if (!videoRef.current) return;
      
      console.log("Play video attempt. inView:", inView, "autoPlay:", autoPlay);
      
      if (inView && autoPlay) {
        try {
          console.log("Attempting to play video...");
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log("Video playback started successfully");
              logVideoView();
            }).catch(error => {
              console.error("Auto-play was prevented:", error);
              // We won't force unmute here, as that would be a poor user experience
            });
          }
        } catch (error) {
          console.error("Error during video play:", error);
        }
      } else if (!inView) {
        videoRef.current.pause();
        console.log("Video paused because not in view");
      }
    };
    
    playVideo();
  }, [inView, autoPlay, video.id]);
  
  // Special handling for immediate play when used in a modal
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Modal autoplay error:", error);
        });
      }
    }
  }, [autoPlay]);

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
    if (!videoRef.current) return;
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
          src={video.video_url}
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
            src={video.video_url}
            className="w-full h-full"
            style={getVideoStyle()}
            loop
            muted={isMuted}
            playsInline
            controls={showControls}
            poster={video.thumbnail_url || undefined}
            preload="auto"
          />
        </AspectRatio>
      ) : (
        <video
          ref={videoRef}
          src={video.video_url}
          className="w-full h-full"
          style={getVideoStyle()}
          loop
          muted={isMuted}
          playsInline
          controls={showControls}
          poster={video.thumbnail_url || undefined}
          preload="auto"
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
