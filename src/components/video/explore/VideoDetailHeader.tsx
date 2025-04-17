
import React, { useState } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoDetailHeaderProps {
  handleClose: () => void;
  handleToggleMute: () => void;
  isMuted: boolean;
  isHovering: boolean;
  controlsVisible?: boolean;
  isMobile?: boolean;
}

const VideoDetailHeader: React.FC<VideoDetailHeaderProps> = ({
  handleClose,
  handleToggleMute,
  isMuted,
  isHovering,
  controlsVisible = true,
  isMobile = false
}) => {
  // Only show on desktop or if controls are visible on mobile
  const shouldShow = !isMobile || controlsVisible;
  
  if (!shouldShow) return null;

  return (
    <div 
      className={cn(
        "absolute top-0 left-0 right-0 z-30 p-4 flex justify-between transition-opacity duration-300",
        (isHovering || controlsVisible) ? "opacity-100" : "opacity-0"
      )}
    >
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleClose}
        className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation"
      >
        <X className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleToggleMute}
        className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default VideoDetailHeader;
