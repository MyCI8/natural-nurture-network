
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  layoutMode: 'default' | 'compact' | 'fullscreen';
  showRightSection: boolean;
  contentWidth: string;
  contentMaxWidth: string;
  isFullWidth: boolean;
  mobileHeaderVisible: boolean;
  setLayoutMode: (mode: 'default' | 'compact' | 'fullscreen') => void;
  setShowRightSection: (show: boolean) => void;
  setContentWidth: (width: string) => void;
  setContentMaxWidth: (width: string) => void;
  setIsFullWidth: (isFullWidth: boolean) => void;
  setMobileHeaderVisible: (visible: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  layoutMode: 'default',
  showRightSection: true,
  contentWidth: 'w-full',
  contentMaxWidth: 'max-w-5xl',
  isFullWidth: false,
  mobileHeaderVisible: true,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  setContentWidth: () => {},
  setContentMaxWidth: () => {},
  setIsFullWidth: () => {},
  setMobileHeaderVisible: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<'default' | 'compact' | 'fullscreen'>('default');
  const [showRightSection, setShowRightSection] = useState(true);
  const [contentWidth, setContentWidth] = useState('w-full');
  const [contentMaxWidth, setContentMaxWidth] = useState('max-w-5xl');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true);

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        showRightSection,
        contentWidth,
        contentMaxWidth,
        isFullWidth,
        mobileHeaderVisible,
        setLayoutMode,
        setShowRightSection,
        setContentWidth,
        setContentMaxWidth,
        setIsFullWidth,
        setMobileHeaderVisible,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
