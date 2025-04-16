
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SwipeableProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipe,
  threshold = 50,
  className = '',
  disabled = false
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const gestureInProgress = useRef(false);

  // Minimum distance required for swipe
  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    // Check for multitouch (pinch)
    if (e.touches.length > 1) {
      gestureInProgress.current = true;
      return;
    }
    
    // Reset gesture flag for single touch
    gestureInProgress.current = false;
    
    // Store touch start position
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setTouchEnd(null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (disabled || gestureInProgress.current) return;
    
    // Check for multitouch during movement
    if (e.touches.length > 1) {
      gestureInProgress.current = true;
      return;
    }
    
    // Update end position
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const checkForDoubleTap = useCallback((e: React.TouchEvent) => {
    const now = new Date().getTime();
    const timeSince = now - lastTapTime.current;
    
    if (timeSince < 300 && e.touches.length === 1) {
      // Toggle zoom state on double tap
      setIsZoomed(!isZoomed);
      e.preventDefault();
    }
    
    lastTapTime.current = now;
  }, [isZoomed]);

  const onTouchEnd = useCallback(() => {
    if (disabled || gestureInProgress.current || !touchStart || !touchEnd || !onSwipe) return;
    
    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);
    
    // If zoomed in, don't trigger swipe
    if (isZoomed) return;
    
    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      // Horizontal swipe
      if (distanceX > 0) {
        onSwipe('right');
      } else {
        onSwipe('left');
      }
    } else if (!isHorizontal && Math.abs(distanceY) > minSwipeDistance) {
      // Vertical swipe
      if (distanceY > 0) {
        onSwipe('down');
      } else {
        onSwipe('up');
      }
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, onSwipe, minSwipeDistance, isZoomed, disabled]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      setTouchStart(null);
      setTouchEnd(null);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`touch-manipulation ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};
