/**
 * Authentication guard component for protecting routes and components
 */

import { useQuery } from '@tanstack/react-query';
import { checkIsAdmin } from '@/utils/securityUtils';
import { log } from '@/utils/logger';
import { Shield, LogIn } from 'lucide-react';
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

interface User {
  id: string;
  email?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallback,
  redirectTo = '/auth'
}) => {
  const navigate = useNavigate();

  // Get current user
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          log.error('Auth session error', error);
          throw error;
        }
        return session?.user || null;
      } catch (error) {
        log.error('Failed to get user session', error as Error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check admin status if required
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id || !requireAdmin) {return false;}
      
      try {
        return await checkIsAdmin();
      } catch (error) {
        log.error('Failed to check admin status', error as Error);
        return false;
      }
    },
    enabled: !!user?.id && requireAdmin,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleSignIn = () => {
    navigate(redirectTo);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Show loading state
  if (userLoading || (requireAdmin && adminLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (userError) {
    log.error('Authentication error in AuthGuard', userError as Error);
    
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="text-muted-foreground">
            There was a problem verifying your authentication. Please try signing in again.
          </p>
          <Button onClick={handleSignIn} className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    log.info('Unauthorized access attempt', { requireAuth, requireAdmin });
    
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Sign In Required</h2>
          <p className="text-muted-foreground">
            You need to be signed in to access this content.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSignIn} className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin) {
    log.warn('Unauthorized admin access attempt', { userId: user?.id, isAdmin });
    
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <Shield className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this admin area.
          </p>
          <Button variant="outline" onClick={handleGoHome}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default AuthGuard;