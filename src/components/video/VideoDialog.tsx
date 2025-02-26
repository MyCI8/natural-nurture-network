
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video } from '@/types/video';

interface VideoDialogProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoDialog = ({ video, isOpen, onClose }: VideoDialogProps) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-black overflow-hidden">
        <VideoPlayer
          video={video}
          autoPlay={true}
          showControls={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;
