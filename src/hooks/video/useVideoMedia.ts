
import { useState } from "react";

export function useVideoMedia() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  
  const handleMediaUpload = (file: File) => {
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setIsYoutubeLink(false);
  };

  const handleVideoLinkChange = (url: string) => {
    setIsYoutubeLink(true);
    setMediaFile(null);
    
    const thumbnailUrl = getYouTubeThumbnail(url);
    setMediaPreview(thumbnailUrl);
  };

  const clearMediaFile = () => {
    if (mediaPreview && !isYoutubeLink) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
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

  return {
    mediaFile,
    mediaPreview,
    isYoutubeLink,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    setMediaPreview
  };
}
