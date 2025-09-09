import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/(.*)/data(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/prices(.*)',
  '/api(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Skip Clerk health checks and internal routes
  if (req.nextUrl.pathname.includes('_clerk_catchall_check_') || 
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname === '/favicon.ico') {
    return;
  }
  
  // Allow all public routes without any auth check
  if (isPublicRoute(req)) {
    return;
  }
  
  // For protected routes, do minimal server-side check
  if (isProtectedRoute(req)) {
    try {
      auth.protect();
    } catch (error) {
      // If auth fails, redirect to login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(loginUrl);
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
