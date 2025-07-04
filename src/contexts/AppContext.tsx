/**
 * Application State Management with Context API
 * Separates UI state from business logic
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { log } from '@/utils/logger';

// State interfaces
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
}

interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: AppNotification[];
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  searchQuery: string;
  lastActivity: number;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppNotification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  notifications: [],
  theme: 'system',
  sidebarOpen: false,
  searchQuery: '',
  lastActivity: Date.now()
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'ADD_NOTIFICATION':
      const newNotification: AppNotification = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now()
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        theme: state.theme // Preserve theme preference
      };

    default:
      log.warn('Unknown action type in appReducer', { action: (action as any).type });
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  actions: {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setSearchQuery: (query: string) => void;
    updateActivity: () => void;
    resetState: () => void;
    // Convenience methods
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setUser: useCallback((user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
      log.info('User state updated', { userId: user?.id, authenticated: !!user });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    addNotification: useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      log.info('Notification added', { type: notification.type, title: notification.title });
    }, []),

    removeNotification: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []),

    clearAllNotifications: useCallback(() => {
      dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    }, []),

    setTheme: useCallback((theme: 'light' | 'dark' | 'system') => {
      dispatch({ type: 'SET_THEME', payload: theme });
      localStorage.setItem('app-theme', theme);
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),

    setSearchQuery: useCallback((query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    }, []),

    updateActivity: useCallback(() => {
      dispatch({ type: 'UPDATE_ACTIVITY' });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
      log.info('App state reset');
    }, []),

    // Convenience methods for notifications
    showSuccess: useCallback((title: string, message = '') => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', title, message, autoClose: true }
      });
    }, []),

    showError: useCallback((title: string, message = '') => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', title, message, autoClose: false }
      });
    }, []),

    showWarning: useCallback((title: string, message = '') => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'warning', title, message, autoClose: true }
      });
    }, []),

    showInfo: useCallback((title: string, message = '') => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'info', title, message, autoClose: true }
      });
    }, []),
  };

  const contextValue: AppContextType = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selectors for specific state slices
export const useUser = () => {
  const { state } = useApp();
  return state.user;
};

export const useAuth = () => {
  const { state } = useApp();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading
  };
};

export const useNotifications = () => {
  const { state, actions } = useApp();
  return {
    notifications: state.notifications,
    addNotification: actions.addNotification,
    removeNotification: actions.removeNotification,
    clearAll: actions.clearAllNotifications,
    showSuccess: actions.showSuccess,
    showError: actions.showError,
    showWarning: actions.showWarning,
    showInfo: actions.showInfo
  };
};

export const useTheme = () => {
  const { state, actions } = useApp();
  return {
    theme: state.theme,
    setTheme: actions.setTheme
  };
};