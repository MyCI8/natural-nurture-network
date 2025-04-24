import React, { useRef, useState, useEffect } from "react";
import { Video, ProductLink } from "@/types/video";
import { X, Heart, MessageCircle, Share2, ShoppingCart } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from "@/hooks/use-mobile";

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
  playbackStarted = false,
  setPlaybackStarted,
  useAspectRatio = true,
  feedAspectRatio = 4/5,
  objectFit = 'contain',
  onInView
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProductOverlay, setShowProductOverlay] = useState(false);
  const [inViewRef, inView] = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      onInView?.(inView);
    },
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (videoRef.current) {
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
  }, [isMuted, autoPlay, setPlaybackStarted]);

  useEffect(() => {
    if (inView && videoRef.current && !isPlaying && autoPlay) {
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
    } else if (!inView && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, autoPlay, isPlaying, setPlaybackStarted]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
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

  const renderMobileActions = () => {
    if (!isMobile) return null;
    
    return (
      <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-20">
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
            toggleProductLink?.(productLinks[0]?.id);
          }}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            // Handle share action
          }}
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  return (
    <div
      className={`relative ${className}`}
      onClick={handleVideoClick}
      ref={inViewRef}
    >
      {useAspectRatio ? (
        <AspectRatio ratio={feedAspectRatio} className="w-full h-full bg-black overflow-hidden rounded-md">
          <video
            ref={videoRef}
            src={video.video_url}
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover cursor-pointer"
            style={{ objectFit: objectFit }}
          />
        </AspectRatio>
      ) : (
        <video
          ref={videoRef}
          src={video.video_url}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover cursor-pointer rounded-md"
          style={{ objectFit: objectFit }}
        />
      )}

      {renderMobileActions()}

      {!isMobile && (
        <>
          <div className="absolute bottom-3 right-3 z-20">
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

      {productLinks.map(link => (
        visibleProductLink === link.id && (
          <div
            key={link.id}
            className="absolute bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20"
            style={{
              top: `${link.position_y ?? 50}%`,
              left: `${link.position_x ?? 50}%`,
              transform: 'translate(10px, -50%)',
              width: '200px',
              maxWidth: '200px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 className="font-semibold text-sm">{link.title}</h4>
            {link.price && <p className="text-gray-600 text-xs">${link.price.toFixed(2)}</p>}
            <Button size="sm" className="w-full mt-2" onClick={() => window.open(link.url, '_blank')}>
              Shop Now
            </Button>
          </div>
        )
      ))}

      {isFullscreen && (
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
};

export default NativeVideoPlayer;
