
import React, { useRef, useCallback } from 'react';

interface SwipeableProps {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
}

export function Swipeable({ 
  onSwipe, 
  threshold = 50, 
  children, 
  className 
}: SwipeableProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    };
    touchEnd.current = { 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    };
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = { 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    };
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current || !onSwipe) return;
    
    const distX = touchEnd.current.x - touchStart.current.x;
    const distY = touchEnd.current.y - touchStart.current.y;
    
    // Check if horizontal swipe is larger than vertical swipe
    if (Math.abs(distX) > Math.abs(distY)) {
      if (Math.abs(distX) > threshold) {
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
      if (Math.abs(distY) > threshold) {
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
    
    // Reset touch points
    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipe, threshold]);

  return (
    <div 
      className={className} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
