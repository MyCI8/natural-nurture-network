/**
 * Hook for preventing memory leaks in React components
 */

import { useEffect, useRef } from 'react';
import { log } from '@/utils/logger';

export const useMemoryCleanup = () => {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const listenersRef = useRef<Array<{ element: EventTarget; event: string; handler: EventListener; options?: boolean | AddEventListenerOptions }>>([]);
  const abortControllersRef = useRef<AbortController[]>([]);

  const addTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = setTimeout(callback, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  const addInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.push(intervalId);
    return intervalId;
  };

  const addEventListener = (
    element: EventTarget, 
    event: string, 
    handler: EventListener, 
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler, options });
  };

  const createAbortController = (): AbortController => {
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    return controller;
  };

  const clearTimeout = (timeoutId: NodeJS.Timeout) => {
    window.clearTimeout(timeoutId);
    timeoutsRef.current = timeoutsRef.current.filter(id => id !== timeoutId);
  };

  const clearInterval = (intervalId: NodeJS.Timeout) => {
    window.clearInterval(intervalId);
    intervalsRef.current = intervalsRef.current.filter(id => id !== intervalId);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(timeoutId => {
        try {
          window.clearTimeout(timeoutId);
        } catch (error) {
          log.warn('Failed to clear timeout', error);
        }
      });

      // Clear all intervals
      intervalsRef.current.forEach(intervalId => {
        try {
          window.clearInterval(intervalId);
        } catch (error) {
          log.warn('Failed to clear interval', error);
        }
      });

      // Remove all event listeners
      listenersRef.current.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          log.warn('Failed to remove event listener', error);
        }
      });

      // Abort all controllers
      abortControllersRef.current.forEach(controller => {
        try {
          controller.abort();
        } catch (error) {
          log.warn('Failed to abort controller', error);
        }
      });

      // Clear arrays
      timeoutsRef.current = [];
      intervalsRef.current = [];
      listenersRef.current = [];
      abortControllersRef.current = [];
    };
  }, []);

  return {
    addTimeout,
    addInterval,
    addEventListener,
    createAbortController,
    clearTimeout,
    clearInterval
  };
};