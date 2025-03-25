
import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@/components/ui/dialog';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

// Create a custom dialog content component without the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="bg-black/90" />
    <DialogContent
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* Removed the default DialogPrimitive.Close component that was here */}
    </DialogContent>
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

  useEffect(() => {
    if (isOpen && didMountRef.current) {
      console.log("Modal opened, video should autoplay");
    }
    didMountRef.current = true;
  }, [isOpen]);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CustomDialogContent className="max-w-6xl w-[90vw] p-0 bg-black border-none overflow-hidden flex flex-col h-[90vh] max-h-[90vh]">
        <div className="flex justify-end p-2 bg-black/80 w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-black/50 rounded-full"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative w-full h-full flex items-center justify-center flex-1 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer
              video={video}
              autoPlay={true}
              globalAudioEnabled={true}
              showControls={true}
              className="w-full h-full"
              objectFit="contain"
              useAspectRatio={false}
            />
          </div>
        </div>

        <div className="flex justify-end p-2 bg-black/80 w-full">
          {/* Bottom bar for visual balance */}
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

export default VideoModal;
