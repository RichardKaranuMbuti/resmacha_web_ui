// middleware.ts - Complete solution
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

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has expired (with 5 minute buffer for proactive refresh)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    // If we can't decode the token, consider it invalid/expired
    console.error('Token decode error:', error);
    return true;
  }
}

// Helper function to validate token format
function isValidTokenFormat(token: string): boolean {
  return token.split('.').length === 3;
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const refreshTokenCookie = request.cookies.get('refresh_token');
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware checking: ${pathname}`);
  
  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  let hasValidToken = false;
  
  if (tokenCookie?.value) {
    const token = tokenCookie.value;
    console.log(`🔐 Token found, validating...`);
    
    // Check if token format is valid and not expired
    if (isValidTokenFormat(token) && !isTokenExpired(token)) {
      hasValidToken = true;
      console.log(`✅ Token is valid`);
    } else {
      console.log(`❌ Token is invalid or expired`);
    }
  } else {
    console.log(`❌ No token found`);
  }
  
  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !hasValidToken) {
    console.log(`🚨 Redirecting to login - protected route without valid token`);
    
    // Clear invalid tokens
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid cookies
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    
    return response;
  }
  
  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && hasValidToken) {
    console.log(`🔄 Redirecting to dashboard - authenticated user on auth page`);
    
    // Check for redirect parameter
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    const dashboardUrl = new URL(redirectTo || '/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  console.log(`✅ Middleware passed: ${pathname}`);
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
