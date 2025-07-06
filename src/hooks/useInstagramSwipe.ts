import { useRef, useCallback, useState } from 'react';

interface SwipeState {
  startY: number;
  currentY: number;
  lastY: number;
  startTime: number;
  lastTime: number;
  isDragging: boolean;
  direction: 'up' | 'down' | null;
  velocityHistory: Array<{ y: number; time: number }>;
}

interface SwipeCallbacks {
  onSwipeStart?: () => void;
  onSwipeProgress?: (progress: number, direction: 'up' | 'down', deltaY: number) => void;
  onSwipeEnd?: (direction: 'up' | 'down', velocity: number, shouldSnap: boolean) => void;
  onSwipeCancel?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  maxSwipeTime?: number;
  resistance?: number;
  snapBackThreshold?: number;
}

export function useInstagramSwipe(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    threshold = 30, // Much lower threshold for immediate response
    velocityThreshold = 0.2, // Lower for more sensitive detection
    maxSwipeTime = 600,
    resistance = 0.3, // Rubber band resistance at boundaries
    snapBackThreshold = 0.3 // Snap threshold (30% of screen)
  } = options;

  const stateRef = useRef<SwipeState>({
    startY: 0,
    currentY: 0,
    lastY: 0,
    startTime: 0,
    lastTime: 0,
    isDragging: false,
    direction: null,
    velocityHistory: []
  });

  const rafRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Calculate instantaneous velocity using recent touch points
  const calculateVelocity = useCallback(() => {
    const history = stateRef.current.velocityHistory;
    if (history.length < 2) {return 0;}

    // Use recent points for velocity calculation
    const recentPoints = history.slice(-5);
    const first = recentPoints[0];
    const last = recentPoints[recentPoints.length - 1];
    
    const deltaTime = last.time - first.time;
    const deltaY = last.y - first.y;
    
    return deltaTime > 0 ? deltaY / deltaTime : 0;
  }, []);

  // Apply resistance at boundaries (rubber band effect)
  const applyResistance = useCallback((deltaY: number, canGoUp: boolean, canGoDown: boolean) => {
    const direction = deltaY < 0 ? 'up' : 'down';
    
    // If trying to swipe beyond boundaries, apply resistance
    if ((direction === 'up' && !canGoUp) || (direction === 'down' && !canGoDown)) {
      const resistanceFactor = Math.pow(resistance, Math.abs(deltaY) / 100);
      return deltaY * resistanceFactor;
    }
    
    return deltaY;
  }, [resistance]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) {return;}

    const now = performance.now();
    const state = stateRef.current;
    
    state.startY = touch.clientY;
    state.currentY = touch.clientY;
    state.lastY = touch.clientY;
    state.startTime = now;
    state.lastTime = now;
    state.isDragging = true;
    state.direction = null;
    state.velocityHistory = [{ y: touch.clientY, time: now }];

    setIsActive(true);
    
    if (callbacks.onSwipeStart) {
      callbacks.onSwipeStart();
    }
  }, [callbacks]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) {return;}

    const state = stateRef.current;
    if (!state.isDragging) {return;}

    const now = performance.now();
    const deltaY = touch.clientY - state.startY;
    const instantDeltaY = touch.clientY - state.lastY;
    
    // Update state
    state.currentY = touch.clientY;
    state.lastY = touch.clientY;
    state.lastTime = now;
    
    // Track velocity history (keep last 10 points)
    state.velocityHistory.push({ y: touch.clientY, time: now });
    if (state.velocityHistory.length > 10) {
      state.velocityHistory.shift();
    }

    // Detect direction early (after just 5px movement)
    if (!state.direction && Math.abs(deltaY) > 5) {
      state.direction = deltaY < 0 ? 'up' : 'down';
    }

    // Calculate progress (0 to 1) based on screen height
    const screenHeight = window.innerHeight;
    const rawProgress = Math.abs(deltaY) / screenHeight;
    const progress = Math.min(rawProgress, 1);

    if (state.direction && callbacks.onSwipeProgress) {
      // Apply resistance for over-scroll at boundaries
      // Note: You'll need to pass boundary info from the component
      const resistedDeltaY = deltaY; // Will be enhanced with boundary detection
      
      callbacks.onSwipeProgress(progress, state.direction, resistedDeltaY);
    }

    // Prevent default to stop scrolling
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();
    }
  }, [callbacks]);

  const handleTouchEnd = useCallback(() => {
    const state = stateRef.current;
    if (!state.isDragging) {return;}

    state.isDragging = false;
    setIsActive(false);

    const deltaY = state.currentY - state.startY;
    const elapsedTime = state.lastTime - state.startTime;
    const velocity = calculateVelocity();
    const screenHeight = window.innerHeight;
    
    // Determine if we should snap based on:
    // 1. Distance traveled (threshold)
    // 2. Velocity (fast flick)
    // 3. Progress percentage
    const progress = Math.abs(deltaY) / screenHeight;
    const fastSwipe = Math.abs(velocity) > velocityThreshold;
    const significantDistance = Math.abs(deltaY) > threshold;
    const shouldSnap = fastSwipe || progress > snapBackThreshold || significantDistance;

    if (shouldSnap && state.direction) {
      if (callbacks.onSwipeEnd) {
        callbacks.onSwipeEnd(state.direction, velocity, true);
      }
    } else {
      if (callbacks.onSwipeCancel) {
        callbacks.onSwipeCancel();
      }
    }

    // Reset state
    state.velocityHistory = [];
  }, [calculateVelocity, callbacks, threshold, velocityThreshold, snapBackThreshold]);

  // Clean up RAF on unmount
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isActive,
    cleanup
  };
}
