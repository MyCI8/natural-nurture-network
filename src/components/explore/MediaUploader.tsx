
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
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [forceShowUploader, setForceShowUploader] = useState(false);

  const hasValidMedia = useMemo(() => {
    return Boolean(videoUrl && videoUrl.length > 0);
  }, [videoUrl]);

  const handleMediaUpdate = (newUrl: string) => {
    onVideoLinkChange(newUrl);
  };

  // Clear processing timeout after 3 seconds to prevent infinite loading
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        console.warn('Processing timeout reached, forcing uploader display');
        setForceShowUploader(true);
      }, 3000); // 3 second timeout
      
      setProcessingTimeout(timeout);
      
      return () => {
        clearTimeout(timeout);
        setProcessingTimeout(null);
      };
    } else {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      setForceShowUploader(false);
    }
  }, [isProcessing]);

  console.log('MediaUploader render:', {
    videoUrl,
    hasValidMedia,
    isProcessing,
    isYoutubeLink,
    mediaType,
    error,
    forceShowUploader
  });

  // PRIORITY 1: Show media preview if we have valid media AND not processing
  if (hasValidMedia && !isProcessing) {
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

  // PRIORITY 2: Show processing state only when actively processing and no timeout
  if (isProcessing && !forceShowUploader) {
    return (
      <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Processing media...</p>
          <p className="text-xs text-muted-foreground">
            This may take a moment for larger files.
          </p>
        </div>
      </div>
    );
  }

  // PRIORITY 3: Show error state (but allow retry)
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
