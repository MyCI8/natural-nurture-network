
import { useState } from "react";
import { Trash2, Edit, Play, Pause, RotateCw, Crop, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaContainer } from "@/components/media/MediaContainer";
import { getMediaInfo } from "@/utils/mediaUtils";
import { VideoEditModal } from "./VideoEditModal";
import { ImageCropModal } from "@/components/ui/image-crop-modal";

interface MediaPreviewCardProps {
  mediaUrl: string;
  isYoutubeLink: boolean;
  onClearMedia: () => void;
  onMediaUpdate?: (url: string) => void;
  compact?: boolean;
  mediaType?: 'video' | 'image' | 'youtube' | 'unknown';
}

export function MediaPreviewCard({
  mediaUrl,
  isYoutubeLink,
  onClearMedia,
  onMediaUpdate,
  compact = false,
  mediaType
}: MediaPreviewCardProps) {
  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Use the passed mediaType for blob URLs, fallback to detection for regular URLs
  const mediaInfo = getMediaInfo(mediaUrl, mediaType);

  console.log('MediaPreviewCard render:', {
    mediaUrl,
    mediaInfo,
    isYoutubeLink,
    passedMediaType: mediaType
  });

  const handleEdit = () => {
    if (mediaInfo.isVideo && !isYoutubeLink) {
      setShowVideoEditModal(true);
    } else if (mediaInfo.isImage) {
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

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = e.currentTarget.parentElement?.parentElement?.querySelector('video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  // Responsive sizing: dynamic based on media aspect ratio
  const getContainerClass = () => {
    if (compact) {
      return "w-full max-w-[288px] sm:max-w-[384px] mx-auto";
    }
    return "w-full max-w-sm mx-auto";
  };

  const getMaxDimensions = () => {
    if (compact) {
      return { maxWidth: 384, maxHeight: 400 };
    }
    return { maxWidth: 400, maxHeight: 600 };
  };

  return (
    <>
      <div className="relative group">
        {/* Dynamic media preview */}
        <div className={getContainerClass()}>
          <MediaContainer
            src={mediaUrl}
            alt="Media preview"
            className="rounded-lg bg-black"
            {...getMaxDimensions()}
            preserveAspectRatio={true}
            showControls={false}
            autoPlay={false}
            muted={true}
            onLoad={setDimensions}
            onError={(error) => console.error('Media error:', error)}
            objectFit="contain"
          />
        </div>

        {/* Media Controls Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
          {/* Play/Pause for videos */}
          {mediaInfo.isVideo && !isYoutubeLink && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}

          {/* Edit/Crop button */}
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
              {mediaInfo.isImage ? <Crop className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
              {mediaInfo.isImage ? 'Crop' : 'Edit'}
            </Button>
          )}

          {/* Fullscreen for images */}
          {mediaInfo.isImage && (
            <Button
              variant="secondary"
              size="sm"
              className="touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                // Implement fullscreen view
              }}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              View
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

        {/* Dimensions info for debugging */}
        {dimensions && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {dimensions.width} × {dimensions.height}
          </div>
        )}
      </div>

      {/* Video Edit Modal */}
      <VideoEditModal
        isOpen={showVideoEditModal}
        onClose={() => setShowVideoEditModal(false)}
        videoSrc={mediaUrl}
        onSave={handleVideoEdit}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showImageCropModal}
        onClose={() => setShowImageCropModal(false)}
        imageSrc={mediaUrl}
        onCropComplete={handleImageCrop}
      />
    </>
  );
}
