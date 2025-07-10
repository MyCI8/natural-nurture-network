
import React, { useState, useRef } from 'react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface TouchFriendlyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
  className?: string;
}

export const TouchFriendlyDrawer = ({
  isOpen,
  onClose,
  children,
  position = 'bottom',
  className
}: TouchFriendlyDrawerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Handle drawer swiping to close
  const { handlers } = useTouchGestures({
    onSwipeDown: position === 'bottom' ? onClose : undefined,
    onSwipeRight: position === 'right' ? onClose : undefined,
    threshold: 75
  });
  
  // Position-specific styles
  const positionStyles = position === 'bottom' 
    ? {
        className: cn(
          "fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 bg-background rounded-t-xl border-t shadow-lg",
          isOpen ? "translate-y-0" : "translate-y-full",
          isDragging && "transition-none",
          className
        ),
        style: isDragging ? { transform: `translateY(${dragOffset}px)` } : {}
      }
    : {
        className: cn(
          "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 bg-background border-l shadow-lg",
          isOpen ? "translate-x-0" : "translate-x-full",
          isDragging && "transition-none",
          className
        ),
        style: isDragging ? { transform: `translateX(${dragOffset}px)` } : {}
      };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    handlers.onTouchStart(e);
    
    // Only initiate dragging for handle area
    const target = e.target as HTMLElement;
    if (target.closest('.drawer-handle')) {
      setIsDragging(true);
      setDragOffset(0);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    handlers.onTouchMove(e);
    
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = drawerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    if (position === 'bottom') {
      const newOffset = Math.max(0, touch.clientY - rect.top);
      setDragOffset(newOffset);
    } else {
      const newOffset = Math.max(0, touch.clientX - rect.left);
      setDragOffset(newOffset);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    handlers.onTouchEnd(e);
    
    if (!isDragging) return;
    
    // Close if dragged more than 40% of the way
    const threshold = position === 'bottom'
      ? (drawerRef.current?.offsetHeight || 0) * 0.4
      : (drawerRef.current?.offsetWidth || 0) * 0.4;
      
    if (dragOffset > threshold) {
      onClose();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  if (!isOpen && !isDragging) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={positionStyles.className}
        style={positionStyles.style}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle for bottom drawer */}
        {position === 'bottom' && (
          <div className="drawer-handle flex justify-center pt-2 pb-1 touch-manipulation">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        
        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};
