"use client";

import { useAuthContext } from '@/contexts/auth-context';
import { useUser } from '@clerk/nextjs';

/**
 * Custom hook that provides optimized auth state management
 * Uses localStorage for fast auth checks and periodic validation
 */
export function useOptimizedAuth() {
  const { isAuthenticated, isLoading, authTimeout, refreshAuth, retryAuth } = useAuthContext();
  const { user } = useUser();

  return {
    isAuthenticated,
    isLoading,
    authTimeout,
    user,
    refreshAuth,
    retryAuth,
    // Utility functions
    isSignedIn: isAuthenticated && !!user,
    isSignedOut: !isLoading && !isAuthenticated,
    hasTimeout: authTimeout,
  };
}
