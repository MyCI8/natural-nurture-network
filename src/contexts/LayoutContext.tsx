
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile, useBreakpoint, useIsTablet } from '@/hooks/use-mobile';

// Define layout modes
export type LayoutMode = 'default' | 'wide' | 'full' | 'three-column';

interface LayoutContextProps {
  layoutMode: LayoutMode;
  showRightSection: boolean;
  isInReelsMode: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setShowRightSection: (show: boolean) => void;
  setIsInReelsMode: (isInReels: boolean) => void;
  contentWidth: string;
  contentMaxWidth: string;
  isFullWidth: boolean;
}

const defaultContext: LayoutContextProps = {
  layoutMode: 'default',
  showRightSection: false,
  isInReelsMode: false,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  setIsInReelsMode: () => {},
  contentWidth: 'px-0',
  contentMaxWidth: 'max-w-full',
  isFullWidth: true
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [isInReelsMode, setIsInReelsMode] = useState(false);
  const [contentWidth, setContentWidth] = useState('px-0');
  const [contentMaxWidth, setContentMaxWidth] = useState('max-w-full');
  const [isFullWidth, setIsFullWidth] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const breakpoint = useBreakpoint();
  
  // Update layout based on routes and screen size
  useEffect(() => {
    const path = location.pathname;
    
    // Store current scroll position before layout changes
    const currentScrollY = window.scrollY;
    
    // Set layout mode and right section visibility based on route and screen size
    if (path === '/news' || path.startsWith('/news/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth(isMobile ? 'px-0' : 'px-2 sm:px-4');
      setContentMaxWidth(isTablet ? 'max-w-[800px]' : 'max-w-[900px]');
      setIsFullWidth(isMobile);
    }
    else if (path === '/remedies/create') {
      // Special case for remedy creation - full width, no constraints
      setLayoutMode('full');
      setShowRightSection(false);
      setContentWidth('p-0');
      setContentMaxWidth('max-w-full');
      setIsFullWidth(true);
    }
    else if (path === '/remedies' || path.startsWith('/remedies/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth(isMobile ? 'px-0' : 'px-2 sm:px-4');
      setContentMaxWidth(isMobile ? 'max-w-full' : 'max-w-2xl');
      setIsFullWidth(isMobile);
    }
    else if (path.startsWith('/explore/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth('p-0');
      setContentMaxWidth(isTablet ? 'max-w-[800px]' : 'max-w-[900px]');
      setIsFullWidth(true);
    }
    else if (path.startsWith('/health-concerns/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth(isMobile ? 'px-0' : 'px-2 sm:px-4');
      setContentMaxWidth(isTablet ? 'max-w-[800px]' : 'max-w-[900px]');
      setIsFullWidth(isMobile);
    }
    else if (path.startsWith('/admin')) {
      setLayoutMode('wide');
      setShowRightSection(false);
      setContentWidth('px-3 sm:px-4 md:px-6');
      setContentMaxWidth('max-w-6xl');
      setIsFullWidth(false);
    } 
    else if (path === '/explore') {
      setLayoutMode('full');
      setShowRightSection(false);
      setContentWidth('p-0');
      setContentMaxWidth('max-w-full');
      setIsFullWidth(true);
    } 
    else if (path === '/' || path === '/home') {
      setLayoutMode('default');
      setShowRightSection(false);
      setContentWidth('px-0');
      setContentMaxWidth('max-w-full');
      setIsFullWidth(true);
    }
    else if (path.startsWith('/users/')) {
      setLayoutMode('default');
      setShowRightSection(false);
      setContentWidth(isMobile ? 'px-0' : 'px-4');
      setContentMaxWidth(isMobile ? 'max-w-full' : 'max-w-4xl');
      setIsFullWidth(isMobile);
    }
    else {
      // Default for other pages - edge-to-edge on mobile
      setLayoutMode('default');
      setShowRightSection(false);
      setContentWidth(isMobile ? 'px-0' : 'px-4');
      setContentMaxWidth(isMobile ? 'max-w-full' : 'max-w-5xl');
      setIsFullWidth(isMobile);
    }

    // On mobile, always hide the right section regardless of the route
    if (isMobile) {
      setShowRightSection(false);
    }

    // Restore scroll position after layout changes to prevent unwanted scrolling
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      if (currentScrollY > 0) {
        window.scrollTo(0, currentScrollY);
      }
    });
  }, [location, isMobile, isTablet, breakpoint]);
  
  return (
    <LayoutContext.Provider 
      value={{
        layoutMode,
        showRightSection,
        isInReelsMode,
        setLayoutMode,
        setShowRightSection,
        setIsInReelsMode,
        contentWidth,
        contentMaxWidth,
        isFullWidth
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
