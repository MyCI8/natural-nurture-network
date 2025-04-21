
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

