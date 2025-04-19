
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Video, ProductLink } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { isElementFullyVisible, logVideoView } from './utils/videoPlayerUtils';
import ProductLinkCard from './ProductLinkCard';

interface NativeVideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  isMuted: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink: string | null;
  onClick?: () => void;
  onClose?: () => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  toggleProductLink: (linkId: string) => void;
  playbackStarted: boolean;
  setPlaybackStarted: (started: boolean) => void;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
  objectFit?: 'contain' | 'cover';
  onInView?: (inView: boolean) => void;
}

const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  video,
  productLinks = [],
  autoPlay = true,
  isMuted,
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!videoRef.current || !autoPlay) return;
    
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;
        onInView?.(isVisible);
        
        if (isVisible && autoPlay) {
          attemptPlay();
        } else if (!isVisible && !isFullscreen && videoRef.current && !showControls) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [autoPlay, isFullscreen, showControls]);
  
  useEffect(() => {
    if (!autoPlay || !videoRef.current || playbackStarted) return;
    
    if (isFullscreen || showControls || isElementFullyVisible(videoRef.current)) {
      attemptPlay();
    }
    
    const timer = setTimeout(() => {
      if (!playbackStarted && videoRef.current) {
        attemptPlay();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [autoPlay, showControls, isFullscreen]);
  
  const attemptPlay = async () => {
    if (!videoRef.current) return;
    
    try {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaybackStarted(true);
          logVideoView(video.id, supabase);
        }).catch(error => {
          console.error("First play attempt failed:", error);
          
          if (videoRef.current && !videoRef.current.muted) {
            console.log("Trying again with muted audio");
            videoRef.current.muted = true;
            
            videoRef.current.play().then(() => {
              setPlaybackStarted(true);
              logVideoView(video.id, supabase);
            }).catch(secondError => {
              console.error("Second play attempt failed:", secondError);
              
              setTimeout(() => {
                if (videoRef.current && !playbackStarted) {
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
  
  const getVideoStyle = () => {
    const baseStyle: React.CSSProperties = {
      objectFit,
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

  const shouldShowProductControls = productLinks.length > 0 && !isFullscreen;
  
  if (isFullscreen) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-black p-4", 
          "h-full w-full rounded-lg",
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
            className="absolute top-2 right-2 z-20 text-white bg-black/20 hover:bg-black/40 h-6 w-6 p-0.5 rounded-full touch-manipulation"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <video
          ref={videoRef}
          src={video.video_url || undefined}
          className="max-h-screen w-auto max-w-full rounded-md"
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
            onClick={onMuteToggle}
            className="absolute bottom-3 right-3 z-10 rounded-full p-1 bg-black/30 hover:bg-black/50 w-8 h-8 flex items-center justify-center touch-manipulation"
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
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black rounded-lg p-4", 
        className
      )}
      onClick={() => onClick?.()}
    >
      {useAspectRatio ? (
        <AspectRatio ratio={feedAspectRatio} className="w-full">
          <video
            ref={videoRef}
            src={video.video_url || undefined}
            className="w-full h-full rounded-md"
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
          className="w-full h-full rounded-md"
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
          onClick={onMuteToggle}
          className="absolute bottom-3 right-3 z-10 rounded-full p-1 bg-black/30 hover:bg-black/50 w-8 h-8 flex items-center justify-center touch-manipulation"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-white" />
          ) : (
            <Volume2 className="h-4 w-4 text-white" />
          )}
        </Button>
      )}

      {shouldShowProductControls && (
        <>
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                toggleProductLink(productLinks[0].id);
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
                onClose={() => toggleProductLink(link.id)} 
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default NativeVideoPlayer;
