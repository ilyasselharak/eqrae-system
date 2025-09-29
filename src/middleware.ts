import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route requires authentication
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // For protected routes, we'll let the client-side handle the redirect
    // since we can't access localStorage in middleware
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ]
};