import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutState {
  layoutMode: 'comfortable' | 'compact' | 'auto';
  showRightSection: boolean;
  contentWidth: string;
  contentMaxWidth: string;
  isFullWidth: boolean;
  isInReelsMode: boolean;
  sidebarCollapsed: boolean;
}

type LayoutAction = 
  | { type: 'SET_LAYOUT_MODE'; payload: LayoutState['layoutMode'] }
  | { type: 'TOGGLE_RIGHT_SECTION' }
  | { type: 'SET_FULL_WIDTH'; payload: boolean }
  | { type: 'SET_REELS_MODE'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESET_LAYOUT' };

const initialState: LayoutState = {
  layoutMode: 'auto',
  showRightSection: true,
  contentWidth: 'w-full px-4 sm:px-6 lg:px-8',
  contentMaxWidth: 'max-w-7xl',
  isFullWidth: false,
  isInReelsMode: false,
  sidebarCollapsed: false,
};

const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'SET_LAYOUT_MODE':
      return { ...state, layoutMode: action.payload };
    case 'TOGGLE_RIGHT_SECTION':
      return { ...state, showRightSection: !state.showRightSection };
    case 'SET_FULL_WIDTH':
      return { ...state, isFullWidth: action.payload };
    case 'SET_REELS_MODE':
      return { ...state, isInReelsMode: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'RESET_LAYOUT':
      return initialState;
    default:
      return state;
  }
};

interface LayoutContextType extends LayoutState {
  setLayoutMode: (mode: LayoutState['layoutMode']) => void;
  toggleRightSection: () => void;
  setFullWidth: (fullWidth: boolean) => void;
  setReelsMode: (reelsMode: boolean) => void;
  toggleSidebar: () => void;
  resetLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const OptimizedLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  const isMobile = useIsMobile();

  const setLayoutMode = useCallback((mode: LayoutState['layoutMode']) => {
    dispatch({ type: 'SET_LAYOUT_MODE', payload: mode });
  }, []);

  const toggleRightSection = useCallback(() => {
    if (!isMobile) {
      dispatch({ type: 'TOGGLE_RIGHT_SECTION' });
    }
  }, [isMobile]);

  const setFullWidth = useCallback((fullWidth: boolean) => {
    dispatch({ type: 'SET_FULL_WIDTH', payload: fullWidth });
  }, []);

  const setReelsMode = useCallback((reelsMode: boolean) => {
    dispatch({ type: 'SET_REELS_MODE', payload: reelsMode });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const resetLayout = useCallback(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  const value: LayoutContextType = {
    ...state,
    showRightSection: isMobile ? false : state.showRightSection,
    setLayoutMode,
    toggleRightSection,
    setFullWidth,
    setReelsMode,
    toggleSidebar,
    resetLayout,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useOptimizedLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useOptimizedLayout must be used within an OptimizedLayoutProvider');
  }
  return context;
};