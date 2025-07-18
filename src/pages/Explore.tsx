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
    <div className="min-h-screen bg-background dark:bg-dm-background pt-16">
      <main className="w-full max-w-[500px] mx-auto border-0 m-0 p-0">
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