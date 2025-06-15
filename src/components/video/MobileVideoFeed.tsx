
import React, { useEffect } from 'react';
import { Video } from '@/types/video';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

interface MobileVideoFeedProps {
  videos: (Video & { profiles: any })[];
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
  loadMoreItems: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

const MobileVideoFeed: React.FC<MobileVideoFeedProps> = ({
  videos,
  globalAudioEnabled,
  onAudioStateChange,
  loadMoreItems,
  isFetchingNextPage,
  hasNextPage,
}) => {
  const navigate = useNavigate();
  const itemSize = window.innerHeight * 0.85;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    // Request more data when we are near the end of the list
    useEffect(() => {
        if (index >= videos.length - 3 && hasNextPage && !isFetchingNextPage) {
            loadMoreItems();
        }
    }, [index, videos.length, hasNextPage, isFetchingNextPage, loadMoreItems]);

    if (index >= videos.length) {
      return (
        <div style={style} className="flex items-center justify-center">
          <p className="text-[#666666]">Loading more...</p>
        </div>
      );
    }
    
    const video = videos[index];

    return (
      <div style={style}>
        <div className="h-full p-2">
          <div
            className="relative h-full bg-black rounded-lg overflow-hidden touch-manipulation"
            onClick={() => navigate(`/explore/${video.id}`)}
          >
            <VideoPlayer
              video={video}
              autoPlay
              showControls={false}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={onAudioStateChange}
              isFullscreen={true} // Emulate fullscreen-like appearance in feed
              className="w-full h-full"
              useAspectRatio={false}
              objectFit="cover"
              hideControls
            />
            
            {/* Creator info overlay */}
            <div className="absolute bottom-6 left-4 z-20 flex items-center space-x-3 pointer-events-none">
              <Avatar className="h-10 w-10 border-2 border-white">
                {video.profiles?.avatar_url ? (
                  <AvatarImage src={video.profiles.avatar_url} alt={video.profiles?.full_name || ''} />
                ) : (
                  <AvatarFallback>
                    {video.profiles?.full_name?.[0] || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-white">
                <div className="font-semibold">{video.profiles?.full_name || 'Anonymous'}</div>
                <div className="text-sm opacity-90 line-clamp-2">{video.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const itemCount = hasNextPage ? videos.length + 1 : videos.length;

  return (
    <div className="fixed inset-0 top-16 bg-background">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default MobileVideoFeed;
