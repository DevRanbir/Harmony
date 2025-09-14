// Middleware disabled - using client-side route protection instead
// This prevents conflicts with Clerk authentication flow

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware is disabled - just pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
