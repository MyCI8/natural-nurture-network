
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
  const [showPreview, setShowPreview] = useState(false);
  const [debugState, setDebugState] = useState<any>({});

  const hasValidMedia = useMemo(() => {
    return Boolean(videoUrl && videoUrl.length > 0);
  }, [videoUrl]);

  // Add debug logging with timestamp
  useEffect(() => {
    const currentState = {
      timestamp: new Date().toISOString(),
      videoUrl: videoUrl?.substring(0, 50) + '...',
      hasValidMedia,
      isProcessing,
      isYoutubeLink,
      mediaType,
      error: error?.substring(0, 100),
      showPreview
    };
    
    setDebugState(currentState);
    console.log('📊 MediaUploader state update:', currentState);
  }, [videoUrl, hasValidMedia, isProcessing, isYoutubeLink, mediaType, error, showPreview]);

  // Implement delayed preview display to ensure state propagation
  useEffect(() => {
    if (hasValidMedia && !isProcessing) {
      // Small delay to ensure all states are synchronized
      const timer = setTimeout(() => {
        console.log('⏰ Enabling preview display after state sync delay');
        setShowPreview(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [hasValidMedia, isProcessing]);

  // Failsafe mechanism - force preview after 2 seconds if we have valid media
  useEffect(() => {
    if (isProcessing && hasValidMedia) {
      const failsafeTimer = setTimeout(() => {
        console.log('🚨 Failsafe triggered - forcing preview display');
        setShowPreview(true);
      }, 2000);
      
      return () => clearTimeout(failsafeTimer);
    }
  }, [isProcessing, hasValidMedia]);

  const handleMediaUpdate = (newUrl: string) => {
    onVideoLinkChange(newUrl);
  };

  console.log('🎨 MediaUploader render decision:', {
    error: !!error,
    hasValidMedia,
    showPreview,
    isProcessing,
    decision: error ? 'ERROR' : (hasValidMedia && showPreview) ? 'PREVIEW' : isProcessing ? 'PROCESSING' : 'UPLOAD'
  });

  // PRIORITY 1: Show error state (but allow retry)
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

  // PRIORITY 2: Show media preview if we have valid media AND preview is enabled
  if (hasValidMedia && showPreview) {
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

  // PRIORITY 3: Show processing state
  if (isProcessing) {
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
