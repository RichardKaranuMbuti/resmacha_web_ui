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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={isSidebarOpen}
        onToggle={handleMenuToggle}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <DashboardHeader 
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
        />
        
        {/* Main Content */}
        <main className="flex-1 ">
          {children}
        </main>
      </div>
    </div>
  );
}
