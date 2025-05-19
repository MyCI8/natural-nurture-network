
/**
 * Convert string to consistent color for placeholders
 */
export function stringToColor(str: string): string {
  if (!str) return '#4CAF50'; // Default green if no string
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Detect if a media item is an image based on URL or MIME type
 */
export function isImageFile(url: string): boolean {
  if (!url) return false;
  
  // Check by extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  if (imageExtensions.some(ext => lowerUrl.endsWith(ext))) {
    return true;
  }
  
  // Check by content type in URL (common for storage services)
  if (lowerUrl.includes('image/')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a media array represents a carousel
 */
export function isCarousel(mediaFiles?: string[] | null): boolean {
  return Array.isArray(mediaFiles) && mediaFiles.length > 1;
}

/**
 * Export utility functions from videoPlayerUtils for consistency
 */
export { 
  isYoutubeVideo, 
  isUploadedVideo, 
  isImagePost,
  getYouTubeVideoId, 
  getThumbnailUrl,
  sanitizeVideoUrl,
  isPlayableVideoFormat,
  logVideoInfo
} from '../components/video/utils/videoPlayerUtils';
