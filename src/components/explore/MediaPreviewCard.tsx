
import { useState } from "react";
import { Trash2, Edit, Play, Pause, RotateCw, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { VideoEditModal } from "./VideoEditModal";
import { ImageCropModal } from "@/components/ui/image-crop-modal";

interface MediaPreviewCardProps {
  mediaPreview: string;
  isYoutubeLink: boolean;
  videoUrl: string;
  onClearMedia: () => void;
  onMediaUpdate?: (url: string) => void;
  compact?: boolean;
}

export function MediaPreviewCard({
  mediaPreview,
  isYoutubeLink,
  videoUrl,
  onClearMedia,
  onMediaUpdate,
  compact = false
}: MediaPreviewCardProps) {
  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isVideo = mediaPreview.includes('video') || videoUrl.includes('.mp4') || videoUrl.includes('.mov') || videoUrl.includes('.webm');
  const isImage = !isVideo && !isYoutubeLink;

  const handleEdit = () => {
    if (isVideo && !isYoutubeLink) {
      setShowVideoEditModal(true);
    } else if (isImage) {
      setShowImageCropModal(true);
    }
  };

  const handleVideoEdit = (editedVideoUrl: string) => {
    onMediaUpdate?.(editedVideoUrl);
    setShowVideoEditModal(false);
  };

  const handleImageCrop = (croppedImageUrl: string) => {
    onMediaUpdate?.(croppedImageUrl);
    setShowImageCropModal(false);
  };

  return (
    <>
      <div className="relative group">
        {/* Ultra compact mobile-optimized preview */}
        <div className={`w-full ${compact ? 'max-w-32' : 'max-w-sm'} mx-auto`}>
          <AspectRatio ratio={compact ? 16/9 : 9/16} className="bg-muted overflow-hidden rounded-lg">
            {isVideo && !isYoutubeLink ? (
              <video
                src={mediaPreview}
                className="w-full h-full object-cover"
                controls={false}
                muted
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : isImage ? (
              <img
                src={mediaPreview}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
            ) : (
              // YouTube preview
              <div className="relative w-full h-full">
                <img
                  src={mediaPreview}
                  alt="YouTube preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className={`${compact ? 'h-6 w-6' : 'h-12 w-12'} text-white`} />
                </div>
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Media Controls Overlay - smaller buttons for compact mode */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
          {/* Play/Pause for videos */}
          {isVideo && !isYoutubeLink && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation text-xs"
              onClick={(e) => {
                e.stopPropagation();
                const video = e.currentTarget.parentElement?.parentElement?.querySelector('video');
                if (video) {
                  if (isPlaying) {
                    video.pause();
                  } else {
                    video.play();
                  }
                }
              }}
            >
              {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              {compact ? '' : (isPlaying ? 'Pause' : 'Play')}
            </Button>
          )}

          {/* Edit button */}
          {!isYoutubeLink && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              {isImage ? <Crop className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
              {compact ? '' : (isImage ? 'Crop' : 'Edit')}
            </Button>
          )}

          {/* Delete button */}
          <Button
            variant="destructive"
            size="sm"
            className="touch-manipulation text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClearMedia();
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {compact ? '' : 'Remove'}
          </Button>
        </div>
      </div>

      {/* Video Edit Modal */}
      <VideoEditModal
        isOpen={showVideoEditModal}
        onClose={() => setShowVideoEditModal(false)}
        videoSrc={mediaPreview}
        onSave={handleVideoEdit}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showImageCropModal}
        onClose={() => setShowImageCropModal(false)}
        imageSrc={mediaPreview}
        onCropComplete={handleImageCrop}
      />
    </>
  );
}
