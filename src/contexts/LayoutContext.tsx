
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  layoutMode: 'default' | 'compact' | 'comfortable';
  showRightSection: boolean;
  contentWidth: string;
  contentMaxWidth: string;
  isFullWidth: boolean;
  setLayoutMode: (mode: 'default' | 'compact' | 'comfortable') => void;
  setShowRightSection: (show: boolean) => void;
  setContentWidth: (width: string) => void;
  setContentMaxWidth: (width: string) => void;
  setIsFullWidth: (isFullWidth: boolean) => void;
}

const defaultValues: LayoutContextType = {
  layoutMode: 'default',
  showRightSection: false,
  contentWidth: 'w-full',
  contentMaxWidth: 'max-w-[1000px]',
  isFullWidth: false,
  setLayoutMode: () => {},
  setShowRightSection: () => {},
  setContentWidth: () => {},
  setContentMaxWidth: () => {},
  setIsFullWidth: () => {}
};

const LayoutContext = createContext<LayoutContextType>(defaultValues);

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const [layoutMode, setLayoutMode] = useState<'default' | 'compact' | 'comfortable'>('default');
  const [showRightSection, setShowRightSection] = useState(false);
  const [contentWidth, setContentWidth] = useState('w-full');
  const [contentMaxWidth, setContentMaxWidth] = useState('max-w-[1000px]');
  const [isFullWidth, setIsFullWidth] = useState(false);

  const value: LayoutContextType = {
    layoutMode,
    showRightSection,
    contentWidth,
    contentMaxWidth,
    isFullWidth,
    setLayoutMode,
    setShowRightSection,
    setContentWidth,
    setContentMaxWidth,
    setIsFullWidth
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
