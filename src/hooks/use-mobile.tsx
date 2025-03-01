
import { useState, useEffect, useCallback } from "react";

// Breakpoints to match x.com
const MOBILE_BREAKPOINT = 768; // Mobile breakpoint (0-767px)
const TABLET_BREAKPOINT = 1200; // Tablet breakpoint (768px-1199px)

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const checkMobile = useCallback(() => {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }, []);

  useEffect(() => {
    // Set initial value
    setIsMobile(checkMobile());

    // Add resize listener
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [checkMobile]);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(false);

  const checkTablet = useCallback(() => {
    return window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT;
  }, []);

  useEffect(() => {
    // Set initial value
    setIsTablet(checkTablet());

    // Add resize listener
    const handleResize = () => {
      setIsTablet(checkTablet());
    };

    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [checkTablet]);

  return isTablet;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const checkDesktop = useCallback(() => {
    return window.innerWidth >= TABLET_BREAKPOINT;
  }, []);

  useEffect(() => {
    // Set initial value
    setIsDesktop(checkDesktop());

    // Add resize listener
    const handleResize = () => {
      setIsDesktop(checkDesktop());
    };

    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [checkDesktop]);

  return isDesktop;
}

// Unified breakpoint hook that returns the current breakpoint
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile');
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Initial check
    handleResize();

    // Listen for changes
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
}
