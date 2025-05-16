
import React, { useRef, useCallback, useState, useEffect } from 'react';

interface SwipeableProps {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPinch?: (scale: number) => void;
  onSwipeProgress?: (direction: 'up' | 'down' | null, progress: number) => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
  enableZoom?: boolean;
  disableScroll?: boolean;
  provideFeedback?: boolean;
  boundaryFeedback?: boolean;
}

export function Swipeable({ 
  onSwipe, 
  onPinch,
  onSwipeProgress,
  threshold = 50, 
  children, 
  className,
  enableZoom = false,
  disableScroll = false,
  provideFeedback = true,
  boundaryFeedback = true
}: SwipeableProps) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialDistance = useRef<number | null>(null);
  const [scale, setScale] = useState(1);
  const [swipeInProgress, setSwipeInProgress] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine if the device supports haptic feedback
  const supportsHapticFeedback = 'vibrate' in navigator;

  // Provide haptic feedback
  const triggerHapticFeedback = useCallback((pattern: number | number[] = 10) => {
    if (supportsHapticFeedback && provideFeedback) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.error("Haptic feedback failed:", e);
      }
    }
  }, [provideFeedback]);

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
      const elapsedTime = touchEnd.current.time - touchStart.current.time;
      const velocity = Math.sqrt(distX * distX + distY * distY) / Math.max(1, elapsedTime);

      // Determine current swipe direction and progress for animation
      let currentDirection = null;
      let progress = 0;
      
      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold / 2) {
        currentDirection = distX > 0 ? 'right' : 'left';
        progress = Math.abs(distX) / (window.innerWidth / 2); // Scale by half screen width
        
        // Provide boundary resistance feedback when nearing edge
        if (boundaryFeedback && progress > 0.8) {
          // Slow down the movement with an ease-out effect
          const resistedProgress = 0.8 + (progress - 0.8) * 0.2;
          
          if (containerRef.current && resistedProgress > 0.9 && resistedProgress < 0.92) {
            triggerHapticFeedback(5);
          }
        }
      } else if (Math.abs(distY) > threshold / 2) {
        currentDirection = distY > 0 ? 'down' : 'up';
        progress = Math.abs(distY) / (window.innerHeight / 2); // Scale by half screen height
        
        // Call the swipe progress callback for vertical swipes
        if (onSwipeProgress && (currentDirection === 'up' || currentDirection === 'down')) {
          onSwipeProgress(currentDirection, Math.min(1, progress));
        }
        
        // Provide boundary resistance feedback when nearing edge
        if (boundaryFeedback && progress > 0.8) {
          // Slow down the movement with an ease-out effect
          const resistedProgress = 0.8 + (progress - 0.8) * 0.2;
          
          if (containerRef.current && resistedProgress > 0.9 && resistedProgress < 0.92) {
            triggerHapticFeedback(5);
          }
        }
      }
      
      // If velocity is high enough, provide a subtle feedback
      if (velocity > 0.7 && !currentDirection) {
        triggerHapticFeedback(2);
      }
      
      setSwipeDirection(currentDirection as any);
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
      
      // Haptic feedback at scale boundaries
      if ((newScale <= 0.55 || newScale >= 2.95) && boundaryFeedback) {
        triggerHapticFeedback(3);
      }
      
      // Prevent default to stop page zooming
      e.preventDefault();
    }
  }, [enableZoom, scale, onPinch, threshold, onSwipeProgress, triggerHapticFeedback, boundaryFeedback]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    
    setSwipeInProgress(false);
    
    // Reset swipe progress
    if (onSwipeProgress) {
      onSwipeProgress(null, 0);
    }
    
    // Only process swipe if we have onSwipe handler
    if (onSwipe) {
      const distX = touchEnd.current.x - touchStart.current.x;
      const distY = touchEnd.current.y - touchStart.current.y;
      const elapsedTime = touchEnd.current.time - touchStart.current.time;
      const velocity = Math.sqrt(distX * distX + distY * distY) / Math.max(1, elapsedTime);
      
      // Faster swipes need less distance
      const adjustedThreshold = velocity > 0.5 ? threshold * 0.7 : threshold;
      
      // Check if horizontal swipe is larger than vertical swipe
      if (Math.abs(distX) > Math.abs(distY)) {
        if (Math.abs(distX) > adjustedThreshold) {
          // Right swipe
          if (distX > 0) {
            triggerHapticFeedback(10);
            onSwipe('right');
          } 
          // Left swipe
          else {
            triggerHapticFeedback(10);
            onSwipe('left');
          }
        }
      } else {
        if (Math.abs(distY) > adjustedThreshold) {
          // Down swipe
          if (distY > 0) {
            triggerHapticFeedback(10);
            onSwipe('down');
          } 
          // Up swipe
          else {
            triggerHapticFeedback(10);
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
  }, [onSwipe, threshold, disableScroll, onSwipeProgress, triggerHapticFeedback]);

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
      ref={containerRef}
      className={`${className || ''} ${swipeInProgress ? 'touch-manipulation' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        ...(enableZoom ? { touchAction: 'none' } : {}),
        ...(swipeInProgress ? { userSelect: 'none' } : {})
      }}
      aria-label="Swipeable content"
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
