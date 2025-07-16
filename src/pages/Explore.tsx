import React, { useState, useCallback } from 'react';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video } from '@/types/video';
import { useAuth } from '@/hooks/useAuth';
import ExploreVideoFeed from '@/components/video/ExploreVideoFeed';
import '../styles/explore.css';

const Explore = () => {
  const { currentUser } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dm-background pt-16">
      <main className="mx-auto max-w-[500px] px-4">
        <ExploreVideoFeed
          type="explore"
          onVideoClick={handleVideoClick}
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