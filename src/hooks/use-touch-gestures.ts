
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
  // Add the missing callback types
  onTap?: (e?: React.TouchEvent) => void;
  onDoubleTap?: (e?: React.TouchEvent) => void;
  onLongPress?: (e?: React.TouchEvent) => void;
}

export const useTouchGestures = (
  callbacks: UseTouchGesturesCallbacks,
  options: UseTouchGesturesOptions = {}
): { handlers: TouchGestureHandlers } => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use the provided threshold or default to 50px
  const threshold = options.threshold ?? 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
    setTouchStartTime(Date.now());
    callbacks.onSwipeStart?.(e);
    
    // Set a timer for long press detection
    if (callbacks.onLongPress) {
      const timer = setTimeout(() => {
        callbacks.onLongPress?.(e);
      }, 500); // 500ms is standard long press threshold
      setLongPressTimer(timer);
    }
  }, [callbacks]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    
    // Clear long press timer if finger moves significantly
    if (longPressTimer && Math.abs(touch.clientX - touchStart.x) > 10 || Math.abs(touch.clientY - touchStart.y) > 10) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [isSwiping, touchStart, longPressTimer]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    // Clear any pending long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
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
    } else {
      // This was a tap - check for double tap or simple tap
      const touchDuration = Date.now() - touchStartTime;
      const tapTimeDiff = Date.now() - lastTapTime;
      
      if (touchDuration < 300) { // Short touch is a tap
        if (tapTimeDiff < 300) { // Two taps within 300ms is a double tap
          callbacks.onDoubleTap?.(e);
        } else {
          // This is a single tap
          callbacks.onTap?.(e);
        }
        setLastTapTime(Date.now());
      }
    }
    
    setIsSwiping(false);
    callbacks.onSwipeEnd?.(e, swipeDetected);
  }, [callbacks, isSwiping, touchStart, touchEnd, touchStartTime, lastTapTime, threshold, longPressTimer]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
};

export default useTouchGestures;
