// src/components/dashboard/DashboardSidebar.tsx
'use client';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Search,
  Settings,
  Star,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  id: string;
  label: string;
   icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  badgeColor?: 'purple' | 'green' | 'blue' | 'red';
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function DashboardSidebar({ 
  isOpen = true, 
  onToggle,
  className = "" 
}: DashboardSidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      href: '/dashboard' 
    },
    { 
      id: 'job-search', 
      label: 'Job Search', 
      icon: Search, 
      href: '/home' 
    },
    { 
      id: 'matches', 
      label: 'My Matches', 
      icon: Star, 
      href: '/home/results', 
      badge: '23',
      badgeColor: 'purple'
    },
    { 
      id: 'resumes', 
      label: 'My Resumes', 
      icon: Star, 
      href: '/resumes', 
      badge: '23',
      badgeColor: 'purple'
    },
    { 
      id: 'crawlers', 
      label: 'Deploy Crawlers', 
      icon: FileText, 
      href: '/home/apply',
      badge: '5',
      badgeColor: 'blue'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      href: '/dashboard/analytics' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      href: '/dashboard/notifications', 
      badge: '3',
      badgeColor: 'red'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      href: '/dashboard/settings' 
    }
  ];

  const getBadgeClasses = (color: string = 'purple') => {
    const colors = {
      purple: 'bg-purple-600 text-white',
      green: 'bg-green-600 text-white',
      blue: 'bg-blue-600 text-white',
      red: 'bg-red-600 text-white'
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

    
  const router = useRouter();

  const handleNavClick = (itemId: string, href: string) => {
    setActiveItem(itemId);
    router.push(href);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Resmacha</span>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* User Profile - Fixed */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div 
              className={`
                flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                ${userMenuOpen ? 'bg-gray-50' : 'hover:bg-gray-50'}
              `}
              onClick={handleUserMenuToggle}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Software Engineer</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="mt-2 py-2 bg-gray-50 rounded-lg">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Briefcase className="w-4 h-4" />
                  <span>My Resume</span>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <nav className="px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg 
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 shadow-sm border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-purple-600' : ''
                  }`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      inline-flex items-center justify-center px-2 py-1 text-xs font-bold 
                      leading-none rounded-full min-w-[20px] h-5 transition-all
                      ${getBadgeClasses(item.badgeColor)}
                      ${isActive ? 'shadow-sm' : ''}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            </nav>

            {/* Quick Stats */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-purple-900">This Week</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-700">New matches</span>
                    <span className="font-semibold text-purple-900 bg-white px-2 py-1 rounded-md shadow-sm">23</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-700">Applications</span>
                    <span className="font-semibold text-purple-900 bg-white px-2 py-1 rounded-md shadow-sm">5</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-700">Responses</span>
                    <span className="font-semibold text-purple-900 bg-white px-2 py-1 rounded-md shadow-sm">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="px-6 py-4 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}