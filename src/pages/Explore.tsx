
import React, { useState, useCallback, useEffect } from 'react';
import VideoDialog from '@/components/video/VideoDialog';
import type { Video } from '@/types/video';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedLayout } from '@/contexts/OptimizedLayoutContext';
import { useBreakpoint } from '@/hooks/use-mobile';
import ExploreVideoFeed from '@/components/video/ExploreVideoFeed';
import '../styles/explore.css';

const Explore = () => {
  const { currentUser } = useAuth();
  const { setFullWidth } = useOptimizedLayout();
  const breakpoint = useBreakpoint();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Override layout constraints for Instagram-style feed
  useEffect(() => {
    console.log('🎯 Explore page layout override:', { breakpoint });
    setFullWidth(true);
    
    return () => {
      setFullWidth(false); // Reset on unmount
    };
  }, [setFullWidth, breakpoint]);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);

  // Get responsive container classes based on breakpoint
  const getContainerClasses = () => {
    const baseClasses = "min-h-screen bg-background dark:bg-dm-background";
    const mobilePadding = breakpoint === 'mobile' ? 'pt-16' : 'pt-0';
    
    console.log('📱 Container classes for breakpoint:', { breakpoint, classes: `${baseClasses} ${mobilePadding}` });
    
    return `${baseClasses} ${mobilePadding}`;
  };

  const getMainClasses = () => {
    // Instagram-inspired responsive container widths
    const widthClasses = {
      mobile: 'w-full px-0',                    // Full width, no padding
      tablet: 'w-full max-w-[600px] mx-auto px-4',  // Centered, Instagram-like width
      desktop: 'w-full max-w-[700px] mx-auto px-6'   // Slightly wider for desktop
    };
    
    const classes = `${widthClasses[breakpoint]} py-2 border-0 m-0`;
    console.log('🎨 Main container classes:', { breakpoint, classes });
    
    return classes;
  };

  return (
    <div className={getContainerClasses()}>
      <main className={getMainClasses()}>
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
