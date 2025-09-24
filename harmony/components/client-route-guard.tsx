'use client';

import { useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';

interface ClientRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  lightLoading?: boolean; // Add option for lighter loading state
}

export function ClientRouteGuard({ 
  children, 
  requireAuth = false, 
  redirectTo = '/login',
  lightLoading = false
}: ClientRouteGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    if (isLoaded && requireAuth && !isSignedIn) {
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, requireAuth, redirectTo, router]);

  // Timeout mechanism for Clerk auth loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoaded && !authTimeout) {
        console.warn('Clerk auth loading timeout reached');
        setAuthTimeout(true);
      }
    }, 15000); // 15 second timeout

    if (isLoaded) {
      clearTimeout(timeoutId);
      setAuthTimeout(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoaded, authTimeout]);

  // Show loading while auth is loading, unless timed out
  if (!isLoaded && !authTimeout) {
    if (lightLoading) {
      // Light loading state for pages that have their own loading.tsx
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      );
    }
    return <LoadingSkeleton />;
  }

  // If auth timed out, show timeout message
  if (authTimeout && !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">Authentication timeout</div>
          <div className="text-sm text-muted-foreground">
            Taking longer than expected. Please refresh the page.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If auth is required but user is not signed in, show nothing (redirect will happen)
  if (requireAuth && !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
