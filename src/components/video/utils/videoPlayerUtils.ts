
import { getCdnUrl } from '@/utils/cdnUtils';

/**
 * Check if URL is YouTube video
 */
export const isYoutubeVideo = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('youtube.com/') || url.includes('youtu.be/');
};

/**
 * Check if URL is an uploaded video file
 */
export const isUploadedVideo = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  
  // Also check for Supabase storage URLs that might be videos
  if (url.includes('supabase') && url.includes('storage/v1/object/public/')) {
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  }
  
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Check if URL is an image file
 */
export const isImagePost = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  
  // Also check for Supabase storage URLs that might be images
  if (url.includes('supabase') && url.includes('storage/v1/object/public/')) {
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }
  
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Extract YouTube video ID from URL
 */
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    
    if (videoId) {
      return videoId;
    }
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
  }
  
  return null;
};

/**
 * Get thumbnail URL for a video
 */
export const getThumbnailUrl = (video: { thumbnail_url?: string | null; video_url: string }): string | null => {
  if (video.thumbnail_url) return getCdnUrl(video.thumbnail_url);
  
  if (isYoutubeVideo(video.video_url)) {
    const videoId = getYouTubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  if (isImagePost(video.video_url)) {
    return getCdnUrl(video.video_url);
  }
  
  return null;
};

/**
 * Check if a media URL is playable directly in the browser
 */
export const isPlayableMedia = (url: string): boolean => {
  if (!url) return false;
  return isUploadedVideo(url) || isImagePost(url) || isYoutubeVideo(url);
};

/**
 * Check if a URL is a valid media URL
 */
export const isValidMediaUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get file extension from URL
 */
export const getFileExtensionFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('.');
    
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  } catch (e) {
    console.error('Error extracting file extension:', e);
  }
  
  return null;
};
