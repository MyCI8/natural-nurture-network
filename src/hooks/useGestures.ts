
import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useGestures(containerRef: React.RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const lastTapTime = useRef(0);
  const initialTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Don't enable touch gestures on desktop
    if (!isMobile) {
      return;
    }
    
    const container = containerRef.current;
    if (!container) return;
    
    const handleDoubleTap = (e: TouchEvent) => {
      const now = new Date().getTime();
      const timeSince = now - lastTapTime.current;
      
      if (timeSince < 300 && e.touches.length === 1) {
        // Toggle zoom state on double tap
        setIsZoomed(!isZoomed);
        setScale(isZoomed ? 1 : 2);
        setTranslateX(0);
        setTranslateY(0);
        e.preventDefault();
      }
      
      lastTapTime.current = now;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        initialTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        lastTouchRef.current = initialTouchRef.current;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isZoomed || e.touches.length !== 1 || !initialTouchRef.current || !lastTouchRef.current) return;
      
      const currentTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      const deltaX = currentTouch.x - lastTouchRef.current.x;
      const deltaY = currentTouch.y - lastTouchRef.current.y;
      
      // Limit movement when zoomed
      const maxTranslate = 100; // Maximum pixel translation
      const newTranslateX = Math.min(Math.max(translateX + deltaX * 0.5, -maxTranslate), maxTranslate);
      const newTranslateY = Math.min(Math.max(translateY + deltaY * 0.5, -maxTranslate), maxTranslate);
      
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
      
      lastTouchRef.current = currentTouch;
      
      // Prevent default behavior like scrolling when zoomed in
      if (isZoomed) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      initialTouchRef.current = null;
      // Don't reset lastTouchRef to keep track for double tap
    };
    
    const handlePinchZoom = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
      // Calculate distance between two fingers
      const getDistance = (touch1: Touch, touch2: Touch) => {
        return Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      };
      
      // Use a base distance value for relative scaling
      const distance = getDistance(e.touches[0], e.touches[1]);
      const baseDistance = 150;
      const newScale = Math.max(1, Math.min(3, distance / baseDistance));
      
      setScale(newScale);
      setIsZoomed(newScale > 1.05);
    };
    
    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchstart', handleDoubleTap, { passive: false });
    container.addEventListener('touchmove', handlePinchZoom, { passive: false });
    
    // Clean up
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchstart', handleDoubleTap);
      container.removeEventListener('touchmove', handlePinchZoom);
    };
  }, [containerRef, isZoomed, scale, translateX, translateY, isMobile]);

  // Reset zoom state
  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsZoomed(false);
  };

  return { scale, translateX, translateY, isZoomed, resetZoom };
}
