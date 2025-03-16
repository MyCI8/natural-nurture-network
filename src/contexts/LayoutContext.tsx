
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile';

// Define layout modes
export type LayoutMode = 'default' | 'wide' | 'full' | 'three-column';

interface LayoutContextProps {
  layoutMode: LayoutMode;
  showRightSection: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setShowRightSection: (show: boolean) => void;
  contentWidth: string;
  contentMaxWidth: string;
  isFullWidth: boolean;
}

const defaultContext: LayoutContextProps = {
  layoutMode: 'default',
  showRightSection: false,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  contentWidth: 'px-4',
  contentMaxWidth: 'max-w-3xl',
  isFullWidth: false
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [contentWidth, setContentWidth] = useState('px-4');
  const [contentMaxWidth, setContentMaxWidth] = useState('max-w-3xl');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  // Update layout based on routes and screen size
  useEffect(() => {
    const path = location.pathname;
    
    // Set layout mode and right section visibility based on route and screen size
    if (path === '/news' || path.startsWith('/news/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth('px-2 sm:px-4');
      setContentMaxWidth('max-w-[900px]');
      setIsFullWidth(false);
    } 
    else if (path.startsWith('/explore/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth('p-0 sm:px-2');
      setContentMaxWidth('max-w-[900px]');
      setIsFullWidth(false);
    }
    else if (path.startsWith('/symptoms/')) {
      setLayoutMode('three-column');
      setShowRightSection(!isMobile);
      setContentWidth('px-2 sm:px-4');
      setContentMaxWidth('max-w-[900px]');
      setIsFullWidth(false);
    }
    else if (path.startsWith('/admin')) {
      setLayoutMode('wide');
      setShowRightSection(false);
      setContentWidth('px-4 md:px-6');
      setContentMaxWidth('max-w-4xl');
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
      setContentWidth('px-4');
      setContentMaxWidth('max-w-3xl');
      setIsFullWidth(false);
    }
    else {
      // Default for other pages
      setLayoutMode('default');
      setShowRightSection(false);
      setContentWidth('px-4');
      setContentMaxWidth('max-w-3xl');
      setIsFullWidth(false);
    }

    // On mobile, always hide the right section regardless of the route
    if (isMobile) {
      setShowRightSection(false);
    }
  }, [location, isMobile, breakpoint]);
  
  return (
    <LayoutContext.Provider 
      value={{
        layoutMode,
        showRightSection,
        setLayoutMode,
        setShowRightSection,
        contentWidth,
        contentMaxWidth,
        isFullWidth
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
