
import React, { useRef, useCallback, useState, useEffect } from 'react';

interface SwipeableProps {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
  enableZoom?: boolean;
  disableScroll?: boolean;
}

export function Swipeable({ 
  onSwipe, 
  onPinch,
  threshold = 50, 
  children, 
  className,
  enableZoom = false,
  disableScroll = false
}: SwipeableProps) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialDistance = useRef<number | null>(null);
  const [scale, setScale] = useState(1);
  const [swipeInProgress, setSwipeInProgress] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  // Calculate distance between two touch points
  const getDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Single touch for swipe
    if (e.touches.length === 1) {
      touchStart.current = { 
        x: e.targetTouches[0].clientX, 
        y: e.targetTouches[0].clientY,
        time: Date.now()
      };
      touchEnd.current = { 
        x: e.targetTouches[0].clientX, 
        y: e.targetTouches[0].clientY,
        time: Date.now()
      };
      setSwipeInProgress(true);
      setSwipeDirection(null);
    } 
    // Multi-touch for pinch
    else if (e.touches.length === 2 && enableZoom) {
      initialDistance.current = getDistance(e.touches);
    }

    // Disable scroll if needed
    if (disableScroll) {
      document.body.style.overflow = 'hidden';
    }
  }, [enableZoom, disableScroll]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Single touch for swipe
    if (e.touches.length === 1 && touchStart.current) {
      touchEnd.current = { 
        x: e.targetTouches[0].clientX, 
        y: e.targetTouches[0].clientY,
        time: Date.now()
      };

      // Calculate current direction to provide visual feedback
      const distX = touchEnd.current.x - touchStart.current.x;
      const distY = touchEnd.current.y - touchStart.current.y;

      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold / 2) {
        setSwipeDirection(distX > 0 ? 'right' : 'left');
      } else if (Math.abs(distY) > threshold / 2) {
        setSwipeDirection(distY > 0 ? 'down' : 'up');
      } else {
        setSwipeDirection(null);
      }
    } 
    // Multi-touch for pinch
    else if (e.touches.length === 2 && enableZoom && initialDistance.current) {
      const currentDistance = getDistance(e.touches);
      const newScale = (currentDistance / initialDistance.current) * scale;
      
      // Limit scale to reasonable bounds
      if (newScale >= 0.5 && newScale <= 3) {
        setScale(newScale);
        if (onPinch) onPinch(newScale);
      }
      
      // Prevent default to stop page zooming
      e.preventDefault();
    }
  }, [enableZoom, scale, onPinch, threshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    
    setSwipeInProgress(false);
    
    // Only process swipe if we have onSwipe handler
    if (onSwipe) {
      const distX = touchEnd.current.x - touchStart.current.x;
      const distY = touchEnd.current.y - touchStart.current.y;
      const elapsedTime = touchEnd.current.time - touchStart.current.time;
      
      // Faster swipes need less distance
      const adjustedThreshold = elapsedTime < 300 ? threshold * 0.7 : threshold;
      
      // Check if horizontal swipe is larger than vertical swipe
      if (Math.abs(distX) > Math.abs(distY)) {
        if (Math.abs(distX) > adjustedThreshold) {
          // Right swipe
          if (distX > 0) {
            onSwipe('right');
          } 
          // Left swipe
          else {
            onSwipe('left');
          }
        }
      } else {
        if (Math.abs(distY) > adjustedThreshold) {
          // Down swipe
          if (distY > 0) {
            onSwipe('down');
          } 
          // Up swipe
          else {
            onSwipe('up');
          }
        }
      }
    }
    
    // Reset touch points
    touchStart.current = null;
    touchEnd.current = null;
    initialDistance.current = null;
    setSwipeDirection(null);

    // Re-enable scrolling
    if (disableScroll) {
      document.body.style.overflow = '';
    }
  }, [onSwipe, threshold, disableScroll]);

  // Clean up scroll lock on unmount
  useEffect(() => {
    return () => {
      if (disableScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [disableScroll]);

  return (
    <div 
      className={`${className || ''} ${swipeInProgress ? 'touch-manipulation' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={enableZoom ? { touchAction: 'none' } : undefined}
    >
      {swipeDirection && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {swipeDirection === 'up' && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              Next video
            </div>
          )}
          {swipeDirection === 'down' && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              Previous video
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
