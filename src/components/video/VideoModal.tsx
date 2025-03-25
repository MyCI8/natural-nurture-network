
import React from 'react';
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
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/90" />
      <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
        <div className="relative w-full h-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-black/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <VideoPlayer
            video={video}
            autoPlay={true}
            globalAudioEnabled={true}
            showControls={true}
            className="w-full aspect-video"
            objectFit="contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
