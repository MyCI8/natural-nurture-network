import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better code splitting
export const LazyHome = lazy(() => import('@/pages/Home'));
export const LazyExperts = lazy(() => import('@/pages/Experts'));
export const LazyRemedies = lazy(() => import('@/pages/Remedies'));
export const LazyNews = lazy(() => import('@/pages/News'));
export const LazyExplore = lazy(() => import('@/pages/Explore'));
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyManageExperts = lazy(() => import('@/pages/ManageExperts'));
export const LazyManageRemedies = lazy(() => import('@/pages/ManageRemedies'));
export const LazyManageNews = lazy(() => import('@/pages/ManageNews'));

// Loading fallback component
export const PageLoader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

// Wrapper component with Suspense
export const LazyComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);