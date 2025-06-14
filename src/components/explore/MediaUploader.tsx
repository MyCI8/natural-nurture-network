
import { useMemo } from "react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { Loader2 } from "lucide-react";

interface MediaUploaderProps {
  videoUrl: string;
  isYoutubeLink: boolean;
  onMediaUpload: (file: File) => Promise<void>;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  compact?: boolean;
  isProcessing?: boolean;
}

export function MediaUploader({
  videoUrl,
  isYoutubeLink,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false,
  isProcessing = false
}: MediaUploaderProps) {

  // Check if we have valid media to show
  const hasValidMedia = useMemo(() => {
    return Boolean(videoUrl && videoUrl.length > 0);
  }, [videoUrl]);

  const handleMediaUpdate = (newUrl: string) => {
    onVideoLinkChange(newUrl);
  };

  console.log('MediaUploader render:', {
    videoUrl,
    hasValidMedia,
    isProcessing,
    isYoutubeLink
  });

  if (isProcessing) {
    return (
      <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Processing media...</p>
          <p className="text-xs text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (hasValidMedia) {
    return (
      <MediaPreviewCard
        videoUrl={videoUrl}
        isYoutubeLink={isYoutubeLink}
        onClearMedia={onClearMedia}
        onMediaUpdate={handleMediaUpdate}
        compact={compact}
      />
    );
  }
  
  return (
    <EnhancedMediaUploader
      onMediaUpload={onMediaUpload}
      onVideoLinkChange={onVideoLinkChange}
      compact={compact}
      maxSizeMB={50}
      acceptedTypes={["video/*", "image/*"]}
    />
  );
}
