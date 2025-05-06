
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
 * Export utility functions from videoPlayerUtils for consistency
 */
export { 
  isYoutubeVideo, 
  isUploadedVideo, 
  isImagePost,
  getYouTubeVideoId, 
  getThumbnailUrl 
} from '../components/video/utils/videoPlayerUtils';
