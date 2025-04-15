
import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Video, ProductLink } from '@/types/video';
import { VolumeX, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  visibleProductLink: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  toggleProductLink: (linkId: string) => void;
  playbackStarted: boolean;
  setPlaybackStarted: React.Dispatch<React.SetStateAction<boolean>>;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  onInView?: (inView: boolean) => void;
}

const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
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
  playbackStarted,
  setPlaybackStarted,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  onInView
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
  });
  
  // Update external components when inView changes
  useEffect(() => {
    if (onInView) {
      onInView(inView);
    }
  }, [inView, onInView]);
  
  // Set video ref to both the video element and inView ref
  const setRefs = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    inViewRef(el);
  };
  
  // Handle autoplay when in view
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (inView && autoPlay) {
      // Attempt to play the video
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlaybackStarted(true);
          })
          .catch(error => {
            console.error("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      // Pause when not in view
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, autoPlay, setPlaybackStarted]);
  
  // Play/pause based on visibility and autoPlay prop changes
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (autoPlay && inView) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlaybackStarted(true);
          })
          .catch(error => {
            console.error("Play prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [autoPlay, inView, setPlaybackStarted]);
  
  // Update muted state when isMuted prop changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  const containerClasses = cn(
    "relative overflow-hidden",
    isFullscreen ? "w-full h-full" : "",
    className
  );
  
  const videoClasses = cn(
    "w-full h-full",
    objectFit === 'contain' ? "object-contain" : "object-cover"
  );
  
  // Handle video click to toggle play/pause
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlaybackStarted(true);
          })
          .catch(error => {
            console.error("Play prevented:", error);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    // Call parent onClick handler if provided
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      className={containerClasses}
      onClick={onClick}
    >
      {useAspectRatio && !isFullscreen ? (
        <div 
          style={{ aspectRatio: feedAspectRatio }}
          className="w-full bg-black overflow-hidden"
        >
          <video
            ref={setRefs}
            src={video.video_url || ''}
            className={videoClasses}
            autoPlay={autoPlay}
            loop
            playsInline
            muted={isMuted}
            controls={showControls}
            preload="auto"
            onClick={handleVideoClick}
            poster={video.thumbnail_url || undefined}
          />
        </div>
      ) : (
        <video
          ref={setRefs}
          src={video.video_url || ''}
          className={videoClasses}
          autoPlay={autoPlay}
          loop
          playsInline
          muted={isMuted}
          controls={showControls}
          preload="auto"
          onClick={handleVideoClick}
          poster={video.thumbnail_url || undefined}
        />
      )}
      
      {/* Audio control button */}
      {playbackStarted && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 z-10 rounded-full bg-black/30 hover:bg-black/50 text-white h-10 w-10 pointer-events-auto touch-manipulation"
          onClick={onMuteToggle}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      )}
      
      {/* Product link popup */}
      {productLinks.map((link) => (
        <div key={link.id} className={cn(
          "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
          visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
        )}>
          <ProductLinkCard 
            link={link} 
            onClose={() => toggleProductLink(link.id)} 
          />
        </div>
      ))}
    </div>
  );
};

export default NativeVideoPlayer;
