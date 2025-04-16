
import { useState, useEffect, RefObject } from 'react';
import { isElementFullyVisible, logVideoView } from '../utils/videoPlayerUtils';
import { supabase } from '@/integrations/supabase/client';

export function useVideoVisibility(
  videoRef: RefObject<HTMLVideoElement>,
  containerRef: RefObject<HTMLDivElement>,
  autoPlay: boolean,
  isFullscreen: boolean,
  showControls: boolean,
  videoId: string,
  playbackStarted: boolean,
  setPlaybackStarted: (started: boolean) => void,
  onInView?: (inView: boolean) => void
) {
  const attemptPlay = async () => {
    if (!videoRef.current) return;
    
    try {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaybackStarted(true);
          logVideoView(videoId, supabase);
        }).catch(error => {
          console.error("First play attempt failed:", error);
          
          if (videoRef.current && !videoRef.current.muted) {
            console.log("Trying again with muted audio");
            videoRef.current.muted = true;
            
            videoRef.current.play().then(() => {
              setPlaybackStarted(true);
              logVideoView(videoId, supabase);
            }).catch(secondError => {
              console.error("Second play attempt failed:", secondError);
              
              setTimeout(() => {
                if (videoRef.current && !playbackStarted) {
                  videoRef.current.play().catch(e => 
                    console.error("Final play attempt failed:", e)
                  );
                }
              }, 1000);
            });
          }
        });
      }
    } catch (error) {
      console.error("Error during video play:", error);
    }
  };

  // Effect to handle visibility changes
  useEffect(() => {
    if (!videoRef.current || !autoPlay) return;
    
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;
        onInView?.(isVisible);
        
        if (isVisible && autoPlay) {
          attemptPlay();
        } else if (!isVisible && !isFullscreen && videoRef.current && !showControls) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [autoPlay, isFullscreen, showControls]);
  
  // Effect to attempt autoplay when component mounts
  useEffect(() => {
    if (!autoPlay || !videoRef.current || playbackStarted) return;
    
    if (isFullscreen || showControls || isElementFullyVisible(videoRef.current)) {
      attemptPlay();
    }
    
    const timer = setTimeout(() => {
      if (!playbackStarted && videoRef.current) {
        attemptPlay();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [autoPlay, showControls, isFullscreen]);

  return {
    attemptPlay
  };
}
