
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VideoProfileInfoProps {
  video: any;
  controlsVisible: boolean;
}

const VideoProfileInfo: React.FC<VideoProfileInfoProps> = ({ video, controlsVisible }) => {
  if (!video || !video.creator) return null;
  
  // Get the first letter of the username for the avatar fallback
  const fallbackText = video.creator.username?.charAt(0).toUpperCase() || '?';
  
  return (
    <div className={cn(
      "absolute bottom-4 left-4 right-16 z-40 p-2 rounded-lg pointer-events-auto",
      "transition-opacity duration-300 ease-in-out",
      controlsVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-white">
          <AvatarImage src={video.creator.avatar_url} alt={video.creator.username} />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <span className="font-semibold text-white text-shadow-sm">
            {video.creator.username || 'Unknown'}
          </span>
          
          {video.creator.full_name && (
            <span className="text-sm text-white/80 text-shadow-sm">
              {video.creator.full_name}
            </span>
          )}
        </div>
      </div>
      
      {/* Video Description - Added as requested */}
      {video.description && (
        <div className="mt-2 text-white text-sm line-clamp-2 text-shadow-sm bg-black/60 p-2 rounded-md">
          {video.description}
        </div>
      )}
    </div>
  );
};

export default VideoProfileInfo;
