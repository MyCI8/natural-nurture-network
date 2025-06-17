
import React, { useState } from 'react';
import { MediaContainer } from './MediaContainer';
import { Button } from '@/components/ui/button';
import { MediaInfo, getMediaInfo } from '@/utils/mediaUtils';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCw, Crop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
  onEdit?: () => void;
  onCrop?: () => void;
  onRotate?: () => void;
  onFullscreen?: () => void;
  objectFit?: 'contain' | 'cover';
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = '',
  className = '',
  showControls = true,
  onEdit,
  onCrop,
  onRotate,
  onFullscreen,
  objectFit = 'contain'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mediaInfo] = useState<MediaInfo>(() => getMediaInfo(src));

  const handlePlayPause = () => {
    // This would be implemented with a ref to the video element
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("relative group", className)}>
      <MediaContainer
        src={src}
        alt={alt}
        className="rounded-lg"
        showControls={false}
        autoPlay={false}
        muted={isMuted}
        objectFit={objectFit}
      />
      
      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-2">
              {/* Video controls */}
              {mediaInfo.isVideo && !mediaInfo.isYoutube && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePlayPause}
                    className="touch-manipulation"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="touch-manipulation"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </>
              )}
              
              {/* Image controls */}
              {mediaInfo.isImage && (
                <>
                  {onCrop && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onCrop}
                      className="touch-manipulation"
                    >
                      <Crop className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onRotate && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onRotate}
                      className="touch-manipulation"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              
              {/* Common controls */}
              {onFullscreen && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onFullscreen}
                  className="touch-manipulation"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
