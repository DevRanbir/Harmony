import { NextRequest, NextResponse } from 'next/server';

// This catches Clerk's internal health check requests and returns OK
// to reduce 404 errors in development logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path?.join('/') || '';
  
  // Handle Clerk health checks
  if (path.includes('_clerk_catchall_check_')) {
    return new NextResponse('OK', { status: 200 });
  }
  
  // Handle SSO callback redirects
  if (path.includes('sso-callback')) {
    // Redirect to the SSO callback page
    const url = new URL('/login/sso-callback', request.url);
    // Preserve query parameters
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }
  
  // For other requests, return 404
  return new NextResponse('Not Found', { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path?.join('/') || '';
  
  // Handle Clerk health checks
  if (path.includes('_clerk_catchall_check_')) {
    return new NextResponse('OK', { status: 200 });
  }
  
  // For other requests, return 404
  return new NextResponse('Not Found', { status: 404 });
}
