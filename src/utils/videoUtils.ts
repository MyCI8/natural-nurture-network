
import { Video } from "@/types/video";

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export const getYoutubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Match both youtube.com/watch?v= and youtu.be/ formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
    return null;
  }
};

/**
 * Generates a thumbnail URL for a video
 */
export const getThumbnailUrl = (video: Video): string | null => {
  // First check if video has a direct thumbnail
  if (video.thumbnail_url) {
    return video.thumbnail_url;
  }
  
  // Then check if it's a YouTube video and get thumbnail from the video_url
  if (video.video_url) {
    const videoId = getYoutubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  return null;
};
