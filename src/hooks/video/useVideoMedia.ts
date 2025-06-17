
import { useState } from "react";
import { MediaType, isValidMediaFile } from "@/utils/mediaUtils";
import { useMediaProcessing } from "./useMediaProcessing";

// Utility to extract first frame from video file and return a File (jpeg)
export async function generateThumbnailFromVideoFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      video.currentTime = 0;
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          video.remove();
          if (!blob) return reject('Thumbnail extraction failed');
          resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        video.remove();
        reject('Error seeking video');
      };
      video.currentTime = 0.01;
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      video.remove();
      reject('Video load failed');
    };
  });
}

// Generate thumbnail from image file
export async function generateThumbnailFromImageFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(img.src);
        if (!blob) return reject('Thumbnail generation failed');
        resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject('Image load failed');
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function useVideoMedia() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('unknown');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  // Store the actual media type for blob URLs
  const [currentMediaType, setCurrentMediaType] = useState<MediaType>('unknown');
  
  const { processMediaFile, isProcessing, error } = useMediaProcessing();
  
  const handleMediaUpload = async (file: File): Promise<{ filename: string; previewUrl: string; mediaType: MediaType }> => {
    console.log('Media upload started:', file.name);
    
    try {
      // Validate and process the file
      const result = await processMediaFile(file);
      
      // Store the actual file object and type
      setMediaFile(file);
      setMediaType(result.type);
      setCurrentMediaType(result.type); // Store the actual type for blob URLs
      setIsYoutubeLink(false);
      
      console.log('Media processed:', result);
      
      // Generate thumbnail in background
      setTimeout(async () => {
        try {
          let thumbnail: File | null = null;
          
          if (result.type === 'video') {
            thumbnail = await generateThumbnailFromVideoFile(file);
          } else if (result.type === 'image') {
            thumbnail = await generateThumbnailFromImageFile(file);
          }
          
          if (thumbnail) {
            setThumbnailFile(thumbnail);
            console.log('Thumbnail generated successfully');
          }
        } catch (err) {
          console.warn('Thumbnail generation failed:', err);
        }
      }, 300);

      console.log('Media upload completed successfully');
      return { filename: file.name, previewUrl: result.url, mediaType: result.type };
      
    } catch (error) {
      console.error('Media upload failed:', error);
      setMediaFile(null);
      setMediaType('unknown');
      setCurrentMediaType('unknown');
      setThumbnailFile(null);
      throw error;
    }
  };

  const handleVideoLinkChange = (url: string) => {
    console.log('Video link changed:', url);
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    setIsYoutubeLink(isYouTube);
    setMediaFile(null);
    setThumbnailFile(null);
    setMediaType(isYouTube ? 'youtube' : 'unknown');
    setCurrentMediaType(isYouTube ? 'youtube' : 'unknown');
  };

  const clearMediaFile = () => {
    console.log('Clearing all media');
    
    setMediaFile(null);
    setMediaType('unknown');
    setCurrentMediaType('unknown');
    setThumbnailFile(null);
    setIsYoutubeLink(false);
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

  const hasValidMedia = () => {
    const hasFile = mediaFile !== null;
    const hasYouTube = isYoutubeLink;
    return (hasFile || hasYouTube) && !isProcessing;
  };

  // Get the current media type for blob URLs
  const getCurrentMediaType = () => {
    return currentMediaType;
  };

  return {
    mediaFile,
    mediaType,
    thumbnailFile,
    isYoutubeLink,
    isProcessing,
    error,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    hasValidMedia,
    getCurrentMediaType
  };
}
