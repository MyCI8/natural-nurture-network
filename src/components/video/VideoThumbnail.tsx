
import React from "react";
import { Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { Video } from "@/types/video";
import { getThumbnailUrl, isYoutubeVideo, isUploadedVideo, isImagePost, stringToColor } from "@/utils/videoUtils";

interface VideoThumbnailProps {
  video: Video;
  width?: string;
  height?: string;
  className?: string;
}

export const VideoThumbnail = ({ 
  video,
  width = "w-16",
  height = "h-10",
  className = ""
}: VideoThumbnailProps) => {
  // Try to get the thumbnail URL from video_url if thumbnail_url is null
  const thumbnailUrl = getThumbnailUrl(video);
  
  // For debugging
  console.log(`VideoThumbnail for ${video.id}: thumbnailUrl = ${thumbnailUrl}, video_url = ${video.video_url}, isImage = ${isImagePost(video.video_url || '')}`);
  
  const isImage = isImagePost(video.video_url || '');
  const videoType = isYoutubeVideo(video.video_url || '') ? 'youtube' : 
                    isUploadedVideo(video.video_url || '') ? 'uploaded' : 
                    isImage ? 'image' : 'unknown';
  
  if (thumbnailUrl) {
    return (
      <div className={`${width} ${height} relative overflow-hidden rounded ${className}`}>
        <img 
          src={thumbnailUrl} 
          alt={video.title || ''} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log(`Error loading thumbnail for video ${video.id}`);
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
            {isImage ? <ImageIcon className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
            {videoType === 'youtube' && (
              <span className="absolute -bottom-6 text-xs text-white bg-black/60 px-1 rounded">YouTube</span>
            )}
            {videoType === 'image' && (
              <span className="absolute -bottom-6 text-xs text-white bg-black/60 px-1 rounded">Image</span>
            )}
          </div>
        </div>
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
      {isImage ? <ImageIcon className="h-4 w-4 text-white" /> : <VideoIcon className="h-4 w-4 text-white" />}
      <span className="text-xs text-white ml-1">{initials}</span>
    </div>
  );
};

export default VideoThumbnail;
