
import React, { useState, useCallback, useEffect } from 'react';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video } from '@/types/video';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedLayout } from '@/contexts/OptimizedLayoutContext';
import ExploreVideoFeed from '@/components/video/ExploreVideoFeed';
import '../styles/explore.css';

const Explore = () => {
  const { currentUser } = useAuth();
  const { setFullWidth } = useOptimizedLayout();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Override layout constraints for Instagram-style feed
  useEffect(() => {
    setFullWidth(true); // Bypass max-w constraints
    return () => setFullWidth(false);
  }, [setFullWidth]);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  return (
    <div className="flex w-full justify-center items-start min-h-screen bg-background dark:bg-dm-background">
      <div className="w-full max-w-full sm:max-w-md md:max-w-[614px] lg:max-w-[700px] xl:max-w-[935px] mx-auto px-0 sm:px-4 md:px-0 feed-container">
        <ExploreVideoFeed
          type="explore"
          onVideoClick={handleVideoClick}
        />
      </div>

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
