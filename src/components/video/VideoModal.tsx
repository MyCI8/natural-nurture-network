
import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogOverlay
} from '@/components/ui/dialog';
import { Video } from '@/types/video';
import VideoPlayer from '@/components/video/VideoPlayer';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  video, 
  isOpen, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    // Only run effect when the modal opens (not on component mount)
    if (isOpen && didMountRef.current) {
      console.log("Modal opened, video should autoplay");
    }
    didMountRef.current = true;
  }, [isOpen]);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/90" />
      <DialogContent className="max-w-5xl p-0 bg-black border-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-black/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="w-full flex items-center justify-center">
            <VideoPlayer
              video={video}
              autoPlay={true}
              globalAudioEnabled={true}
              showControls={true}
              className="w-full aspect-video"
              objectFit="contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
