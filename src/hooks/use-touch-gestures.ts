
import { useRef, useCallback, useState, useEffect } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

/**
 * Hook for handling touch gesture interactions
 */
export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventScroll = false
}: TouchGestureOptions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = e instanceof TouchEvent ? e.touches[0] : e.touches[0];
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now() 
    };
    setIsSwiping(true);
    
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
  }, [preventScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current) return;
    
    // If preventing scroll, prevent default to stop page movement
    if (preventScroll && e.cancelable) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current) return;
    
    setIsSwiping(false);
    
    const touch = e instanceof TouchEvent ? 
      (e.changedTouches[0] || e.touches[0]) : 
      (e.changedTouches[0] || e.touches[0]);
    
    if (!touch) return;
    
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsedTime = Date.now() - touchStartRef.current.time;
    
    // Adjust threshold based on swipe speed
    const adjustedThreshold = elapsedTime < 300 ? threshold * 0.7 : threshold;
    
    // Determine if this is primarily a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > adjustedThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > adjustedThreshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
    
    touchStartRef.current = null;
    
    if (preventScroll) {
      document.body.style.overflow = '';
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventScroll]);

  useEffect(() => {
    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [preventScroll]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isSwiping
  };
}
