
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define layout modes
export type LayoutMode = 'default' | 'wide' | 'full' | 'instagram';

interface LayoutContextProps {
  layoutMode: LayoutMode;
  showRightSection: boolean;
  showLeftSidebar: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setShowRightSection: (show: boolean) => void;
  setShowLeftSidebar: (show: boolean) => void;
  contentWidth: string;
  contentClass: string;
  mainClass: string;
}

const defaultContext: LayoutContextProps = {
  layoutMode: 'default',
  showRightSection: false,
  showLeftSidebar: true,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  setShowLeftSidebar: () => {},
  contentWidth: 'max-w-[700px] mx-auto px-4 md:px-6',
  contentClass: 'x-content-inner',
  mainClass: 'min-h-screen'
};

const LayoutContext = createContext<LayoutContextProps>(defaultContext);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [contentWidth, setContentWidth] = useState('max-w-[700px] mx-auto px-4 md:px-6');
  const [contentClass, setContentClass] = useState('x-content-inner');
  const [mainClass, setMainClass] = useState('min-h-screen');
  const location = useLocation();
  
  // Update layout based on routes and mode
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/admin')) {
      // Admin pages use a different layout
      setLayoutMode('wide');
      setShowRightSection(false);
      setShowLeftSidebar(true);
      setContentWidth('max-w-full w-full px-4 md:px-6');
      setContentClass('');
      setMainClass('min-h-screen');
      return;
    }
    
    // Set layout mode based on route
    if (path.startsWith('/news/')) {
      setLayoutMode('full');
      setShowRightSection(true);
      setShowLeftSidebar(true);
      setContentClass('news-article-content');
      setMainClass('min-h-screen');
    } else if (path === '/explore' || path.startsWith('/explore')) {
      setLayoutMode('instagram');
      setShowRightSection(false);
      setShowLeftSidebar(false);
      setContentClass('x-content-full');
      setMainClass('min-h-screen w-full p-0');
    } else if (path.startsWith('/remedies/') || path.startsWith('/ingredients/')) {
      setLayoutMode('default');
      setShowRightSection(false);
      setShowLeftSidebar(true);
      setContentClass('x-content-inner');
      setMainClass('min-h-screen py-4 md:py-6');
    } else {
      // Default for other pages
      setLayoutMode('default');
      setShowRightSection(false);
      setShowLeftSidebar(true);
      setContentClass('x-content-inner');
      setMainClass('min-h-screen');
    }
    
    // Update content width based on layout mode
    switch (layoutMode) {
      case 'wide':
        setContentWidth('max-w-[900px] mx-auto px-4 md:px-6');
        break;
      case 'full':
        setContentWidth('news-article-container mx-auto');
        break;
      case 'instagram':
        setContentWidth('w-full mx-auto p-0');
        break;
      default:
        setContentWidth('max-w-[700px] mx-auto px-4 md:px-6');
    }
  }, [layoutMode, location.pathname]);
  
  return (
    <LayoutContext.Provider 
      value={{
        layoutMode,
        showRightSection,
        showLeftSidebar,
        setLayoutMode,
        setShowRightSection,
        setShowLeftSidebar,
        contentWidth,
        contentClass,
        mainClass
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
