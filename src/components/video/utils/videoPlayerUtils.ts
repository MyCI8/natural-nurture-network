
/**
 * Check if URL is YouTube video
 */
export const isYoutubeVideo = (url: string | null): boolean => {
  if (!url) return false;
  
  return url.includes('youtube.com/') || url.includes('youtu.be/');
};

/**
 * Check if URL is an uploaded video file
 */
export const isUploadedVideo = (url: string | null): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Check if URL is an image file
 */
export const isImagePost = (url: string | null): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
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
    return false;
  }
};

/**
 * Validate if a video URL points to a playable video format
 */
export const isPlayableVideoFormat = (url: string | null): boolean => {
  if (!url) return false;
  if (!isValidUrl(url)) return false;
  
  // If it's YouTube, it should be playable
  if (isYoutubeVideo(url)) return true;
  
  // Check if it's a supported video format
  return isUploadedVideo(url);
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
  
  if (video.thumbnail_url) return video.thumbnail_url;
  
  if (!video.video_url) return null;
  
  if (isYoutubeVideo(video.video_url)) {
    const videoId = getYouTubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  if (isImagePost(video.video_url)) {
    return video.video_url;
  }
  
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

