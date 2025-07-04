
import { useRef, useCallback, useEffect } from 'react';

interface SwipeState {
  startY: number;
  currentY: number;
  startTime: number;
  isVertical: boolean;
  isDragging: boolean;
  velocity: number;
}

interface SwipeCallbacks {
  onSwipeStart?: () => void;
  onSwipeProgress?: (progress: number, direction: 'up' | 'down') => void;
  onSwipeEnd?: (direction: 'up' | 'down', velocity: number) => void;
  onSwipeCancel?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  maxSwipeTime?: number;
  preventScroll?: boolean;
}

export function useOptimizedSwipe(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    threshold = 80,
    velocityThreshold = 0.5,
    maxSwipeTime = 500,
    preventScroll = true
  } = options;

  const stateRef = useRef<SwipeState>({
    startY: 0,
    currentY: 0,
    startTime: 0,
    isVertical: false,
    isDragging: false,
    velocity: 0
  });

  const rafRef = useRef<number>(0);
  const velocityTracker = useRef<Array<{ time: number; y: number }>>([]);

  const calculateVelocity = useCallback(() => {
    const tracker = velocityTracker.current;
    if (tracker.length < 2) return 0;

    const recent = tracker.slice(-5); // Use last 5 points
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const deltaTime = last.time - first.time;
    const deltaY = last.y - first.y;
    
    return deltaTime > 0 ? deltaY / deltaTime : 0;
  }, []);

  const updateProgress = useCallback(() => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    const deltaY = state.currentY - state.startY;
    const progress = Math.min(Math.abs(deltaY) / threshold, 1);
    const direction = deltaY < 0 ? 'up' : 'down';

    state.velocity = calculateVelocity();
    
    if (callbacks.onSwipeProgress) {
      callbacks.onSwipeProgress(progress, direction);
    }
  }, [threshold, calculateVelocity, callbacks]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const state = stateRef.current;
    state.startY = touch.clientY;
    state.currentY = touch.clientY;
    state.startTime = Date.now();
    state.isDragging = true;
    state.isVertical = false;

    velocityTracker.current = [{ time: Date.now(), y: touch.clientY }];

    if (callbacks.onSwipeStart) {
      callbacks.onSwipeStart();
    }
  }, [callbacks]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const state = stateRef.current;
    if (!state.isDragging) return;

    const deltaY = touch.clientY - state.startY;
    const deltaX = Math.abs(touch.clientX - e.touches[0].clientX);

    // Determine if this is a vertical swipe
    if (!state.isVertical && Math.abs(deltaY) > 10) {
      state.isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    }

    if (state.isVertical && preventScroll) {
      e.preventDefault();
    }

    state.currentY = touch.clientY;
    
    // Track velocity
    velocityTracker.current.push({ time: Date.now(), y: touch.clientY });
    if (velocityTracker.current.length > 10) {
      velocityTracker.current.shift();
    }

    // Use RAF for smooth updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress, preventScroll]);

  const handleTouchEnd = useCallback(() => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    state.isDragging = false;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const deltaY = state.currentY - state.startY;
    const duration = Date.now() - state.startTime;
    const velocity = calculateVelocity();

    // Determine if swipe should trigger
    const shouldTrigger = 
      (Math.abs(deltaY) > threshold) ||
      (Math.abs(velocity) > velocityThreshold && duration < maxSwipeTime);

    if (shouldTrigger && state.isVertical) {
      const direction = deltaY < 0 ? 'up' : 'down';
      if (callbacks.onSwipeEnd) {
        callbacks.onSwipeEnd(direction, velocity);
      }
    } else {
      if (callbacks.onSwipeCancel) {
        callbacks.onSwipeCancel();
      }
    }

    // Reset state
    velocityTracker.current = [];
  }, [threshold, velocityThreshold, maxSwipeTime, calculateVelocity, callbacks]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
