// src/app/dashboard/layout.tsx
'use client';
import DashboardHeader from '@src/components/dashboard/DashboardHeader';
import DashboardSidebar from '@src/components/dashboard/DashboardSidebar';
import { ReactNode, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (query: string) => {
    // Implement your search logic here
    console.log('Search query:', query);
    // You could dispatch to a global state, call an API, etc.
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <DashboardHeader 
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
        />
      </div>

      <div className="flex">
        {/* Sidebar - Hidden on mobile, controlled by state */}
        <div className={`lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <div className="hidden lg:block">
            <DashboardHeader 
              onMenuToggle={handleMenuToggle}
              onSearch={handleSearch}
            />
          </div>
          <main className="pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}