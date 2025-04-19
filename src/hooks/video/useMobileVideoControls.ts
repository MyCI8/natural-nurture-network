import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useMobileVideoControls() {
  const isMobile = useIsMobile();
  const [showComments, setShowComments] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle scroll and hide comments when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowComments(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Do nothing - controls are always visible
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
