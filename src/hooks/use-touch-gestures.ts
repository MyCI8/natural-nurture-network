
import { useRef, useCallback, useState, useEffect } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  preventScroll?: boolean;
  longPressDelay?: number;
  onLongPress?: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

// Define a touch point interface to handle both React.Touch and Touch
interface TouchPoint {
  clientX: number;
  clientY: number;
  identifier: number;
}

/**
 * Hook for handling touch gesture interactions on mobile devices
 */
export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onTap,
  onDoubleTap,
  onLongPress,
  threshold = 50,
  preventScroll = false,
  longPressDelay = 500
}: TouchGestureOptions) {
  const touchStartRef = useRef<TouchPosition | null>(null);
  const prevTouchEndTimeRef = useRef<number>(0);
  const touchesRef = useRef<TouchPoint[]>([]);
  const longPressTimerRef = useRef<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = e instanceof TouchEvent ? e.touches[0] : e.touches[0];
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now() 
    };
    setIsSwiping(true);
    
    // Store all touches for pinch detection - convert to our TouchPoint interface
    if (e.touches.length > 1) {
      const touchesArray = Array.from(e.touches).map(t => ({
        clientX: t.clientX,
        clientY: t.clientY,
        identifier: t.identifier
      }));
      touchesRef.current = touchesArray;
    }
    
    // Set a timer for long press
    if (onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
    
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
  }, [onLongPress, longPressDelay, preventScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current) {return;}
    
    // If the user is moving their finger, cancel the long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Handle pinch events
    if (e.touches.length > 1 && (onPinchIn || onPinchOut)) {
      const currentTouches = Array.from(e.touches).map(t => ({
        clientX: t.clientX,
        clientY: t.clientY,
        identifier: t.identifier
      }));
      
      if (touchesRef.current.length > 1) {
        // Calculate distance between fingers for current and previous touches
        const prevDistance = getDistance(touchesRef.current[0], touchesRef.current[1]);
        const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
        
        // Determine if pinching in or out
        if (Math.abs(currentDistance - prevDistance) > threshold) {
          if (currentDistance < prevDistance && onPinchIn) {
            onPinchIn();
          } else if (currentDistance > prevDistance && onPinchOut) {
            onPinchOut();
          }
          
          // Update stored touches
          touchesRef.current = currentTouches;
        }
      }
    }
    
    // If preventing scroll, prevent default to stop page movement
    if (preventScroll && e.cancelable) {
      e.preventDefault();
    }
  }, [threshold, onPinchIn, onPinchOut, preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current) {return;}
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    setIsSwiping(false);
    
    const touch = e instanceof TouchEvent ? 
      (e.changedTouches[0] || e.touches[0]) : 
      (e.changedTouches[0] || e.touches[0]);
    
    if (!touch) {return;}
    
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsedTime = Date.now() - touchStartRef.current.time;
    const timeSinceLastTouch = Date.now() - prevTouchEndTimeRef.current;
    
    // Check for double tap
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && elapsedTime < 300) {
      if (onDoubleTap && timeSinceLastTouch < 300) {
        onDoubleTap();
        prevTouchEndTimeRef.current = 0; // Reset to prevent triple tap triggering another double tap
      } else if (onTap) {
        onTap();
      }
      
      prevTouchEndTimeRef.current = Date.now();
    }
    
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
    touchesRef.current = [];
    
    if (preventScroll) {
      document.body.style.overflow = '';
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, threshold, preventScroll]);

  // Function to calculate distance between two touch points
  const getDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
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
