// src/components/dashboard/DashboardHeader.tsx
'use client';
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronDown,
  Filter,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SortDesc,
  Star,
  User
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Notification {
  id: string;
  type: 'match' | 'application' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

interface DashboardHeaderProps {
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New High Match',
    message: 'Senior React Developer at TechCorp (95% match)',
    timestamp: '2024-01-20T10:30:00Z',
    isRead: false
  },
  {
    id: '2',
    type: 'application',
    title: 'Application Update',
    message: 'Your application to StartupXYZ moved to interview stage',
    timestamp: '2024-01-20T09:15:00Z',
    isRead: false
  },
  {
    id: '3',
    type: 'message',
    title: 'Message from Recruiter',
    message: 'Sarah from DataTech would like to connect',
    timestamp: '2024-01-19T16:45:00Z',
    isRead: true
  },
  {
    id: '4',
    type: 'system',
    title: 'Weekly Report Ready',
    message: 'Your job search analytics are available',
    timestamp: '2024-01-19T08:00:00Z',
    isRead: true
  }
];

export default function DashboardHeader({
  userName = "Sarah Johnson",
  userAvatar,
  userRole = "Software Engineer",
  onMenuToggle,
  onSearch,
  className = ""
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'match':
        return <Star className={`${iconClass} text-purple-600`} />;
      case 'application':
        return <Briefcase className={`${iconClass} text-blue-600`} />;
      case 'message':
        return <MessageSquare className={`${iconClass} text-green-600`} />;
      case 'system':
        return <Bell className={`${iconClass} text-gray-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Title & Breadcrumb */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {userName.split(' ')[0]}</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className={`
              relative flex items-center transition-all duration-200
              ${isSearchFocused ? 'transform scale-105' : ''}
            `}>
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg text-sm
                  transition-all duration-200 focus:outline-none
                  ${isSearchFocused 
                    ? 'border-purple-300 ring-2 ring-purple-100 bg-white shadow-sm' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }
                `}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3 text-gray-400 rotate-45" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Filter results"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Sort options"
            >
              <SortDesc className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-100 px-4 py-2">
                  <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500">{userRole}</p>
                </div>
                
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Briefcase className="w-4 h-4" />
                    <span>My Resume</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Interviews</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </form>
      </div>
    </header>
  );
}