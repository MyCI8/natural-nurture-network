
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
  contentWidth: 'max-w-[700px] mx-auto px-6'
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [contentWidth, setContentWidth] = useState('max-w-[700px] mx-auto px-6');
  const location = useLocation();
  
  // Update content width based on layout mode
  useEffect(() => {
    switch (layoutMode) {
      case 'wide':
        setContentWidth('max-w-[900px] mx-auto px-6');
        break;
      case 'full':
        setContentWidth('news-article-container mx-auto');
        break;
      case 'instagram':
        setContentWidth('w-full mx-auto p-0');
        break;
      default:
        setContentWidth('max-w-[700px] mx-auto px-6');
    }
  }, [layoutMode, location.pathname]);
  
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
    } else if (path === '/explore' || path.startsWith('/explore')) {
      setLayoutMode('instagram');
      setShowRightSection(false);
    } else if (path === '/') {
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
