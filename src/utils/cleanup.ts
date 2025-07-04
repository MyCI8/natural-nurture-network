/**
 * Utility for managing cleanup operations to prevent memory leaks
 */

export class CleanupManager {
  private cleanupFunctions: (() => void)[] = [];

  addTimeout(timeoutId: NodeJS.Timeout) {
    this.cleanupFunctions.push(() => clearTimeout(timeoutId));
  }

  addInterval(intervalId: NodeJS.Timeout) {
    this.cleanupFunctions.push(() => clearInterval(intervalId));
  }

  addEventListener(element: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
    element.addEventListener(event, handler, options);
    this.cleanupFunctions.push(() => element.removeEventListener(event, handler));
  }

  addAbortController(controller: AbortController) {
    this.cleanupFunctions.push(() => controller.abort());
  }

  addCustomCleanup(cleanupFn: () => void) {
    this.cleanupFunctions.push(cleanupFn);
  }

  cleanup() {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

/**
 * Hook for managing cleanup in React components
 */
export const useCleanupManager = () => {
  const manager = new CleanupManager();
  
  return {
    addTimeout: (callback: () => void, delay: number) => {
      const timeoutId = setTimeout(callback, delay);
      manager.addTimeout(timeoutId);
      return timeoutId;
    },
    
    addInterval: (callback: () => void, delay: number) => {
      const intervalId = setInterval(callback, delay);
      manager.addInterval(intervalId);
      return intervalId;
    },
    
    addEventListener: (element: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) => {
      manager.addEventListener(element, event, handler, options);
    },
    
    addAbortController: () => {
      const controller = new AbortController();
      manager.addAbortController(controller);
      return controller;
    },
    
    cleanup: () => manager.cleanup()
  };
};