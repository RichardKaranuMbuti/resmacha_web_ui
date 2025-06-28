// app/ClientProviders.tsx
'use client';

import { useAuth } from '@src/context/AuthProvider';
import { ScrapingProvider } from '@src/context/ScrapingContext';
import { MatchingProvider } from '@src/context/MatchingContext';

// Create a wrapper component that waits for auth
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render other providers if user is authenticated
  if (isAuthenticated) {
    return (
      <ScrapingProvider>
        <MatchingProvider>
          {children}
        </MatchingProvider>
      </ScrapingProvider>
    );
  }

  // For unauthenticated users, just render children (login/signup pages)
  return <>{children}</>;
}