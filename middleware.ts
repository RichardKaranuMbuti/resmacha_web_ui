// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/jobs',
  '/applications',
  '/settings',
  '/ai-assistant'
];

// Public routes that authenticated users shouldn't access
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return user to their intended destination
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/jobs/:path*',
    '/applications/:path*',
    '/settings/:path*',
    '/ai-assistant/:path*',
    // Auth routes
    '/login',
    '/signup'
  ],
};