import React, { useState, useCallback } from 'react';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video } from '@/types/video';
import { useAuth } from '@/hooks/useAuth';
import OptimizedVideoFeed from '@/features/video/components/OptimizedVideoFeed';
import '../styles/explore.css';

const Explore = () => {
  const { currentUser } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="mx-auto max-w-[600px] h-[calc(100vh-4rem)]">
        <OptimizedVideoFeed
          type="explore"
          onVideoClick={handleVideoClick}
          itemHeight={700}
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

export default Explore;