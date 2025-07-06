
import { useState, useCallback } from 'react';
import { Video } from '@/types/video';

export function useVideoFeed(initialVideos: Video[]) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);

  const handleVideoClick = useCallback((videoId: string) => {
    setActiveVideoId(prevId => prevId === videoId ? null : videoId);
  }, []);

  const handleSwipe = useCallback((direction: 'up' | 'down', currentVideoId: string) => {
    const currentIndex = initialVideos.findIndex(v => v.id === currentVideoId);
    if (currentIndex === -1) {return;}

    if (direction === 'up' && currentIndex < initialVideos.length - 1) {
      setActiveVideoId(initialVideos[currentIndex + 1].id);
    } else if (direction === 'down' && currentIndex > 0) {
      setActiveVideoId(initialVideos[currentIndex - 1].id);
    }
  }, [initialVideos]);

  return {
    activeVideoId,
    globalAudioEnabled,
    setGlobalAudioEnabled,
    handleVideoClick,
    handleSwipe,
  };
}
