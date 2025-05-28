// src/app/home/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Home, Search, BarChart3 } from 'lucide-react';

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const pathname = usePathname();

  const isApplyPage = pathname?.includes('/apply');
  const isResultsPage = pathname?.includes('/results');

  const getPageTitle = () => {
    if (isApplyPage) return 'Job Application';
    if (isResultsPage) return 'Job Matches';
    return 'Home';
  };

  const getBackLink = () => {
    if (isApplyPage) return '/home';
    if (isResultsPage) return '/home/apply';
    return '/dashboard';
  };

  const getBackText = () => {
    if (isApplyPage) return 'Back to Home';
    if (isResultsPage) return 'Back to Apply';
    return 'Back to Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={getBackLink()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">{getBackText()}</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
            </div>

            {/* Navigation Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                href="/home"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isApplyPage && !isResultsPage
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link 
                href="/home/apply"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isApplyPage
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                Apply
              </Link>
              <Link 
                href="/home/results"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isResultsPage
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Results
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}