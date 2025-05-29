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
      {/* Fixed Sidebar */}
      <DashboardSidebar 
        isOpen={isSidebarOpen}
        onToggle={handleMenuToggle}
      />

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        lg:ml-64
      `}>
        {/* Header - also needs to account for sidebar */}
        <DashboardHeader 
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
        />
        
        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}