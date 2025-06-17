
import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Video } from '@/types/video';

interface VideoPreloaderProps {
  videos: Video[];
  currentIndex: number;
  onVideoReady?: (index: number) => void;
  preloadRadius?: number;
}

interface VideoElement extends HTMLVideoElement {
  _preloadIndex?: number;
}

interface VideoPreloaderRef {
  getPreloadedVideo: (index: number) => VideoElement | null;
  preloadVideo: (index: number) => void;
  cleanupVideo: (index: number) => void;
}

const VideoPreloader = forwardRef<VideoPreloaderRef, VideoPreloaderProps>(({
  videos,
  currentIndex,
  onVideoReady,
  preloadRadius = 2
}, ref) => {
  const videoPoolRef = useRef<Map<number, VideoElement>>(new Map());
  const loadingRef = useRef<Set<number>>(new Set());

  const createVideoElement = useCallback((video: Video, index: number): VideoElement => {
    const videoEl = document.createElement('video') as VideoElement;
    videoEl._preloadIndex = index;
    videoEl.src = video.video_url || '';
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'metadata';
    videoEl.style.display = 'none';
    
    // Add to DOM for preloading
    document.body.appendChild(videoEl);

    const handleCanPlay = () => {
      loadingRef.current.delete(index);
      if (onVideoReady) {
        onVideoReady(index);
      }
      videoEl.removeEventListener('canplay', handleCanPlay);
    };

    const handleError = () => {
      loadingRef.current.delete(index);
      console.warn(`Failed to preload video at index ${index}:`, video.video_url);
      videoEl.removeEventListener('error', handleError);
    };

    videoEl.addEventListener('canplay', handleCanPlay);
    videoEl.addEventListener('error', handleError);
    
    return videoEl;
  }, [onVideoReady]);

  const preloadVideo = useCallback((index: number) => {
    if (
      index < 0 || 
      index >= videos.length || 
      videoPoolRef.current.has(index) || 
      loadingRef.current.has(index)
    ) {
      return;
    }

    const video = videos[index];
    if (!video?.video_url) return;

    loadingRef.current.add(index);
    const videoEl = createVideoElement(video, index);
    videoPoolRef.current.set(index, videoEl);
  }, [videos, createVideoElement]);

  const cleanupVideo = useCallback((index: number) => {
    const videoEl = videoPoolRef.current.get(index);
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';
      if (videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }
      videoPoolRef.current.delete(index);
    }
    loadingRef.current.delete(index);
  }, []);

  const getPreloadedVideo = useCallback((index: number): VideoElement | null => {
    return videoPoolRef.current.get(index) || null;
  }, []);

  // Effect to manage preloading based on current index
  useEffect(() => {
    const indicesToKeep = new Set<number>();
    
    // Preload videos around current index
    for (let i = currentIndex - preloadRadius; i <= currentIndex + preloadRadius; i++) {
      if (i >= 0 && i < videos.length) {
        indicesToKeep.add(i);
        preloadVideo(i);
      }
    }

    // Cleanup videos outside preload radius
    const currentIndices = Array.from(videoPoolRef.current.keys());
    currentIndices.forEach(index => {
      if (!indicesToKeep.has(index)) {
        cleanupVideo(index);
      }
    });
  }, [currentIndex, videos.length, preloadRadius, preloadVideo, cleanupVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Array.from(videoPoolRef.current.keys()).forEach(cleanupVideo);
    };
  }, [cleanupVideo]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getPreloadedVideo,
    preloadVideo,
    cleanupVideo
  }), [getPreloadedVideo, preloadVideo, cleanupVideo]);

  return null; // This component doesn't render anything
});

VideoPreloader.displayName = 'VideoPreloader';

export default VideoPreloader;
export type { VideoElement, VideoPreloaderRef };
