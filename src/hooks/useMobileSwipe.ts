import { useRef, useCallback } from "react";

type SwipeDirection = "up" | "down";
type SwipeState = {
  swiping: boolean;
  direction: SwipeDirection | null;
  progress: number; // 0...1, progression percent for animation
};

interface UseMobileSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  onSwipeProgress?: (direction: SwipeDirection | null, progress: number) => void;
  verticalOnly?: boolean;
  thresholdPx?: number;         // min pixels before we consider it a swipe
  quickSwipeTimeMs?: number;    // below this ms, allow smaller threshold
}

export function useMobileSwipe({
  onSwipe,
  onSwipeProgress,
  verticalOnly = true,
  thresholdPx = 64,
  quickSwipeTimeMs = 220,
}: UseMobileSwipeOptions) {
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastProgressDir = useRef<SwipeDirection | null>(null);
  const progressFrame = useRef<number | null>(null);

  // Handler for touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) {return;}
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    lastProgressDir.current = null;

    if (onSwipeProgress) {onSwipeProgress(null, 0);}
  }, [onSwipeProgress]);

  // Handler for touch move, computes and emits swipe progress
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) {return;}
    const deltaY = e.touches[0].clientY - touchStartY.current;
    let direction: SwipeDirection | null = null;
    let progress = 0;
    if (verticalOnly && Math.abs(deltaY) > 2) {
      direction = deltaY < 0 ? "up" : "down";
      progress = Math.min(Math.abs(deltaY) / thresholdPx, 1);
    }

    // Cancel horizontal if verticalOnly
    if (verticalOnly) {
      if (Math.abs(deltaY) < 3) {direction = null;} // too little movement
      if (onSwipeProgress) {
        // keep only the direction when swipe is happening
        if (progressFrame.current) {
          cancelAnimationFrame(progressFrame.current);
        }
        progressFrame.current = requestAnimationFrame(() =>
          onSwipeProgress(direction, progress)
        );
      }
    }
    // Prevent scroll
    if (verticalOnly && Math.abs(deltaY) > 3) {
      e.preventDefault?.();
    }
  }, [onSwipeProgress, verticalOnly, thresholdPx]);

  // Handler for touch end, determines if a swipe occurred
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;
    let succeeded = false;
    let dir: SwipeDirection | null = null;
    if (verticalOnly && Math.abs(deltaY) > 10) {
      const absDelta = Math.abs(deltaY);
      // Threshold for "fast" flicks is lower
      const threshold = duration < quickSwipeTimeMs ? thresholdPx * 0.6 : thresholdPx;
      if (absDelta > threshold) {
        dir = deltaY < 0 ? "up" : "down";
        succeeded = true;
      }
    }

    if (onSwipeProgress) {onSwipeProgress(null, 0);}
    if (succeeded && dir) {
      onSwipe(dir);
    }
  }, [onSwipe, onSwipeProgress, verticalOnly, quickSwipeTimeMs, thresholdPx]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
