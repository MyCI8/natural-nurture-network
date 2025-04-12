
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
  const thumbnailUrl = getThumbnailUrl(video);

  if (thumbnailUrl) {
    return (
      <img 
        src={thumbnailUrl} 
        alt={video.title} 
        className={`${width} ${height} object-cover rounded ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90/f0f0f0/404040?text=No+Image';
        }}
      />
    );
  }
  
  return (
    <div className={`${width} ${height} bg-muted flex items-center justify-center rounded ${className}`}>
      <VideoIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default VideoThumbnail;
