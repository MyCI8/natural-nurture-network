
import { useCallback, useState } from 'react';

interface TouchGestureHandlers {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

interface TouchGestureOptions {
  doubleTapDelay?: number;
  longPressDelay?: number;
  swipeThreshold?: number;
}

export function useTouchGestures(handlers: TouchGestureHandlers, options: TouchGestureOptions = {}) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe
  } = handlers;
  
  const {
    doubleTapDelay = 300, // ms
    longPressDelay = 500, // ms
    swipeThreshold = 50 // px
  } = options;
  
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
    if (onSwipe && Math.max(absDx, absDy) > swipeThreshold) {
      if (absDx > absDy) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
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
    doubleTapDelay, 
    swipeThreshold,
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
