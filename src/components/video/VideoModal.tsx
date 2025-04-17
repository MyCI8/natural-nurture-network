
import React, { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { 
  Dialog, 
  DialogOverlay,
  DialogPortal
} from '@/components/ui/dialog';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    onCloseClick?: () => void;
  }
>(({ className, children, onCloseClick, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="bg-black/90" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-6xl translate-x-[-50%] translate-y-[-50%] gap-0 border-none bg-black p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-hidden h-[90vh]",
        className
      )}
      {...props}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onCloseClick}
        className="absolute top-4 right-4 z-50 text-white hover:bg-black/20 h-10 w-10 p-0 rounded-full touch-manipulation"
        aria-label="Close video"
      >
        <X className="h-6 w-6 opacity-100 hover:opacity-70" />
      </Button>
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

const VideoModal: React.FC<VideoModalProps> = ({ 
  video, 
  isOpen, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const didMountRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isOpen && didMountRef.current) {
      console.log("Modal opened, video should autoplay");
    }
    didMountRef.current = true;
  }, [isOpen]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CustomDialogContent onCloseClick={onClose}>
        <div 
          className="w-full h-full flex items-center justify-center relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <VideoPlayer
            video={video}
            autoPlay={true}
            globalAudioEnabled={!isMuted}
            showControls={false}
            className="w-full h-full"
            objectFit="contain"
            useAspectRatio={false}
            isFullscreen={true}
          />

          {/* Audio control that appears on hover */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleMute}
            className={cn(
              "absolute top-4 left-4 z-50 rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 transition-opacity duration-300 touch-manipulation",
              isHovering ? "opacity-100" : "opacity-0"
            )}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

export default VideoModal;
