
import { Video } from "@/types/video";

/**
 * Checks if a video URL is from YouTube
 */
export const isYoutubeVideo = (videoUrl: string | null): boolean => {
  if (!videoUrl) return false;
  return videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
};

/**
 * Extracts YouTube video ID from a URL
 */
export const getYoutubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return null;
  }
};

/**
 * Checks if an element is fully visible in the viewport
 */
export const isElementFullyVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Logs a video view to the database if not already logged in this session
 */
export const logVideoView = async (videoId: string, supabase: any) => {
  const viewSessionKey = `video_${videoId}_viewed`;
  if (!sessionStorage.getItem(viewSessionKey)) {
    const { error } = await supabase.rpc('increment_video_views', { 
      video_id: videoId 
    });
    if (error) console.error('Error incrementing views:', error);
    sessionStorage.setItem(viewSessionKey, 'true');
  }
};
