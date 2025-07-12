
import { useState, useCallback, useMemo } from 'react';
import { Video } from '@/types/video';

interface VideoFeedState {
  activeVideoId: string | null;
  globalAudioEnabled: boolean;
  visibleVideoIds: Set<string>;
}

export function useVideoFeed(initialVideos: Video[]) {
  const [state, setState] = useState<VideoFeedState>({
    activeVideoId: null,
    globalAudioEnabled: false,
    visibleVideoIds: new Set(),
  });

  // Memoized video map for O(1) lookups
  const videoMap = useMemo(() => {
    const map = new Map<string, number>();
    initialVideos.forEach((video, index) => {
      map.set(video.id, index);
    });
    return map;
  }, [initialVideos]);

  const handleVideoClick = useCallback((videoId: string) => {
    setState(prev => ({
      ...prev,
      activeVideoId: prev.activeVideoId === videoId ? null : videoId,
    }));
  }, []);

  const handleSwipe = useCallback((direction: 'up' | 'down', currentVideoId: string) => {
    const currentIndex = videoMap.get(currentVideoId);
    if (currentIndex === undefined) return;

    let newIndex: number;
    if (direction === 'up' && currentIndex < initialVideos.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    const newVideoId = initialVideos[newIndex]?.id;
    if (newVideoId) {
      setState(prev => ({
        ...prev,
        activeVideoId: newVideoId,
      }));
    }
  }, [videoMap, initialVideos]);

  const setGlobalAudioEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      globalAudioEnabled: enabled,
    }));
  }, []);

  const updateVisibleVideos = useCallback((videoIds: string[]) => {
    setState(prev => ({
      ...prev,
      visibleVideoIds: new Set(videoIds),
    }));
  }, []);

  return {
    activeVideoId: state.activeVideoId,
    globalAudioEnabled: state.globalAudioEnabled,
    visibleVideoIds: state.visibleVideoIds,
    setGlobalAudioEnabled,
    handleVideoClick,
    handleSwipe,
    updateVisibleVideos,
  };
}
