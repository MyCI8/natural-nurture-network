
import { useState, useCallback } from 'react';

// Define the types for touch gesture handlers
export interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseTouchGesturesOptions {
  threshold?: number; // Minimum distance for swipe detection
}

interface UseTouchGesturesCallbacks {
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeStart?: (e: React.TouchEvent) => void;
  onSwipeEnd?: (e: React.TouchEvent, wasSwiped: boolean) => void;
}

export const useTouchGestures = (
  callbacks: UseTouchGesturesCallbacks,
  options: UseTouchGesturesOptions = {}
): { handlers: TouchGestureHandlers } => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Use the provided threshold or default to 50px
  const threshold = options.threshold ?? 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
    callbacks.onSwipeStart?.(e);
  }, [callbacks]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, [isSwiping]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    let swipeDetected = false;
    
    // Determine if the swipe distance exceeds the threshold
    if (Math.abs(distanceX) > threshold || Math.abs(distanceY) > threshold) {
      if (isHorizontalSwipe) {
        // Horizontal swipe
        if (distanceX > 0) {
          // Swipe left
          callbacks.onSwipe?.('left');
        } else {
          // Swipe right
          callbacks.onSwipe?.('right');
        }
      } else {
        // Vertical swipe
        if (distanceY > 0) {
          // Swipe up
          callbacks.onSwipe?.('up');
        } else {
          // Swipe down
          callbacks.onSwipe?.('down');
        }
      }
      swipeDetected = true;
    }
    
    setIsSwiping(false);
    callbacks.onSwipeEnd?.(e, swipeDetected);
  }, [callbacks, isSwiping, touchStart, touchEnd, threshold]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
};

export default useTouchGestures;
