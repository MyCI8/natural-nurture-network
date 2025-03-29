
import React, { useRef, useCallback, useState } from 'react';

interface SwipeableProps {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
  enableZoom?: boolean;
}

export function Swipeable({ 
  onSwipe, 
  onPinch,
  threshold = 50, 
  children, 
  className,
  enableZoom = false
}: SwipeableProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const initialDistance = useRef<number | null>(null);
  const [scale, setScale] = useState(1);

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
        y: e.targetTouches[0].clientY 
      };
      touchEnd.current = { 
        x: e.targetTouches[0].clientX, 
        y: e.targetTouches[0].clientY 
      };
    } 
    // Multi-touch for pinch
    else if (e.touches.length === 2 && enableZoom) {
      initialDistance.current = getDistance(e.touches);
    }
  }, [enableZoom]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Single touch for swipe
    if (e.touches.length === 1) {
      touchEnd.current = { 
        x: e.targetTouches[0].clientX, 
        y: e.targetTouches[0].clientY 
      };
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
  }, [enableZoom, scale, onPinch]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    
    // Only process swipe if we have onSwipe handler
    if (onSwipe) {
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
    }
    
    // Reset touch points
    touchStart.current = null;
    touchEnd.current = null;
    initialDistance.current = null;
  }, [onSwipe, threshold]);

  return (
    <div 
      className={className} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={enableZoom ? { touchAction: 'none' } : undefined}
    >
      {children}
    </div>
  );
}
