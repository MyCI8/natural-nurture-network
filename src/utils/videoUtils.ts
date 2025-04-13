
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
    // Check if it's a YouTube URL
    const videoId = getYoutubeVideoId(video.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    // If it's a Supabase storage URL for uploaded videos, generate a consistent placeholder
    if (isUploadedVideo(video.video_url)) {
      // Generate a consistent placeholder based on the video id or title
      const seed = video.id || encodeURIComponent(video.title.substring(0, 20));
      
      // Use a more reliable placeholder service
      return `https://picsum.photos/seed/${seed}/800/450`;
    }
  }
  
  // Default placeholder if no thumbnail can be generated
  return `https://via.placeholder.com/800x450/f0f0f0/404040?text=${encodeURIComponent(video.title.substring(0, 30))}`;
};

/**
 * Checks if a video is from YouTube
 */
export const isYoutubeVideo = (videoUrl: string | null): boolean => {
  if (!videoUrl) return false;
  return videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
};

/**
 * Checks if a video is an uploaded video (from Supabase storage)
 */
export const isUploadedVideo = (videoUrl: string | null): boolean => {
  if (!videoUrl) return false;
  return videoUrl.includes('supabase.co/storage');
};

/**
 * Generates a consistent color from a string (for placeholder backgrounds)
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16);
  return '#' + '0'.repeat(6 - color.length) + color;
};
