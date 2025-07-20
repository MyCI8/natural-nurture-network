
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
    <div className="min-h-screen bg-background dark:bg-dm-background">
      {/* Fixed height container for AutoSizer */}
      <main className="w-full h-screen pt-16">
        <div className="h-full w-full">
          <OptimizedVideoFeed
            type="explore"
            onVideoClick={handleVideoClick}
            className="h-full w-full"
          />
        </div>
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
