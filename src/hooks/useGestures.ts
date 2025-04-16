
import { useState, useRef, useEffect } from 'react';

interface GestureState {
  scale: number;
  translateX: number;
  translateY: number;
  initialDistance: number;
  initialScale: number;
  initialX: number;
  initialY: number;
  lastTapTime: number;
}

export function useGestures(elementRef: React.RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const gestureState = useRef<GestureState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    initialDistance: 0,
    initialScale: 1,
    initialX: 0,
    initialY: 0,
    lastTapTime: 0
  });

  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsZoomed(false);
    gestureState.current = {
      ...gestureState.current,
      scale: 1,
      translateX: 0,
      translateY: 0
    };
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Handle pinch-to-zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two finger touch - prepare for pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        gestureState.current.initialDistance = distance;
        gestureState.current.initialScale = gestureState.current.scale;
      } else if (e.touches.length === 1) {
        // Single finger touch - prepare for pan if zoomed
        const touch = e.touches[0];
        gestureState.current.initialX = touch.clientX - gestureState.current.translateX;
        gestureState.current.initialY = touch.clientY - gestureState.current.translateY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default only when zoomed to avoid interfering with swipe
      if (gestureState.current.scale > 1.05) {
        e.preventDefault();
      }
      
      if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        // Calculate new scale
        const newScale = Math.max(1, Math.min(3, gestureState.current.initialScale * (distance / gestureState.current.initialDistance)));
        
        gestureState.current.scale = newScale;
        setScale(newScale);
        setIsZoomed(newScale > 1.05);
      } 
      else if (e.touches.length === 1 && gestureState.current.scale > 1.05) {
        // Pan when zoomed
        const touch = e.touches[0];
        const newTranslateX = touch.clientX - gestureState.current.initialX;
        const newTranslateY = touch.clientY - gestureState.current.initialY;
        
        // Apply boundaries to prevent panning too far
        const maxTranslateX = (gestureState.current.scale - 1) * (element.clientWidth / 2);
        const maxTranslateY = (gestureState.current.scale - 1) * (element.clientHeight / 2);
        
        const boundedTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        const boundedTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        gestureState.current.translateX = boundedTranslateX;
        gestureState.current.translateY = boundedTranslateY;
        
        setTranslateX(boundedTranslateX);
        setTranslateY(boundedTranslateY);
      }
    };

    const handleDoubleTap = (e: TouchEvent) => {
      // Implement double-tap to zoom
      const now = new Date().getTime();
      const timeSince = now - gestureState.current.lastTapTime;
      
      if (timeSince < 300 && e.touches.length === 1) {
        e.preventDefault();
        
        if (gestureState.current.scale > 1.05) {
          // If already zoomed, reset
          resetZoom();
        } else {
          // Zoom to 2x at the tap position
          const touch = e.touches[0];
          const rect = element.getBoundingClientRect();
          
          // Calculate touch position relative to center
          const touchX = touch.clientX - rect.left - rect.width / 2;
          const touchY = touch.clientY - rect.top - rect.height / 2;
          
          // Set zoom point as center
          setScale(2);
          setTranslateX(touchX * -0.5);
          setTranslateY(touchY * -0.5);
          setIsZoomed(true);
          
          gestureState.current.scale = 2;
          gestureState.current.translateX = touchX * -0.5;
          gestureState.current.translateY = touchY * -0.5;
        }
      }
      
      gestureState.current.lastTapTime = now;
    };

    const handleTouchEnd = () => {
      // If scale is very close to 1, snap back to exactly 1
      if (gestureState.current.scale < 1.05) {
        resetZoom();
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchstart', handleDoubleTap, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchstart', handleDoubleTap);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef]);

  return {
    scale,
    translateX,
    translateY,
    isZoomed,
    resetZoom
  };
}
