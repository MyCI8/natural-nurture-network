
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SwipeableProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
  enableZoom?: boolean;
  onPinch?: (scale: number) => void;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipe,
  threshold = 50,
  className = '',
  disabled = false,
  enableZoom = false,
  onPinch
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [currentScale, setCurrentScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const gestureInProgress = useRef(false);

  // Minimum distance required for swipe
  const minSwipeDistance = threshold;

  // Calculate distance between two touch points
  const getDistance = (touch1: Touch, touch2: Touch) => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    // Check for multitouch (pinch)
    if (e.touches.length === 2 && enableZoom) {
      // Start pinch gesture
      gestureInProgress.current = true;
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
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
    if (disabled) return;
    
    // Handle pinch zoom
    if (e.touches.length === 2 && enableZoom && initialPinchDistance && onPinch) {
      gestureInProgress.current = true;
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = Math.max(0.5, Math.min(3, currentDistance / initialPinchDistance * currentScale));
      
      setIsZoomed(scale > 1.05);
      onPinch(scale);
      return;
    }
    
    // Handle regular swipe or set gesture in progress
    if (e.touches.length > 1) {
      gestureInProgress.current = true;
      return;
    }
    
    // Update end position for swipe
    if (!gestureInProgress.current) {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    }
  };

  const checkForDoubleTap = useCallback((e: React.TouchEvent) => {
    if (!enableZoom) return;
    
    const now = new Date().getTime();
    const timeSince = now - lastTapTime.current;
    
    if (timeSince < 300 && e.touches.length === 1) {
      // Toggle zoom state on double tap
      setIsZoomed(!isZoomed);
      if (onPinch) {
        onPinch(isZoomed ? 1 : 2);
      }
      e.preventDefault();
    }
    
    lastTapTime.current = now;
  }, [isZoomed, enableZoom, onPinch]);

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
    
    // Update current scale for next pinch gesture
    if (initialPinchDistance) {
      setCurrentScale(isZoomed ? 2 : 1);
      setInitialPinchDistance(null);
    }
    
    gestureInProgress.current = false;
  }, [touchStart, touchEnd, onSwipe, minSwipeDistance, isZoomed, disabled, initialPinchDistance]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      setTouchStart(null);
      setTouchEnd(null);
      setInitialPinchDistance(null);
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
