
import { useRef, useEffect } from 'react';

interface UseSwipeGestureProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  elementRef: React.RefObject<HTMLElement>;
  threshold?: number;
}

export const useSwipeGesture = ({ 
  isExpanded, 
  setIsExpanded, 
  elementRef,
  threshold = 50 
}: UseSwipeGestureProps) => {
  const touchStartX = useRef<number | null>(null);
  
  // Handle swipe gestures to close sidebar
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current || !isExpanded) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchStartX.current - touchX;
      
      // If swiping left, start closing the sidebar
      if (diff > threshold) {
        setIsExpanded(false);
        touchStartX.current = null;
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = null;
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isExpanded, setIsExpanded, elementRef, threshold]);
};
