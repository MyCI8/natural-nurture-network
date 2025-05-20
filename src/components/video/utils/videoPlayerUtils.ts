
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
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Check if URL is an image file
 */
export const isImagePost = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
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
  if (video.thumbnail_url) return video.thumbnail_url;
  
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
