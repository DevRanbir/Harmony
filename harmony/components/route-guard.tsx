"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context';

interface RouteGuardProps {
  children: React.ReactNode;
  protectedRoutes?: string[];
}

export function RouteGuard({ children, protectedRoutes = ['/dashboard', '/admin'] }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => {
      if (route.endsWith('*')) {
        return pathname.startsWith(route.slice(0, -1));
      }
      return pathname === route || pathname.startsWith(route + '/');
    });

    // Redirect to login if accessing protected route while not authenticated
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = `/login?redirect_url=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, pathname, router, protectedRoutes]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
