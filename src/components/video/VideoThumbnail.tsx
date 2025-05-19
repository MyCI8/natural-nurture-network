
import React from "react";
import { Video as VideoIcon, Image as ImageIcon, Images as ImagesIcon } from "lucide-react";
import { Video } from "@/types/video";
import { 
  getThumbnailUrl, 
  isYoutubeVideo, 
  isUploadedVideo, 
  isImagePost, 
  stringToColor,
  logVideoInfo,
  isCarousel
} from "@/utils/videoUtils";

interface VideoThumbnailProps {
  video: Video;
  width?: string;
  height?: string;
  className?: string;
  showDebugInfo?: boolean;
}

export const VideoThumbnail = ({ 
  video,
  width = "w-16",
  height = "h-10",
  className = "",
  showDebugInfo = false
}: VideoThumbnailProps) => {
  // Try to get the thumbnail URL from video_url if thumbnail_url is null
  const thumbnailUrl = getThumbnailUrl(video);
  
  // For debugging
  if (showDebugInfo) {
    logVideoInfo(video, "VideoThumbnail:");
  }
  
  const isImage = isImagePost(video.video_url || '');
  const hasCarousel = isCarousel(video.media_files);
  
  const videoType = isYoutubeVideo(video.video_url || '') ? 'youtube' : 
                    isUploadedVideo(video.video_url || '') ? 'uploaded' : 
                    hasCarousel ? 'carousel' :
                    isImage ? 'image' : 'unknown';
  
  if (thumbnailUrl) {
    return (
      <div className={`${width} ${height} relative overflow-hidden rounded ${className}`}>
        <img 
          src={thumbnailUrl} 
          alt={video.title || ''} 
          className="w-full h-full object-cover"
          onError={(e) => {
            if (showDebugInfo) {
              console.log(`Error loading thumbnail for video ${video.id}`);
            }
            // Generate a colored background based on video title
            const bgColor = stringToColor(video.title || '');
            const initials = (video.title || '??').substring(0, 2).toUpperCase();
            
            // Create a colored placeholder with initials
            (e.target as HTMLImageElement).src = 
              `https://via.placeholder.com/160x90/${bgColor.substring(1)}/FFFFFF?text=${initials}`;
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            {hasCarousel ? <ImagesIcon className="h-4 w-4" /> :
             isImage ? <ImageIcon className="h-4 w-4" /> : 
             <VideoIcon className="h-4 w-4" />}
            {videoType === 'youtube' && (
              <span className="absolute -bottom-6 text-xs text-white bg-black/60 px-1 rounded">YouTube</span>
            )}
            {videoType === 'image' && (
              <span className="absolute -bottom-6 text-xs text-white bg-black/60 px-1 rounded">Image</span>
            )}
            {videoType === 'carousel' && (
              <span className="absolute -bottom-6 text-xs text-white bg-black/60 px-1 rounded">Carousel</span>
            )}
          </div>
        </div>
        
        {/* Carousel indicator */}
        {hasCarousel && (
          <div className="absolute bottom-1 right-1 left-1 flex justify-center gap-0.5">
            {video.media_files?.slice(0, 5).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full" />
            ))}
            {(video.media_files?.length || 0) > 5 && (
              <div className="w-1 h-1 bg-white rounded-full opacity-70" />
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Generate a color and initials from title for consistent placeholders
  const bgColor = stringToColor(video.title || '');
  const initials = (video.title || '??').substring(0, 2).toUpperCase();
  
  return (
    <div 
      className={`${width} ${height} bg-muted flex items-center justify-center rounded ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {hasCarousel ? <ImagesIcon className="h-4 w-4 text-white" /> :
       isImage ? <ImageIcon className="h-4 w-4 text-white" /> : 
       <VideoIcon className="h-4 w-4 text-white" />}
      <span className="text-xs text-white ml-1">{initials}</span>
    </div>
  );
};

export default VideoThumbnail;
