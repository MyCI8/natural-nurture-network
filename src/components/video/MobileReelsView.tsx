
import React, { useState, useEffect, useCallback } from 'react';
import { Video } from '@/types/video';
import { useLayout } from '@/contexts/LayoutContext';
import SmoothReelsContainer from './SmoothReelsContainer';

interface MobileReelsViewProps {
  currentId: string;
  videos: Video[];
  currentIndex: number;
  onClose: () => void;
  globalAudioEnabled: boolean;
  onAudioStateChange: (isMuted: boolean) => void;
}

const MobileReelsView: React.FC<MobileReelsViewProps> = ({
  currentId,
  videos,
  currentIndex,
  onClose,
  globalAudioEnabled,
  onAudioStateChange
}) => {
  const { setIsInReelsMode } = useLayout();
  const [activeVideoIndex, setActiveVideoIndex] = useState(currentIndex);

  // Set reels mode
  useEffect(() => {
    setIsInReelsMode(true);
    return () => setIsInReelsMode(false);
  }, [setIsInReelsMode]);

  // Reset to the correct index when videos or currentId changes
  useEffect(() => {
    if (videos.length > 0) {
      const index = videos.findIndex(v => v.id === currentId);
      if (index >= 0) setActiveVideoIndex(index);
    }
  }, [currentId, videos]);

  const handleSwipeToNext = useCallback(() => {
    if (activeVideoIndex < videos.length - 1) {
      const newIndex = activeVideoIndex + 1;
      const nextVideo = videos[newIndex];
      if (nextVideo) {
        setActiveVideoIndex(newIndex);
        window.history.replaceState({}, '', `/explore/${nextVideo.id}`);
      }
    }
  }, [activeVideoIndex, videos]);

  const handleSwipeToPrev = useCallback(() => {
    if (activeVideoIndex > 0) {
      const newIndex = activeVideoIndex - 1;
      const prevVideo = videos[newIndex];
      if (prevVideo) {
        setActiveVideoIndex(newIndex);
        window.history.replaceState({}, '', `/explore/${prevVideo.id}`);
      }
    }
  }, [activeVideoIndex, videos]);

  return (
    <SmoothReelsContainer
      currentId={currentId}
      videos={videos}
      currentIndex={activeVideoIndex}
      onClose={onClose}
      globalAudioEnabled={globalAudioEnabled}
      onAudioStateChange={onAudioStateChange}
      onSwipeToNext={handleSwipeToNext}
      onSwipeToPrev={handleSwipeToPrev}
    />
  );
};

export default MobileReelsView;
