
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useMobileVideoControls() {
  const isMobile = useIsMobile();
  const [showComments, setShowComments] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  // Hide controls after 3 seconds of inactivity (mobile only)
  useEffect(() => {
    if (controlsVisible && isMobile) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [controlsVisible, isMobile]);

  // Handle scroll and hide controls when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowComments(scrollPosition > 100);
      
      if (scrollPosition > 10 && isMobile) {
        setControlsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down', onNextVideo: () => void, onPrevVideo: () => void) => {
    // Mobile-only swipe handling
    if (!isMobile) return;
    
    if (direction === 'up') {
      onNextVideo();
    } else if (direction === 'down') {
      onPrevVideo();
    }
  };

  const handleScreenTap = () => {
    // Only toggle controls visibility on mobile
    if (isMobile) {
      setControlsVisible(!controlsVisible);
    }
  };

  return {
    isMobile,
    showComments,
    setShowComments,
    controlsVisible,
    setControlsVisible,
    isHovering,
    setIsHovering,
    handleSwipe,
    handleScreenTap
  };
}
