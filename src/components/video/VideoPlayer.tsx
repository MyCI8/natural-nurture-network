
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface VideoPlayerProps {
  video: any;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  showControls?: boolean;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  isFullscreen?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain';
  useAspectRatio?: boolean;
  visibleProductLink?: string | null;
  toggleProductLink?: (linkId: string) => void;
  onClick?: () => void;
  onClose?: () => void; // Added this prop to fix the type error
}

const VideoPlayer = ({
  video,
  productLinks = [],
  autoPlay = false,
  showControls = false,
  globalAudioEnabled = false,
  onAudioStateChange,
  isFullscreen = false,
  className = '',
  objectFit = 'cover',
  useAspectRatio = true,
  visibleProductLink = null,
  toggleProductLink,
  onClick,
  onClose
}: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(!globalAudioEnabled);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showProductButton, setShowProductButton] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setIsMuted(!globalAudioEnabled);
  }, [globalAudioEnabled]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onAudioStateChange?.(!isMuted);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleProductButton = () => {
    setShowProductButton(!showProductButton);
  };

  const handleProductButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleProductButton();
  };

  const handleVideoClick = () => {
    if (onClick) {
      onClick();
    } else if (onClose) {
      // Use onClose as fallback if provided
      onClose();
    }
  };

  return (
    <div
      className={`video-container relative ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        cursor: (onClick || onClose) ? 'pointer' : 'auto'
      }}
      onClick={handleVideoClick}
    >
      <ReactPlayer
        ref={playerRef}
        url={video?.video_url}
        playing={isPlaying}
        muted={isMuted}
        controls={showControls}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: objectFit,
        }}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
