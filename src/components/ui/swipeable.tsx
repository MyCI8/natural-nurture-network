
import React, { useRef, useCallback, useState, useEffect } from 'react';

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
  const [isInteracting, setIsInteracting] = useState(false);

  // Reset interaction state after a delay to avoid unintended swipes
  useEffect(() => {
    if (isInteracting) {
      const timer = setTimeout(() => {
        setIsInteracting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInteracting]);

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
      setIsInteracting(true);
    } 
    // Multi-touch for pinch
    else if (e.touches.length === 2 && enableZoom) {
      initialDistance.current = getDistance(e.touches);
      setIsInteracting(true);
    }
  }, [enableZoom]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Only process if we're in an interactive state to avoid accidental swipes
    if (!isInteracting) return;
    
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
  }, [enableZoom, scale, onPinch, isInteracting]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current || !isInteracting) {
      setIsInteracting(false);
      return;
    }
    
    // Only process swipe if we have onSwipe handler
    if (onSwipe) {
      const distX = touchEnd.current.x - touchStart.current.x;
      const distY = touchEnd.current.y - touchStart.current.y;
      
      // Add a minimum movement check to avoid accidental swipes
      const minMovement = threshold * 0.6;  // 60% of threshold
      if (Math.abs(distX) < minMovement && Math.abs(distY) < minMovement) {
        setIsInteracting(false);
        return;
      }
      
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
    setIsInteracting(false);
  }, [onSwipe, threshold, isInteracting]);

  return (
    <div 
      className={className} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: enableZoom ? 'none' : 'pan-y',
        WebkitOverflowScrolling: 'touch',
        ...enableZoom ? { transform: `scale(${scale})` } : {}
      }}
    >
      {children}
    </div>
  );
}
