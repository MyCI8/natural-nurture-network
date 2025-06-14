import { useState } from "react";

// Utility to extract first frame from video file and return a File (jpeg)
export async function generateThumbnailFromVideoFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    // Safari fix: must append to DOM briefly
    video.style.display = 'none';
    document.body.appendChild(video);

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      // Seek to time 0
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
          if (!blob) return reject('Thumbnail extraction failed (canvas.toBlob null)');
          resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
      };
      video.onerror = (err) => {
        URL.revokeObjectURL(url);
        video.remove();
        reject('Error seeking video or extracting thumbnail');
      };
      video.currentTime = 0.01; // in case 0 causes issues on some browsers
    };
    video.onerror = (err) => {
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
      // Keep aspect ratio but resize if needed
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
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add debugging wrapper for setMediaPreview
  const setMediaPreviewWithLogging = (value: string | null) => {
    console.log('🎯 SETTING mediaPreview:', value ? 'VALID_URL' : 'NULL', new Error().stack);
    setMediaPreview(value);
  };
  
  const handleMediaUpload = async (file: File): Promise<{ filename: string; previewUrl: string }> => {
    console.log('🎬 Media upload started:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    setIsProcessing(true);
    
    try {
      // Store the actual file object
      setMediaFile(file);
      console.log('✅ File object stored:', file);
      
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      console.log('🖼️ Preview URL created:', previewUrl);
      
      // Set preview FIRST and ensure it stays
      setMediaPreviewWithLogging(previewUrl);
      setIsYoutubeLink(false);
      
      console.log('🎯 MediaPreview state set, waiting before clearing processing...');
      
      // Wait a bit longer to ensure state is fully propagated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Clear processing state AFTER preview is definitely set
      setIsProcessing(false);
      
      // Generate thumbnail in background
      setTimeout(async () => {
        try {
          let thumbnail: File | null = null;
          
          if (file.type.startsWith('video/')) {
            console.log('🎥 Generating video thumbnail...');
            thumbnail = await generateThumbnailFromVideoFile(file);
          } else if (file.type.startsWith('image/')) {
            console.log('🖼️ Generating image thumbnail...');
            thumbnail = await generateThumbnailFromImageFile(file);
          }
          
          if (thumbnail) {
            setThumbnailFile(thumbnail);
            console.log('✅ Thumbnail generated successfully:', thumbnail);
          }
        } catch (err) {
          console.warn('⚠️ Thumbnail generation failed, continuing without thumbnail:', err);
        }
      }, 300);

      console.log('✅ Media upload completed successfully');
      return { filename: file.name, previewUrl };
      
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      // Clean up on error
      setMediaFile(null);
      setMediaPreviewWithLogging(null);
      setThumbnailFile(null);
      setIsProcessing(false);
      throw error;
    }
  };

  const handleVideoLinkChange = (url: string) => {
    console.log('🔗 Video link changed:', url);
    
    // Clean up any existing file data
    if (mediaPreview && !isYoutubeLink) {
      URL.revokeObjectURL(mediaPreview);
    }
    
    setIsYoutubeLink(true);
    setMediaFile(null);
    setThumbnailFile(null);
    
    const thumbnailUrl = getYouTubeThumbnail(url);
    setMediaPreviewWithLogging(thumbnailUrl);
    console.log('📺 YouTube thumbnail set:', thumbnailUrl);
  };

  const clearMediaFile = () => {
    console.log('🗑️ CLEAR MEDIA CALLED - Clearing all media');
    
    // Clean up blob URLs to prevent memory leaks
    if (mediaPreview && !isYoutubeLink) {
      URL.revokeObjectURL(mediaPreview);
    }
    
    setMediaFile(null);
    setMediaPreviewWithLogging(null);
    setThumbnailFile(null);
    setIsYoutubeLink(false);
    setIsProcessing(false);
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

  // Helper function to check if we have valid media ready for upload
  const hasValidMedia = () => {
    const hasFile = mediaFile !== null;
    const hasYouTube = isYoutubeLink && mediaPreview !== null;
    console.log('🔍 Media validation check:', {
      hasFile,
      hasYouTube,
      isProcessing,
      mediaFile: mediaFile?.name || 'none',
      mediaPreview: mediaPreview || 'none'
    });
    return (hasFile || hasYouTube) && !isProcessing;
  };

  return {
    mediaFile,
    mediaPreview,
    thumbnailFile,
    isYoutubeLink,
    isProcessing,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    setMediaPreview: setMediaPreviewWithLogging,
    hasValidMedia
  };
}
