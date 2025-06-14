
import { useState, useEffect, useMemo } from "react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MediaUploaderProps {
  mediaPreview: string | null;
  isYoutubeLink: boolean;
  videoUrl: string;
  onMediaUpload: (file: File) => Promise<void>;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  compact?: boolean;
  isProcessing?: boolean;
}

export function MediaUploader({
  mediaPreview,
  isYoutubeLink,
  videoUrl,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false,
  isProcessing = false
}: MediaUploaderProps) {

  // Add debugging to track state changes
  useEffect(() => {
    console.log('🎯 MediaUploader state changed:', {
      mediaPreview: mediaPreview ? 'HAS_PREVIEW' : 'NO_PREVIEW',
      isYoutubeLink,
      videoUrl,
      isProcessing,
      previewLength: mediaPreview?.length || 0
    });
  }, [mediaPreview, isYoutubeLink, videoUrl, isProcessing]);

  // Stable computation of whether we have valid media
  const hasValidMedia = useMemo(() => {
    const hasPreview = Boolean(mediaPreview && mediaPreview.length > 0);
    console.log('🔍 MediaUploader hasValidMedia check:', {
      hasPreview,
      mediaPreview: mediaPreview ? 'EXISTS' : 'NULL',
      isProcessing
    });
    return hasPreview;
  }, [mediaPreview, isProcessing]);

  const handleMediaUpdate = (newUrl: string) => {
    // This would be called when media is edited (cropped, trimmed, etc.)
    // For now, we'll treat it as a new upload
    onVideoLinkChange(newUrl);
  };

  const renderContent = () => {
    console.log('🖼️ MediaUploader renderContent called with:', {
      isProcessing,
      hasValidMedia,
      mediaPreview: mediaPreview ? 'HAS_PREVIEW' : 'NO_PREVIEW'
    });

    if (isProcessing) {
      console.log('⏳ Showing processing state');
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

    if (hasValidMedia && mediaPreview) {
      console.log('📺 Showing preview card');
      return (
        <MediaPreviewCard
          mediaPreview={mediaPreview}
          isYoutubeLink={isYoutubeLink}
          videoUrl={videoUrl}
          onClearMedia={onClearMedia}
          onMediaUpdate={handleMediaUpdate}
          compact={compact}
        />
      );
    }
    
    console.log('📤 Showing uploader');
    return (
      <EnhancedMediaUploader
        onMediaUpload={onMediaUpload}
        onVideoLinkChange={onVideoLinkChange}
        compact={compact}
        maxSizeMB={50}
        acceptedTypes={["video/*", "image/*"]}
      />
    );
  };
  
  return (
    <div className="space-y-2">
      {renderContent()}
    </div>
  );
}
