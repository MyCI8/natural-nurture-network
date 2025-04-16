
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoProfileInfoProps {
  video: Video;
  controlsVisible: boolean;
}

const VideoProfileInfo: React.FC<VideoProfileInfoProps> = ({ video, controlsVisible }) => {
  const isMobile = useIsMobile();
  
  // Only show user info overlay on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 border-2 border-white/30 mr-3">
          {video.creator?.avatar_url ? (
            <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
          ) : (
            <AvatarFallback className="bg-black/50 text-white">
              {(video.creator?.username || '?')[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-white text-shadow-sm">
            {video.creator?.username || 'Anonymous'}
          </span>
          <p className="text-sm text-white/80 line-clamp-2 max-w-[70vw]">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoProfileInfo;
