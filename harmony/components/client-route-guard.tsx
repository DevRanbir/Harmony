'use client';

import { useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ClientRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ClientRouteGuard({ 
  children, 
  requireAuth = false, 
  redirectTo = '/login' 
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If auth is required but user is not signed in, show nothing (redirect will happen)
  if (requireAuth && !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
