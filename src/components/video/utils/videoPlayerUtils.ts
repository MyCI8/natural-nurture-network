
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
 * Enhanced to better detect Supabase URLs
 */
export const isUploadedVideo = (url: string | null): boolean => {
  if (!url) return false;
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.mkv'];
  if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Improved Supabase storage URL detection
  if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
    // Check if URL contains video content hints
    if (url.includes('/video/') || url.includes('content-type=video') || 
        url.includes('/mp4/') || url.includes('/media/') ||
        url.includes('/videos/') || url.includes('/upload/')) {
      return true;
    }
    
    // Enhanced pattern matching for video extensions in storage paths
    for (const ext of videoExtensions) {
      if (url.toLowerCase().includes(ext)) {
        return true;
      }
    }
    
    // Look for video-like query parameters or path segments
    const hasVideoIndicators = [
      'video', 'media', 'mov', 'webm', 'mp4', 'avi', 'stream'
    ].some(indicator => url.toLowerCase().includes(indicator));
    
    if (hasVideoIndicators) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if URL is an image file
 * Enhanced to better detect images in Supabase
 */
export const isImagePost = (url: string | null): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
  
  // Check for file extensions
  if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Enhanced Supabase image detection
  if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
    // Check for image indicators in paths
    if (url.includes('/images/') || url.includes('/img/') || 
        url.includes('content-type=image') || url.includes('/thumbnails/')) {
      return true;
    }
    
    // Check for image extensions in storage paths
    for (const ext of imageExtensions) {
      if (url.toLowerCase().includes(ext)) {
        return true;
      }
    }
    
    // Look for image-like query parameters
    const hasImageIndicators = [
      'image', 'photo', 'picture', 'jpg', 'png', 'jpeg', 'thumbnail', 
      'poster', 'gallery', 'avatar'
    ].some(indicator => url.toLowerCase().includes(indicator));
    
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
 * Enhanced to handle CORS issues with Supabase storage
 */
export const sanitizeVideoUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (!isValidUrl(url)) return null;
  
  // If it's a Supabase storage URL, always add CORS query params
  if ((url.includes('storage.googleapis.com') || url.includes('supabase.co'))) {
    // Don't add download param if it's already there
    if (!url.includes('download=true')) {
      // Add download parameter for proper CORS headers
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}download=true`;
    }
    
    // Add cache busting parameter to force fresh request
    // This helps with CORS issues where the browser may have cached a failed request
    if (!url.includes('_ts=')) {
      const separator = url.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      return `${url}${separator}_ts=${timestamp}`;
    }
  }
  
  return url;
};

/**
 * Validate if a video URL points to a playable video format
 * Significantly enhanced to be more permissive with Supabase URLs
 */
export const isPlayableVideoFormat = (url: string | null): boolean => {
  if (!url) return false;
  if (!isValidUrl(url)) return false;
  
  // If it's YouTube, it should be playable
  if (isYoutubeVideo(url)) return true;
  
  // Always be optimistic about Supabase storage URLs
  // Let the player try them rather than blocking them early
  if (url.includes('storage.googleapis.com') || url.includes('supabase.co')) {
    // Only reject if we're very confident it's an image
    if (isImagePost(url) && !isUploadedVideo(url)) {
      return false;
    }
    
    // For all other storage URLs, be permissive
    return true;
  }
  
  // For direct URLs, check if it appears to be a video file
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
  
  if (video.media_files && Array.isArray(video.media_files)) {
    console.log(`${prefix} Has ${video.media_files.length} media files (carousel)`);
  }
};

/**
 * Preload an image to check if it can be loaded
 * Returns a promise that resolves when image is loaded or rejects if it fails
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Preload a video to check if it can be loaded
 * Returns a promise that resolves when video can play or rejects if it fails
 */
export const preloadVideo = (url: string): Promise<HTMLVideoElement> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    
    // Set timeout to avoid hanging on resources that never load
    const timeout = setTimeout(() => {
      reject(new Error(`Video preload timed out: ${url}`));
    }, 10000);
    
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      resolve(video);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load video: ${url}`));
    };
    
    // Add CORS query parameters for Supabase URLs
    video.src = sanitizeVideoUrl(url) || url;
  });
};

/**
 * Attempt to validate media availability
 * Returns a promise that resolves with true if media is available, false otherwise
 */
export const validateMediaAvailability = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // For YouTube videos, we assume they're available
    if (isYoutubeVideo(url)) return true;
    
    // For images, preload and check if they load
    if (isImagePost(url)) {
      await preloadImage(url);
      return true;
    }
    
    // For videos, preload and check if metadata loads
    if (isUploadedVideo(url)) {
      await preloadVideo(url);
      return true;
    }
    
    // For other URLs, make a HEAD request to check availability
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Media availability check failed for ${url}:`, error);
    return false;
  }
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
