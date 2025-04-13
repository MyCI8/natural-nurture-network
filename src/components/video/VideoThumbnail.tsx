
import React from "react";
import { Video as VideoIcon } from "lucide-react";
import { Video } from "@/types/video";
import { getThumbnailUrl } from "@/utils/videoUtils";

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
  console.log(`Video ${video.id}: thumbnailUrl = ${thumbnailUrl}, video_url = ${video.video_url}`);
  
  if (thumbnailUrl) {
    return (
      <div className={`${width} ${height} relative overflow-hidden rounded ${className}`}>
        <img 
          src={thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log(`Error loading thumbnail for video ${video.id}`);
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90/f0f0f0/404040?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <VideoIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${width} ${height} bg-muted flex items-center justify-center rounded ${className}`}>
      <VideoIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default VideoThumbnail;
