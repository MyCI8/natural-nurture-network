
import { useMemo, useEffect, useState } from "react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MediaUploaderProps {
  videoUrl: string;
  isYoutubeLink: boolean;
  onMediaUpload: (file: File) => Promise<void>;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  compact?: boolean;
  isProcessing?: boolean;
  mediaType?: 'video' | 'image' | 'youtube' | 'unknown';
  error?: string | null;
}

export function MediaUploader({
  videoUrl,
  isYoutubeLink,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false,
  isProcessing = false,
  mediaType,
  error
}: MediaUploaderProps) {
  // State recovery mechanism
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [forceShowPreview, setForceShowPreview] = useState(false);

  const hasValidMedia = useMemo(() => {
    return Boolean(videoUrl && videoUrl.length > 0);
  }, [videoUrl]);

  const handleMediaUpdate = (newUrl: string) => {
    onVideoLinkChange(newUrl);
  };

  // Timeout protection: if processing for too long, force show preview
  useEffect(() => {
    if (isProcessing && hasValidMedia) {
      // If we have valid media but are still processing, set a timeout
      const timeout = setTimeout(() => {
        console.warn('Processing timeout reached, forcing preview display');
        setForceShowPreview(true);
      }, 5000); // 5 second timeout
      
      setProcessingTimeout(timeout);
      
      return () => {
        clearTimeout(timeout);
        setProcessingTimeout(null);
      };
    } else {
      // Clear timeout and reset force flag when not processing
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      setForceShowPreview(false);
    }
  }, [isProcessing, hasValidMedia]);

  console.log('MediaUploader render:', {
    videoUrl,
    hasValidMedia,
    isProcessing,
    isYoutubeLink,
    mediaType,
    error,
    forceShowPreview
  });

  // PRIORITY 1: Show media preview if we have valid media OR if forced due to timeout
  if (hasValidMedia && (!isProcessing || forceShowPreview)) {
    return (
      <MediaPreviewCard
        mediaUrl={videoUrl}
        isYoutubeLink={isYoutubeLink}
        onClearMedia={onClearMedia}
        onMediaUpdate={handleMediaUpdate}
        compact={compact}
        mediaType={mediaType}
      />
    );
  }

  // PRIORITY 2: Show processing state ONLY when actively processing and no valid media OR processing with valid media (but not timed out)
  if (isProcessing && !forceShowPreview) {
    return (
      <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {hasValidMedia ? 'Finalizing...' : 'Processing media...'}
          </p>
          <p className="text-xs text-muted-foreground">
            This may take a moment for larger files.
          </p>
        </div>
      </div>
    );
  }

  // PRIORITY 3: Show error state (but still allow retry)
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <EnhancedMediaUploader
          onMediaUpload={onMediaUpload}
          onVideoLinkChange={onVideoLinkChange}
          compact={compact}
          maxSizeMB={50}
          acceptedTypes={["video/*", "image/*"]}
        />
      </div>
    );
  }
  
  // PRIORITY 4: Show upload interface (default state)
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
