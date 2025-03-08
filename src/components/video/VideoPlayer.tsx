
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
      
      // Only adjust height if not in Instagram mode
      if (!className?.includes('instagram-video')) {
        adjustVideoHeight();
      }
    };

    const adjustVideoHeight = () => {
      if (!video || !containerRef.current) return;
      
      // Calculate height based on aspect ratio and current width
      const width = containerRef.current.clientWidth;
      const height = video.videoHeight / video.videoWidth * width;
      
      // Set container height to maintain aspect ratio
      containerRef.current.style.height = `${height}px`;
      
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, Aspect ratio: ${video.videoWidth/video.videoHeight}, Setting container height: ${height}px`);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    
    // Add resize listener to adjust video height when window is resized
    if (!className?.includes('instagram-video')) {
      window.addEventListener('resize', adjustVideoHeight);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      window.removeEventListener('resize', adjustVideoHeight);
    };
  }, [className]);

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
        // Combine refs
        inViewRef(node);
        if (node) containerRef.current = node;
      }}
      className={cn("relative w-full overflow-hidden", className, isFullscreen ? 'bg-black' : 'bg-black/5')}
      style={isFullscreen ? { height: '100vh' } : undefined}
    >
      <video
        ref={videoRef}
        src={video.video_url}
        className={cn("w-full", className, isFullscreen ? 'h-full object-contain' : 'h-auto object-contain')}
        loop
        muted={isMuted}
        playsInline
        controls={showControls}
        poster={video.thumbnail_url || undefined}
        preload="metadata"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 pointer-events-none" />
      
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
