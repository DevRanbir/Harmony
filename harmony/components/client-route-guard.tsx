'use client';

import { useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (isLoaded && requireAuth && !isSignedIn) {
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, requireAuth, redirectTo, router]);

  // Show loading while auth is loading
  if (!isLoaded) {
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

  // If auth is required but user is not signed in, show nothing (redirect will happen)
  if (requireAuth && !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
