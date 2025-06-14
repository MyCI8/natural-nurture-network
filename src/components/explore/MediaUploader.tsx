
import { useState } from "react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { MediaPreviewCard } from "./MediaPreviewCard";

interface MediaUploaderProps {
  mediaPreview: string | null;
  isYoutubeLink: boolean;
  videoUrl: string;
  onMediaUpload: (file: File) => Promise<void>;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  compact?: boolean;
}

export function MediaUploader({
  mediaPreview,
  isYoutubeLink,
  videoUrl,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false
}: MediaUploaderProps) {

  const handleMediaUpdate = (newUrl: string) => {
    // This would be called when media is edited (cropped, trimmed, etc.)
    // For now, we'll treat it as a new upload
    onVideoLinkChange(newUrl);
  };

  return (
    <div className="space-y-2">
      {mediaPreview ? (
        <MediaPreviewCard
          mediaPreview={mediaPreview}
          isYoutubeLink={isYoutubeLink}
          videoUrl={videoUrl}
          onClearMedia={onClearMedia}
          onMediaUpdate={handleMediaUpdate}
          compact={compact}
        />
      ) : (
        <EnhancedMediaUploader
          onMediaUpload={onMediaUpload}
          onVideoLinkChange={onVideoLinkChange}
          compact={compact}
          maxSizeMB={50}
          acceptedTypes={["video/*", "image/*"]}
        />
      )}
    </div>
  );
}
