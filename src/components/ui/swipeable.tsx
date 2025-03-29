
import React, { useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
  threshold?: number; // Minimum distance required for a swipe
  minVelocity?: number; // Minimum velocity required for a swipe
}

export const Swipeable = ({
  children,
  className,
  onSwipe,
  threshold = 50,
  minVelocity = 0.3,
  ...props
}: SwipeableProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !onSwipe) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const elapsedTime = touchEnd.time - touchStart.time;
    const velocityX = Math.abs(distanceX) / elapsedTime;
    const velocityY = Math.abs(distanceY) / elapsedTime;

    // Determine the swipe direction
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (Math.abs(distanceX) >= threshold && velocityX >= minVelocity) {
        onSwipe(distanceX > 0 ? "right" : "left");
      }
    } else {
      // Vertical swipe
      if (Math.abs(distanceY) >= threshold && velocityY >= minVelocity) {
        onSwipe(distanceY > 0 ? "down" : "up");
      }
    }

    setTouchStart(null);
  };

  const handleTouchCancel = () => {
    setTouchStart(null);
  };

  return (
    <div
      ref={elementRef}
      className={cn("touch-manipulation", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      {...props}
    >
      {children}
    </div>
  );
};
