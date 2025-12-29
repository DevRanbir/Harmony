"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  authTimeout: boolean;
  refreshAuth: () => void;
  retryAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('harmony_auth_state');
      return stored ? JSON.parse(stored).isAuthenticated : false;
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Check interval (5 minutes)
  const CHECK_INTERVAL = 5 * 60 * 1000;
  // Debounce interval for rapid state changes (1 second)
  const DEBOUNCE_INTERVAL = 1000;
  // Auth timeout (15 seconds for initial load, 10 seconds for subsequent checks)
  const AUTH_TIMEOUT = 15000;
  const SUBSEQUENT_AUTH_TIMEOUT = 10000;

  const updateAuthState = useCallback((authenticated: boolean, userData: any = null) => {
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    
    // Debounce localStorage updates to prevent excessive writes
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const authData = {
          isAuthenticated: authenticated,
          userId: userData?.id || null,
          lastCheck: Date.now(),
        };
        localStorage.setItem('harmony_auth_state', JSON.stringify(authData));
      }
      setLastCheck(Date.now());
    }, DEBOUNCE_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, []);

  const refreshAuth = useCallback(() => {
    if (isLoaded) {
      updateAuthState(!!isSignedIn && !!userId, user);
    }
  }, [isLoaded, isSignedIn, userId, user, updateAuthState]);

  const retryAuth = useCallback(() => {
    setAuthTimeout(false);
    setIsLoading(true);
    // Force a re-check of auth state
    refreshAuth();
  }, [refreshAuth]);

  // Initial auth check when Clerk loads
  useEffect(() => {
    if (isLoaded) {
      updateAuthState(!!isSignedIn && !!userId, user);
    }
  }, [isLoaded, isSignedIn, userId, user, updateAuthState]);

  // Timeout mechanism for initial auth loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !isLoaded && !authTimeout) {
        console.warn('Auth loading timeout reached, forcing completion');
        setAuthTimeout(true);
        setIsLoading(false);
        // Try to get auth state from localStorage as fallback
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('harmony_auth_state');
          if (stored) {
            const { isAuthenticated: storedAuth } = JSON.parse(stored);
            setIsAuthenticated(storedAuth);
          }
        }
      }
    }, AUTH_TIMEOUT);

    // Clear timeout if auth loads successfully
    if (isLoaded) {
      clearTimeout(timeoutId);
      setAuthTimeout(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoaded, isLoading, authTimeout]);

  // Listen for auth state changes more aggressively during SSO flow
  useEffect(() => {
    if (isLoaded) {
      // Check auth state immediately when any auth-related value changes
      const currentAuthState = !!isSignedIn && !!userId;
      if (currentAuthState !== isAuthenticated) {
        updateAuthState(currentAuthState, user);
      }
    }
  }, [isLoaded, isSignedIn, userId, user, isAuthenticated, updateAuthState]);

  // Periodic auth state validation
  useEffect(() => {
    const checkAuthPeriodically = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheck;
      
      // Only check if it's been more than CHECK_INTERVAL since last check
      if (timeSinceLastCheck >= CHECK_INTERVAL) {
        refreshAuth();
      }
    };

    // Set up periodic check
    const interval = setInterval(checkAuthPeriodically, CHECK_INTERVAL);
    
    // Check on window focus (user returns to tab)
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheck;
      
      // Check if it's been more than 1 minute since last check
      if (timeSinceLastCheck >= 60000) {
        refreshAuth();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [lastCheck, refreshAuth]);

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'harmony_auth_state' && e.newValue) {
        const newState = JSON.parse(e.newValue);
        setIsAuthenticated(newState.isAuthenticated);
        setLastCheck(newState.lastCheck);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading: isLoading || !isLoaded,
    authTimeout,
    refreshAuth,
    retryAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
