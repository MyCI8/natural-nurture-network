
/**
 * Unified media utilities for handling both videos and images
 */

export type MediaType = 'video' | 'image' | 'youtube' | 'unknown';

export interface MediaInfo {
  type: MediaType;
  isVideo: boolean;
  isImage: boolean;
  isYoutube: boolean;
  aspectRatio?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

/**
 * Detect media type from URL or file
 */
export const detectMediaType = (url: string): MediaType => {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  
  // Check for YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  
  // Check for video extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'video';
  }
  
  // Check for image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'image';
  }
  
  // For blob URLs, we can't determine the type from the URL alone
  // This will be handled by storing the type during upload
  return 'unknown';
};

/**
 * Get media info from URL with optional type override
 */
export const getMediaInfo = (url: string, knownType?: MediaType): MediaInfo => {
  const type = knownType || detectMediaType(url);
  
  return {
    type,
    isVideo: type === 'video',
    isImage: type === 'image', 
    isYoutube: type === 'youtube'
  };
};

/**
 * Get optimal aspect ratio for media display
 */
export const getOptimalAspectRatio = (mediaInfo: MediaInfo, container: { width: number; height: number }) => {
  if (mediaInfo.naturalWidth && mediaInfo.naturalHeight) {
    return mediaInfo.naturalWidth / mediaInfo.naturalHeight;
  }
  
  // Default aspect ratios
  if (mediaInfo.isImage) {
    return null; // Let images use their natural aspect ratio
  }
  
  if (mediaInfo.isVideo || mediaInfo.isYoutube) {
    return 16 / 9; // Default video aspect ratio
  }
  
  return 4 / 5; // Default fallback
};

/**
 * Calculate container dimensions that preserve aspect ratio
 */
export const calculateContainerDimensions = (
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  const aspectRatio = naturalWidth / naturalHeight;
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width, height };
};

/**
 * Calculate optimal display dimensions for feed
 */
export const calculateFeedDimensions = (
  naturalWidth: number,
  naturalHeight: number,
  feedWidth: number = 400
) => {
  const aspectRatio = naturalWidth / naturalHeight;
  
  // For images in the feed
  if (aspectRatio > 1) {
    // Landscape images - limit height more
    const maxHeight = 400;
    return {
      width: feedWidth,
      height: Math.min(feedWidth / aspectRatio, maxHeight),
      aspectRatio
    };
  } else {
    // Portrait images - limit height but allow more space
    const maxHeight = 600;
    return {
      width: feedWidth,
      height: Math.min(feedWidth / aspectRatio, maxHeight),
      aspectRatio
    };
  }
};

/**
 * Check if media needs special handling
 */
export const requiresSpecialHandling = (mediaInfo: MediaInfo): boolean => {
  return mediaInfo.isYoutube;
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('.');
    
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  } catch (e) {
    // Handle relative URLs or malformed URLs
    const parts = url.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  }
  
  return null;
};

/**
 * Validate media file type
 */
export const isValidMediaFile = (file: File): { isValid: boolean; type: MediaType; error?: string } => {
  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (videoTypes.includes(file.type)) {
    return { isValid: true, type: 'video' };
  }
  
  if (imageTypes.includes(file.type)) {
    return { isValid: true, type: 'image' };
  }
  
  return { 
    isValid: false, 
    type: 'unknown', 
    error: `Unsupported file type: ${file.type}. Please upload a video (MP4, WebM, OGG) or image (JPEG, PNG, GIF, WebP).` 
  };
};

/**
 * Check if media should use dynamic sizing in feed
 */
export const shouldUseDynamicSizing = (mediaInfo: MediaInfo): boolean => {
  return mediaInfo.isImage;
};
