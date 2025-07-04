/**
 * Production-ready App component with comprehensive error boundaries
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthGuard from '@/components/guards/AuthGuard';
import Layout from '@/components/Layout';
import { log } from '@/utils/logger';

// Import your existing pages
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import AdminDashboard from '@/pages/AdminDashboard';
import ManageNews from '@/pages/ManageNews';
import ManageRemedies from '@/pages/ManageRemedies';
import ManageExperts from '@/pages/ManageExperts';
import ManageUsers from '@/pages/ManageUsers';
import AuthPage from '@/pages/AuthPage';
import ProfileRoutes from '@/pages/ProfileRoutes';
import NotFoundPage from '@/pages/NotFoundPage';
// ... other imports

// Configure React Query for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && 
            error?.status !== 408 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      onError: (error) => {
        log.error('Query error', error as Error);
      }
    },
    mutations: {
      retry: false,
      onError: (error) => {
        log.error('Mutation error', error as Error);
      }
    }
  }
});

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  log.error('Unhandled error', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  log.error('Unhandled promise rejection', new Error(event.reason), {
    reason: event.reason
  });
});

function App() {
  log.info('App component mounted');

  return (
    <ErrorBoundary level="page" showRetry={true}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          <Router>
            <Layout>
              <ErrorBoundary level="section">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected routes */}
                  <Route path="/profile/*" element={
                    <AuthGuard requireAuth={true}>
                      <UserProfile />
                    </AuthGuard>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <Admin />
                    </AuthGuard>
                  } />
                  <Route path="/admin/dashboard" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <AdminDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/admin/news" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <ManageNews />
                    </AuthGuard>
                  } />
                  <Route path="/admin/remedies" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <ManageRemedies />
                    </AuthGuard>
                  } />
                  <Route path="/admin/experts" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <ManageExperts />
                    </AuthGuard>
                  } />
                  <Route path="/admin/users" element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                      <ManageUsers />
                    </AuthGuard>
                  } />
                  
                  {/* Catch all - 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Layout>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
