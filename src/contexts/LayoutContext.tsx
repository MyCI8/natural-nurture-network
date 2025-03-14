
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define layout modes
export type LayoutMode = 'default' | 'wide' | 'full' | 'instagram';

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
  contentWidth: 'px-4'
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [contentWidth, setContentWidth] = useState('px-4');
  const location = useLocation();
  
  // Update layout based on routes
  useEffect(() => {
    const path = location.pathname;
    
    // Set layout mode and right section visibility based on route
    if (path.startsWith('/news/')) {
      setLayoutMode('full');
      setShowRightSection(true);
      setContentWidth('px-4');
    } 
    else if (path.startsWith('/explore/')) {
      setLayoutMode('instagram');
      setShowRightSection(true);
      setContentWidth('p-0');
    }
    else if (path.startsWith('/symptoms/')) {
      setLayoutMode('wide');
      setShowRightSection(true);
      setContentWidth('px-4');
    }
    else if (path.startsWith('/admin')) {
      setLayoutMode('wide');
      setShowRightSection(false);
      setContentWidth('px-4 md:px-6');
    } 
    else if (path === '/explore') {
      setLayoutMode('instagram');
      setShowRightSection(false);
      setContentWidth('p-0');
    } 
    else {
      // Default for other pages
      setLayoutMode('default');
      setShowRightSection(false);
      setContentWidth('px-4');
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
