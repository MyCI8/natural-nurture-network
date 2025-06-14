
import { useState } from "react";
import { Trash2, Edit, Play, Pause, RotateCw, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { VideoEditModal } from "./VideoEditModal";
import { ImageCropModal } from "@/components/ui/image-crop-modal";

interface MediaPreviewCardProps {
  videoUrl: string;
  isYoutubeLink: boolean;
  onClearMedia: () => void;
  onMediaUpdate?: (url: string) => void;
  compact?: boolean;
}

export function MediaPreviewCard({
  videoUrl,
  isYoutubeLink,
  onClearMedia,
  onMediaUpdate,
  compact = false
}: MediaPreviewCardProps) {
  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Better media type detection
  const isVideo = isYoutubeLink ? false : (
    videoUrl.includes('video') || 
    videoUrl.includes('.mp4') || 
    videoUrl.includes('.mov') || 
    videoUrl.includes('.webm') ||
    videoUrl.includes('.avi') ||
    videoUrl.startsWith('blob:') // Blob URLs are likely videos from our upload
  );
  
  const isImage = !isVideo && !isYoutubeLink && (
    videoUrl.includes('.jpg') || 
    videoUrl.includes('.jpeg') || 
    videoUrl.includes('.png') || 
    videoUrl.includes('.gif') || 
    videoUrl.includes('.webp') ||
    videoUrl.includes('image')
  );

  console.log('MediaPreviewCard render:', {
    videoUrl,
    isVideo,
    isImage,
    isYoutubeLink
  });

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

  // Responsive sizing: max-w at 48 for mobile, 72 for desktop, 4:3 aspect in compact
  const containerClass = compact
    ? "w-full max-w-[288px] sm:max-w-[384px] mx-auto"    // 48, 72 as px
    : "w-full max-w-sm mx-auto";
  const aspect = compact ? 4 / 3 : 9 / 16;

  return (
    <>
      <div className="relative group">
        {/* Responsive preview */}
        <div className={containerClass}>
          <AspectRatio ratio={aspect} className="bg-muted overflow-hidden rounded-lg">
            {isVideo && !isYoutubeLink ? (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls={false}
                muted
                loop
                autoPlay={false}
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedData={() => console.log('Video loaded successfully')}
                onError={(e) => console.error('Video error:', e)}
                style={{ background: "#0a0a0a" }}
              />
            ) : isImage ? (
              <img
                src={videoUrl}
                alt="Media preview"
                className="w-full h-full object-contain"
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => console.error('Image error:', e)}
                style={{ background: "#0a0a0a" }}
              />
            ) : (
              // YouTube preview
              <div className="relative w-full h-full">
                <img
                  src={videoUrl}
                  alt="YouTube preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-white`} />
                </div>
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Media Controls Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* Play/Pause for videos */}
          {isVideo && !isYoutubeLink && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation"
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
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}

          {/* Edit button */}
          {!isYoutubeLink && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              {isImage ? <Crop className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
              {isImage ? 'Crop' : 'Edit'}
            </Button>
          )}

          {/* Delete button */}
          <Button
            variant="destructive"
            size="sm"
            className="touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onClearMedia();
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      </div>

      {/* Video Edit Modal */}
      <VideoEditModal
        isOpen={showVideoEditModal}
        onClose={() => setShowVideoEditModal(false)}
        videoSrc={videoUrl}
        onSave={handleVideoEdit}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showImageCropModal}
        onClose={() => setShowImageCropModal(false)}
        imageSrc={videoUrl}
        onCropComplete={handleImageCrop}
      />
    </>
  );
}
