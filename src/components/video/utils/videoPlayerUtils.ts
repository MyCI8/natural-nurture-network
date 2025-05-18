
/**
 * Video player utility functions
 */
import { Video } from '@/types/video';

/**
 * Check if URL is YouTube video
 */
export const isYoutubeVideo = (url: string | null): boolean => {
  if (!url) return false;
  
  return url.includes('youtube.com/') || url.includes('youtu.be/');
};

/**
 * Check if URL is an uploaded video file based on extension or Supabase storage pattern
 */
export const isUploadedVideo = (url: string | null): boolean => {
  if (!url) return false;
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.mkv'];
  if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Special handling for Supabase storage URLs
  if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
    // Check if URL contains video content hints
    if (url.includes('/video/') || url.includes('content-type=video') || 
        url.includes('/mp4/') || url.includes('/media/')) {
      return true;
    }
    
    // Look for video-like query parameters or path segments
    const hasVideoIndicators = ['.mp4', 'video', 'media', 'mov', 'webm']
      .some(indicator => url.toLowerCase().includes(indicator));
    
    if (hasVideoIndicators) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if URL is an image file
 */
export const isImagePost = (url: string | null): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  
  // Check for file extensions
  if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Check for image indicators in Supabase URLs
  if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
    if (url.includes('/images/') || url.includes('content-type=image')) {
      return true;
    }
    
    // Look for image-like query parameters
    const hasImageIndicators = ['image', 'photo', 'picture', 'jpg', 'png', 'jpeg']
      .some(indicator => url.toLowerCase().includes(indicator));
    
    if (hasImageIndicators) {
      return true;
    }
  }
  
  return false;
};

/**
 * Validate if a URL is properly formatted
 */
export const isValidUrl = (url: string | null): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error("Invalid URL format:", url);
    return false;
  }
};

/**
 * Attempt to sanitize and normalize video URLs
 * This can help with URLs that don't have explicit extensions
 */
export const sanitizeVideoUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (!isValidUrl(url)) return null;
  
  // If it's a Supabase storage URL and doesn't have CORS query params, add them
  if ((url.includes('storage.googleapis.com') || url.includes('supabase.co')) && 
      !url.includes('download=true')) {
    
    // Add download parameter for proper CORS headers
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}download=true`;
  }
  
  return url;
};

/**
 * Validate if a video URL points to a playable video format
 * This is enhanced to better detect playable content
 */
export const isPlayableVideoFormat = (url: string | null): boolean => {
  if (!url) return false;
  if (!isValidUrl(url)) return false;
  
  // If it's YouTube, it should be playable
  if (isYoutubeVideo(url)) return true;
  
  // If it's a direct video file or appears to be from storage
  if (isUploadedVideo(url)) {
    return true;
  }
  
  // Return false for all other URLs
  return false;
};

/**
 * Extract YouTube video ID from URL
 */
export const getYouTubeVideoId = (url: string | null): string | null => {
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
export const getThumbnailUrl = (video: { thumbnail_url?: string | null; video_url: string | null }): string | null => {
  if (!video) return null;
  
  // First try the explicit thumbnail URL if available
  if (video.thumbnail_url) return video.thumbnail_url;
  
  if (!video.video_url) return null;
  
  // Generate YouTube thumbnail if it's a YouTube video
  if (isYoutubeVideo(video.video_url)) {
    const videoId = getYouTubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  // If it's an image post, use the image URL as its own thumbnail
  if (isImagePost(video.video_url)) {
    return video.video_url;
  }
  
  // For other video types, we don't have a thumbnail
  return null;
};

/**
 * Get a fallback image if video fails to load
 */
export const getVideoFallbackImage = (video: Video | null): string | null => {
  if (!video) return null;
  
  // Try to use thumbnail image first
  if (video.thumbnail_url) return video.thumbnail_url;
  
  // If it's YouTube, generate thumbnail from ID
  if (video.video_url && isYoutubeVideo(video.video_url)) {
    const videoId = getYouTubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  // If it's an image post, use that
  if (video.video_url && isImagePost(video.video_url)) {
    return video.video_url;
  }
  
  // Default placeholder
  return '/placeholder.svg';
};

/**
 * Debug utility: log video info to help with troubleshooting
 */
export const logVideoInfo = (video: Video | null, prefix: string = "") => {
  if (!video) {
    console.log(`${prefix} Video is null`);
    return;
  }
  
  console.log(`${prefix} Video ID: ${video.id}`);
  console.log(`${prefix} Video URL: ${video.video_url}`);
  console.log(`${prefix} Thumbnail URL: ${video.thumbnail_url}`);
  console.log(`${prefix} Is YouTube: ${isYoutubeVideo(video.video_url)}`);
  console.log(`${prefix} Is Uploaded Video: ${isUploadedVideo(video.video_url)}`);
  console.log(`${prefix} Is Image: ${isImagePost(video.video_url)}`);
  console.log(`${prefix} Is Playable: ${isPlayableVideoFormat(video.video_url)}`);
};

/**
 * Convert data URI to Blob for better handling
 */
export const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};
