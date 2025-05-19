/**
 * Check if a video URL is a YouTube video
 */
export function isYoutubeVideo(url: string | null): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Check if a URL is a direct link to an image file
 */
export function isImagePost(url: string | null): boolean {
  if (!url) return false;
  
  // Check if URL ends with common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  const lowerCaseUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerCaseUrl.endsWith(ext)) ||
    // Also check for image content types in data URLs
    lowerCaseUrl.startsWith('data:image/');
}

/**
 * Check if a video format is playable based on its URL
 */
export function isPlayableVideoFormat(url: string | null): boolean {
  if (!url) return false;
  
  const lowerCaseUrl = url.toLowerCase();
  const playableExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  
  return playableExtensions.some(ext => lowerCaseUrl.endsWith(ext));
}

/**
 * Log video information for debugging purposes
 */
export function logVideoInfo(video: any, message: string = "Video Info:") {
  if (!video) {
    console.log("No video data to log.");
    return;
  }
  
  console.groupCollapsed(message);
    console.log("ID:", video.id);
    console.log("Title:", video.title);
    console.log("Description:", video.description);
    console.log("Video URL:", video.video_url);
    console.log("Thumbnail URL:", video.thumbnail_url);
    console.log("Creator ID:", video.creator_id);
    console.log("Status:", video.status);
    console.log("Views Count:", video.views_count);
    console.log("Likes Count:", video.likes_count);
    console.log("Created At:", video.created_at);
    console.log("Updated At:", video.updated_at);
    console.log("Video Type:", video.video_type);
    console.log("Related Article ID:", video.related_article_id);
    console.log("Show in Latest:", video.show_in_latest);
    console.log("Media Files:", video.media_files);
    console.log("Is Carousel:", video.is_carousel);
    if (video.creator) {
      console.groupCollapsed("Creator Info:");
        console.log("Creator ID:", video.creator.id);
        console.log("Creator Username:", video.creator.username);
        console.log("Creator Full Name:", video.creator.full_name);
        console.log("Creator Avatar URL:", video.creator.avatar_url);
      console.groupEnd();
    }
  console.groupEnd();
}

/**
 * Check if a URL is an image file
 */
export function isImageFile(url: string | null): boolean {
  if (!url) return false;
  
  // Check if URL ends with common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  const lowerCaseUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerCaseUrl.endsWith(ext)) ||
    // Also check for image content types in data URLs
    lowerCaseUrl.startsWith('data:image/');
}

/**
 * Check if the media_files array represents a carousel
 */
export function isCarousel(mediaFiles: string[] | null | undefined): boolean {
  return !!mediaFiles && Array.isArray(mediaFiles) && mediaFiles.length > 0;
}

/**
 * Get image URL for video thumbnail fallback
 */
export function getThumbnailUrl(video: any): string | null {
  // First try the thumbnail_url field
  if (video?.thumbnail_url) {
    return video.thumbnail_url;
  }
  
  // If it's a carousel, use the first image
  if (isCarousel(video?.media_files)) {
    return video.media_files[0];
  }
  
  return null;
}
