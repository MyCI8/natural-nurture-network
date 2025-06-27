
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
  const [mediaUrl, setMediaUrl] = useState<string>('');
  
  const { processMediaFile, isProcessing, error, clearProcessing } = useMediaProcessing();
  
  const handleMediaUpload = async (file: File): Promise<{ filename: string; previewUrl: string; mediaType: MediaType }> => {
    console.log('🚀 Media upload started:', file.name, 'size:', file.size);
    
    try {
      // Basic file size check (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please select a file smaller than 50MB.');
      }

      // Process the file (this will set isProcessing to true)
      const result = await processMediaFile(file);
      
      // ATOMIC STATE UPDATE - Update ALL states at once
      console.log('⚡ Processing completed - updating all states atomically');
      setMediaFile(file);
      setMediaType(result.type);
      setMediaUrl(result.url);
      setIsYoutubeLink(false);
      
      // Clear processing state AFTER all other states are updated
      clearProcessing();
      
      console.log('✅ All states updated successfully:', {
        hasFile: true,
        type: result.type,
        url: result.url,
        processingCleared: true
      });
      
      // Generate thumbnail in background (non-blocking)
      generateThumbnailInBackground(file, result.type);

      // Return success data
      return { filename: file.name, previewUrl: result.url, mediaType: result.type };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process media';
      console.error('❌ Media upload failed:', errorMessage);
      
      // Clean up on error
      clearAllStates();
      throw new Error(errorMessage);
    }
  };

  const generateThumbnailInBackground = async (file: File, type: MediaType) => {
    try {
      console.log('🖼️ Starting background thumbnail generation...');
      let thumbnail: File | null = null;
      
      if (type === 'video') {
        thumbnail = await generateThumbnailFromVideoFile(file);
      } else if (type === 'image') {
        thumbnail = await generateThumbnailFromImageFile(file);
      }
      
      if (thumbnail) {
        setThumbnailFile(thumbnail);
        console.log('✅ Thumbnail generated successfully in background');
      }
    } catch (err) {
      console.warn('⚠️ Background thumbnail generation failed (non-critical):', err);
    }
  };

  const handleVideoLinkChange = (url: string) => {
    console.log('🔗 Video link changed:', url);
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    // Update all states immediately
    setIsYoutubeLink(isYouTube);
    setMediaUrl(url);
    setMediaFile(null);
    setThumbnailFile(null);
    setMediaType(isYouTube ? 'youtube' : 'unknown');
    
    console.log('✅ Video link states updated:', {
      isYouTube,
      hasUrl: !!url,
      mediaType: isYouTube ? 'youtube' : 'unknown'
    });
  };

  const clearAllStates = () => {
    console.log('🧹 Clearing all media states');
    
    // Clean up blob URLs if any
    if (mediaFile) {
      try {
        const objectUrl = URL.createObjectURL(mediaFile);
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    setMediaFile(null);
    setMediaType('unknown');
    setThumbnailFile(null);
    setIsYoutubeLink(false);
    setMediaUrl('');
    clearProcessing();
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

  // Simplified validation - just check if we have valid media
  const hasValidMedia = () => {
    const hasFile = mediaFile !== null;
    const hasYouTube = isYoutubeLink && mediaUrl.length > 0;
    const hasUrl = mediaUrl.length > 0;
    
    const result = hasFile || hasYouTube || hasUrl;
    
    console.log('🔍 hasValidMedia check:', {
      hasFile,
      hasYouTube,
      hasUrl,
      result,
      isProcessing,
      timestamp: new Date().toISOString()
    });
    
    return result;
  };

  const getCurrentMediaType = () => {
    return mediaType;
  };

  return {
    mediaFile,
    mediaType,
    thumbnailFile,
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
    getCurrentMediaType
  };
}
