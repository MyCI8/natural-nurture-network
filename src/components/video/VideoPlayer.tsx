
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Video, ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  showControls?: boolean;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  isFullscreen?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  productLinks = [], 
  autoPlay = true,
  showControls = true,
  globalAudioEnabled = false,
  onAudioStateChange,
  isFullscreen = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(!globalAudioEnabled);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.6,
  });

  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
  }, [globalAudioEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      const ratio = video.videoWidth / video.videoHeight;
      setAspectRatio(ratio);
      
      // Sizing adjustments to fit within container while maintaining aspect ratio
      if (containerRef.current) {
        containerRef.current.style.display = 'flex';
        containerRef.current.style.alignItems = 'center';
        containerRef.current.style.justifyContent = 'center';
      }
      
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, Aspect ratio: ${ratio}`);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [className, isFullscreen]);

  useEffect(() => {
    const handleVideoVisibility = async () => {
      if (!videoRef.current) return;

      if (inView && autoPlay) {
        try {
          await videoRef.current.play();
          const viewSessionKey = `video_${video.id}_viewed`;
          if (!sessionStorage.getItem(viewSessionKey)) {
            const { error } = await supabase.rpc('increment_video_views', { 
              video_id: video.id 
            });
            if (error) console.error('Error incrementing views:', error);
            sessionStorage.setItem(viewSessionKey, 'true');
          }
        } catch (error) {
          console.log('Autoplay prevented:', error);
        }
      } else {
        videoRef.current.pause();
      }
    };

    handleVideoVisibility();
  }, [inView, autoPlay, video.id]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMutedState = !videoRef.current.muted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    onAudioStateChange?.(newMutedState);
  };

  return (
    <div 
      ref={(node) => {
        inViewRef(node);
        if (node) containerRef.current = node;
      }}
      className={cn(
        "relative w-full overflow-hidden bg-black flex items-center justify-center", 
        isFullscreen ? "h-screen" : "max-h-[calc(100vh-120px)]",
        className
      )}
    >
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full object-contain"
        loop
        muted={isMuted}
        playsInline
        controls={showControls}
        poster={video.thumbnail_url || undefined}
        preload="metadata"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 pointer-events-none" />
      
      {!showControls && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="absolute bottom-4 right-4 text-white hover:bg-black/20 z-10"
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
      )}

      {productLinks.length > 0 && !isFullscreen && (
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
