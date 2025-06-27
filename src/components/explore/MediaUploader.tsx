
import { useState, useMemo, useEffect } from "react";
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
  
  // Local state for immediate preview - this is the key fix
  const [localPreview, setLocalPreview] = useState<{
    url: string;
    type: 'video' | 'image' | 'youtube' | 'unknown';
    isYoutube: boolean;
  } | null>(null);

  // Clear local preview when external mediaUrl is cleared
  useEffect(() => {
    if (!mediaUrl && localPreview) {
      console.log('🧹 Clearing local preview because external mediaUrl was cleared');
      if (localPreview.url.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview.url);
      }
      setLocalPreview(null);
    }
  }, [mediaUrl, localPreview]);

  // Handle media upload with immediate local preview
  const handleMediaUploadWithPreview = async (file: File) => {
    console.log('📁 Starting media upload:', file.name);
    
    try {
      // Create immediate preview URL
      const previewUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Set local preview immediately - this should show the preview right away
      const preview = {
        url: previewUrl,
        type: fileType,
        isYoutube: false
      };
      
      console.log('✅ Setting local preview:', preview);
      setLocalPreview(preview);

      // Process upload in background
      await onMediaUpload(file);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      // Clear local preview on error
      setLocalPreview(null);
      throw error;
    }
  };

  // Handle video link change with immediate preview
  const handleVideoLinkChangeWithPreview = (url: string) => {
    console.log('🔗 Video link changed:', url);
    
    if (url.trim()) {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      const preview = {
        url,
        type: isYouTube ? 'youtube' : 'unknown',
        isYoutube: isYouTube
      };
      
      console.log('✅ Setting link preview:', preview);
      setLocalPreview(preview);
    } else {
      console.log('🧹 Clearing preview - empty URL');
      setLocalPreview(null);
    }
    
    onVideoLinkChange(url);
  };

  // Clear both local and external state
  const handleClearWithPreview = () => {
    console.log('🧹 Clearing all media');
    
    if (localPreview?.url.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview.url);
    }
    setLocalPreview(null);
    onClearMedia();
  };

  // Simplified preview logic - local preview takes absolute priority
  const currentPreview = useMemo(() => {
    // Priority 1: Local preview (just uploaded/linked)
    if (localPreview) {
      console.log('🖼️ Showing local preview:', localPreview.url.substring(0, 50));
      return localPreview;
    }
    
    // Priority 2: External media URL (from props)
    if (mediaUrl) {
      console.log('🖼️ Showing external preview:', mediaUrl.substring(0, 50));
      return {
        url: mediaUrl,
        type: mediaType || 'unknown',
        isYoutube: isYoutubeLink
      };
    }
    
    console.log('🖼️ No preview to show');
    return null;
  }, [localPreview, mediaUrl, mediaType, isYoutubeLink]);

  console.log('🎨 MediaUploader render state:', {
    hasLocalPreview: !!localPreview,
    hasExternalPreview: !!mediaUrl,
    currentPreview: !!currentPreview,
    isProcessing,
    error: !!error
  });

  // Show error state
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

  // Show preview if we have any media
  if (currentPreview) {
    console.log('🎯 Rendering MediaPreviewCard with:', currentPreview.url.substring(0, 50));
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
  console.log('🎯 Rendering EnhancedMediaUploader');
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
