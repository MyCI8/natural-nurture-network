
import { useState } from "react";
import { MediaType } from "@/utils/mediaUtils";
import { useMediaProcessing } from "./useMediaProcessing";

export function useVideoMedia() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('unknown');
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  
  const { processMediaFile, isProcessing, error } = useMediaProcessing();
  
  const handleMediaUpload = async (file: File): Promise<{ filename: string; previewUrl: string; mediaType: MediaType }> => {
    console.log('🚀 Media upload started:', file.name);
    
    try {
      // Basic size check
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Please select a file smaller than 50MB.');
      }

      // Process file
      const result = await processMediaFile(file);
      
      console.log('✅ Processing complete:', {
        url: result.url.substring(0, 50) + '...',
        type: result.type
      });
      
      // Update states
      setMediaFile(file);
      setMediaType(result.type);
      setMediaUrl(result.url);
      setIsYoutubeLink(false);
      
      return { 
        filename: file.name, 
        previewUrl: result.url, 
        mediaType: result.type 
      };
      
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      clearAllStates();
      throw error;
    }
  };

  const handleVideoLinkChange = (url: string) => {
    console.log('🔗 Video link changed:', url);
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    setIsYoutubeLink(isYouTube);
    setMediaUrl(url);
    setMediaFile(null);
    setMediaType(isYouTube ? 'youtube' : 'unknown');
  };

  const clearAllStates = () => {
    console.log('🧹 Clearing all states');
    
    if (mediaUrl && mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }
    
    setMediaFile(null);
    setMediaType('unknown');
    setIsYoutubeLink(false);
    setMediaUrl('');
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    try {
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
    }
    
    return null;
  };

  // Simplified validation
  const hasValidMedia = () => {
    const result = Boolean(mediaUrl || mediaFile);
    
    console.log('🔍 hasValidMedia:', {
      result,
      hasUrl: Boolean(mediaUrl),
      hasFile: Boolean(mediaFile)
    });
    
    return result;
  };

  return {
    mediaFile,
    mediaType,
    isYoutubeLink,
    mediaUrl,
    isProcessing,
    error,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile: clearAllStates,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    hasValidMedia,
    getCurrentMediaType: () => mediaType
  };
}
