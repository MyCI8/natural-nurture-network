
import { useCallback, useState } from 'react';

interface TouchGestureHandlers {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  // Add direction-specific swipe handlers
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchGestureOptions {
  doubleTapDelay?: number;
  longPressDelay?: number;
  swipeThreshold?: number;
  threshold?: number; // Alias for swipeThreshold for backward compatibility
}

export function useTouchGestures(handlers: TouchGestureHandlers, options: TouchGestureOptions = {}) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = handlers;
  
  const {
    doubleTapDelay = 300, // ms
    longPressDelay = 500, // ms
    swipeThreshold = 50, // px
    threshold = swipeThreshold // Legacy support
  } = options;
  
  const actualThreshold = threshold || swipeThreshold;
  
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchStartTime(now);
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    // Set long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
      
      setLongPressTimer(timer);
    }
  }, [onLongPress, longPressDelay]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // If movement is detected, cancel long press
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    const touch = e.changedTouches[0];
    const now = Date.now();
    const touchDuration = now - touchStartTime;
    
    // Calculate swipe distance
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // Handle swipe if threshold is met
    if (Math.max(absDx, absDy) > actualThreshold) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) {
          // Right swipe
          onSwipeRight && onSwipeRight();
          onSwipe && onSwipe('right');
        } else {
          // Left swipe
          onSwipeLeft && onSwipeLeft();
          onSwipe && onSwipe('left');
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          // Down swipe
          onSwipeDown && onSwipeDown();
          onSwipe && onSwipe('down');
        } else {
          // Up swipe
          onSwipeUp && onSwipeUp();
          onSwipe && onSwipe('up');
        }
      }
      return;
    }
    
    // Handle taps (short touches)
    if (touchDuration < 300) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;
      
      if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
        onDoubleTap();
        setLastTap(0); // Reset to prevent triple tap
      } else {
        setLastTap(now);
        
        // Delay the tap event to allow for double tap detection
        if (onTap) {
          setTimeout(() => {
            const timeSinceLastTap = Date.now() - lastTap;
            if (timeSinceLastTap >= doubleTapDelay) {
              onTap();
            }
          }, doubleTapDelay);
        }
      }
    }
  }, [
    touchStartTime, 
    touchStartPos, 
    lastTap, 
    onTap, 
    onDoubleTap, 
    onSwipe, 
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    doubleTapDelay, 
    actualThreshold,
    longPressTimer
  ]);
  
  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  };
}

export default useTouchGestures;
