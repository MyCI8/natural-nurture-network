
import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileVideoFeed from '@/components/video/MobileVideoFeed';
import VideoDialog from '@/components/video/VideoDialog';
import { Video } from '@/types/video';
import { useAuth } from '@/hooks/useAuth';
import OptimizedVideoFeed from '@/features/video/components/OptimizedVideoFeed';

const VideoFeed = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  if (isMobile) {
    return (
      <MobileVideoFeed
        videos={[]} // MobileVideoFeed will need to be updated to use OptimizedVideoFeed
        globalAudioEnabled={false}
        onAudioStateChange={() => {}}
        loadMoreItems={() => Promise.resolve()}
        isFetchingNextPage={false}
        hasNextPage={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 h-screen overflow-hidden">
      <main className="mx-auto h-full max-w-[600px]">
        <OptimizedVideoFeed
          type="general"
          onVideoClick={handleVideoClick}
          itemHeight={600}
          gap={16}
          showControls={false}
          autoPlay={true}
          className="h-full"
        />
      </main>

      <VideoDialog
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default VideoFeed;
