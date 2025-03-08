
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define layout modes
export type LayoutMode = 'default' | 'wide' | 'full';

interface LayoutContextProps {
  layoutMode: LayoutMode;
  showRightSection: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setShowRightSection: (show: boolean) => void;
  contentWidth: string;
}

const defaultContext: LayoutContextProps = {
  layoutMode: 'default',
  showRightSection: false,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  contentWidth: 'max-w-[var(--content-max-width)] mx-auto'
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [contentWidth, setContentWidth] = useState('max-w-[var(--content-max-width)] mx-auto');
  const location = useLocation();
  
  // Update content width based on layout mode
  useEffect(() => {
    switch (layoutMode) {
      case 'wide':
        setContentWidth('max-w-[var(--wide-content-max-width)] mx-auto');
        break;
      case 'full':
        setContentWidth('max-w-none');
        break;
      default:
        setContentWidth('max-w-[var(--content-max-width)] mx-auto');
    }
  }, [layoutMode]);
  
  // Update layout based on routes
  useEffect(() => {
    const path = location.pathname;
    
    // Set layout mode based on route
    if (path.startsWith('/news/')) {
      setLayoutMode('full');
      setShowRightSection(true);
    } else if (path.startsWith('/admin')) {
      setLayoutMode('wide');
      setShowRightSection(false);
    } else if (path === '/' || path.startsWith('/explore')) {
      setLayoutMode('default');
      setShowRightSection(false);
    } else {
      // Default for other pages
      setLayoutMode('default');
      setShowRightSection(false);
    }
  }, [location]);
  
  return (
    <LayoutContext.Provider 
      value={{
        layoutMode,
        showRightSection,
        setLayoutMode,
        setShowRightSection,
        contentWidth
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
