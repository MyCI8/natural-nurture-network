
// Add new utility functions for video thumbnails and processing

// Check if a URL is a YouTube video
export const isYoutubeVideo = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Check if a URL is an image post
export const isImagePost = (url: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Check if a URL is a video file
export const isVideoFile = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Check if a URL is an image file
export const isImageFile = (url: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Check if media is an uploaded video (vs. YouTube, etc.)
export const isUploadedVideo = (url: string): boolean => {
  if (!url) return false;
  // Check if it's a video file and not from YouTube or other platforms
  return isVideoFile(url) && !isYoutubeVideo(url);
};

// Generate a color from a string (for consistent placeholder colors)
export const stringToColor = (str: string): string => {
  if (!str) return '#6366F1'; // Default indigo color
  
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
};

// Check if a video has carousel images
export const isCarousel = (mediaFiles: string[] | null | undefined): boolean => {
  if (!mediaFiles || !Array.isArray(mediaFiles)) return false;
  return mediaFiles.length > 0;
};

// Get thumbnail URL with fallbacks
export const getThumbnailUrl = (video: { thumbnail_url?: string | null, video_url?: string | null }): string | null => {
  // First try the explicit thumbnail URL
  if (video.thumbnail_url) return video.thumbnail_url;
  
  // Then try to generate from video URL
  const videoUrl = video.video_url;
  if (!videoUrl) return null;
  
  // YouTube thumbnail extraction
  if (isYoutubeVideo(videoUrl)) {
    const youtubeId = extractYoutubeId(videoUrl);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }
  }
  
  // For uploaded videos, we might not have a separate thumbnail
  return null;
};

// Extract YouTube video ID
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Regular YouTube URL
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  return null;
};

// Log video info for debugging
export const logVideoInfo = (video: any, prefix: string = '') => {
  if (!video) {
    console.log(`${prefix} Video is null or undefined`);
    return;
  }
  
  console.log(`${prefix} ID: ${video.id}, Title: ${video.title?.substring(0, 30)}`);
  console.log(`${prefix} Type: ${video.video_type}, URL: ${video.video_url?.substring(0, 40)}`);
  
  if (video.media_files && Array.isArray(video.media_files)) {
    console.log(`${prefix} Has ${video.media_files.length} media files (carousel)`);
  }
};

// More utility functions can be added as needed
