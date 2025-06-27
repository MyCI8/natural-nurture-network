
import { useState, useMemo } from "react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MediaUploaderProps {
  mediaUrl: string;
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
  mediaUrl,
  isYoutubeLink,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false,
  isProcessing = false,
  mediaType,
  error
}: MediaUploaderProps) {
  
  // Local state for immediate preview
  const [localPreview, setLocalPreview] = useState<{
    url: string;
    type: 'video' | 'image' | 'youtube' | 'unknown';
    isYoutube: boolean;
  } | null>(null);

  // Enhanced media upload with immediate local preview
  const handleMediaUploadWithPreview = async (file: File) => {
    try {
      // Create immediate preview
      const previewUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      setLocalPreview({
        url: previewUrl,
        type: fileType,
        isYoutube: false
      });

      // Process upload in background
      await onMediaUpload(file);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setLocalPreview(null);
      throw error;
    }
  };

  // Enhanced video link change with immediate preview
  const handleVideoLinkChangeWithPreview = (url: string) => {
    if (url.trim()) {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      setLocalPreview({
        url,
        type: isYouTube ? 'youtube' : 'unknown',
        isYoutube: isYouTube
      });
    } else {
      setLocalPreview(null);
    }
    
    onVideoLinkChange(url);
  };

  // Enhanced clear with local state cleanup
  const handleClearWithPreview = () => {
    if (localPreview?.url.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview.url);
    }
    setLocalPreview(null);
    onClearMedia();
  };

  // Determine what to show: local preview takes priority, then external mediaUrl
  const currentPreview = useMemo(() => {
    if (localPreview) {
      return {
        url: localPreview.url,
        type: localPreview.type,
        isYoutube: localPreview.isYoutube
      };
    }
    
    if (mediaUrl) {
      return {
        url: mediaUrl,
        type: mediaType || 'unknown',
        isYoutube: isYoutubeLink
      };
    }
    
    return null;
  }, [localPreview, mediaUrl, mediaType, isYoutubeLink]);

  console.log('🎨 MediaUploader render:', {
    hasPreview: !!currentPreview,
    isProcessing,
    error: !!error,
    localPreview: !!localPreview,
    mediaUrl: mediaUrl?.substring(0, 30) + '...'
  });

  // Show error with retry option
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <EnhancedMediaUploader
          onMediaUpload={handleMediaUploadWithPreview}
          onVideoLinkChange={handleVideoLinkChangeWithPreview}
          compact={compact}
          maxSizeMB={50}
          acceptedTypes={["video/*", "image/*"]}
        />
      </div>
    );
  }

  // Show processing state only if no preview exists
  if (isProcessing && !currentPreview) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
        <p className="text-sm font-medium">Processing media...</p>
      </div>
    );
  }

  // Show preview if we have any media (local or external)
  if (currentPreview) {
    return (
      <MediaPreviewCard
        mediaUrl={currentPreview.url}
        isYoutubeLink={currentPreview.isYoutube}
        onClearMedia={handleClearWithPreview}
        onMediaUpdate={(url) => handleVideoLinkChangeWithPreview(url)}
        compact={compact}
        mediaType={currentPreview.type}
      />
    );
  }
  
  // Default: show upload interface
  return (
    <EnhancedMediaUploader
      onMediaUpload={handleMediaUploadWithPreview}
      onVideoLinkChange={handleVideoLinkChangeWithPreview}
      compact={compact}
      maxSizeMB={50}
      acceptedTypes={["video/*", "image/*"]}
    />
  );
}
