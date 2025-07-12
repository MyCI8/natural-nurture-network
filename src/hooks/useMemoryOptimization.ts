import { useEffect, useRef } from 'react';

/**
 * Hook to manage memory optimization for video components
 */
export function useMemoryOptimization() {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = (fn: () => void) => {
    cleanupFunctions.current.push(fn);
  };

  const removeCleanup = (fn: () => void) => {
    const index = cleanupFunctions.current.indexOf(fn);
    if (index > -1) {
      cleanupFunctions.current.splice(index, 1);
    }
  };

  const forceGarbageCollection = () => {
    // Run all cleanup functions
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });

    // Force garbage collection if available (development only)
    if (import.meta.env.DEV && 'gc' in window) {
      (window as any).gc();
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      forceGarbageCollection();
      cleanupFunctions.current = [];
    };
  }, []);

  return {
    addCleanup,
    removeCleanup,
    forceGarbageCollection
  };
}

/**
 * Hook to create intersection observer with memory management
 */
export function useOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { addCleanup, removeCleanup } = useMemoryOptimization();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '100px',
      threshold: 0.1,
      ...options
    });

    const cleanup = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };

    addCleanup(cleanup);

    return () => {
      cleanup();
      removeCleanup(cleanup);
    };
  }, [callback, options, addCleanup, removeCleanup]);

  const observe = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };

  const unobserve = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  };

  return { observe, unobserve };
}