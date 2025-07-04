import { lazy } from 'react';

// Code splitting utilities for bundle optimization
export const LazyComponents = {
  // Admin components (loaded only when needed)
  AdminDashboard: lazy(() => import('@/pages/AdminDashboard')),
  ManageRemedies: lazy(() => import('@/pages/ManageRemedies')),
  ManageExperts: lazy(() => import('@/pages/ManageExperts')),
  ManageNews: lazy(() => import('@/pages/ManageNews')),
  ManageUsers: lazy(() => import('@/pages/ManageUsers')),
  
  // Profile components
  UserProfile: lazy(() => import('@/pages/UserProfile')),
  
  // Heavy content components
  VideoFeed: lazy(() => import('@/pages/VideoFeed')),
  ExpertProfile: lazy(() => import('@/pages/ExpertProfile')),
  
  // Settings components
  ProfileSettings: lazy(() => import('@/pages/settings/Profile')),
  SecuritySettings: lazy(() => import('@/pages/settings/Security')),
  NotificationSettings: lazy(() => import('@/pages/settings/Notifications')),
  PrivacySettings: lazy(() => import('@/pages/settings/Privacy')),
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload commonly accessed routes
  setTimeout(() => {
    import('@/pages/Remedies');
    import('@/pages/Experts');
    import('@/pages/News');
  }, 2000);
};

// Service worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('New content is available. Refresh to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};