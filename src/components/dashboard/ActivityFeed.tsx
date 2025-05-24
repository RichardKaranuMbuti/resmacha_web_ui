// src/components/dashboard/ActivityFeed.tsx
'use client'
import { CheckCircle, Clock, Mail, Search, Star, Upload } from 'lucide-react';

// Define the status type more strictly
type ActivityStatus = 'success' | 'warning' | 'info';

interface ActivityItem {
  id: string;
  type: 'crawl' | 'match' | 'application' | 'update' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: ActivityStatus; // Use the strict type here
  metadata?: {
    score?: number;
    count?: number;
    company?: string;
  };
}

const mockActivityData: ActivityItem[] = [
  {
    id: '1',
    type: 'crawl',
    title: 'Job Search Completed',
    description: 'Found 89 new positions matching your criteria',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'success',
    metadata: { count: 89 }
  },
  {
    id: '2',
    type: 'match',
    title: 'High-Score Match Found',
    description: 'Senior Software Engineer at TechCorp Inc.',
    timestamp: '2024-01-20T10:25:00Z',
    status: 'success',
    metadata: { score: 92, company: 'TechCorp Inc.' }
  },
  {
    id: '3',
    type: 'notification',
    title: 'Application Response',
    description: 'StartupXYZ requested an interview',
    timestamp: '2024-01-19T15:45:00Z',
    status: 'success',
    metadata: { company: 'StartupXYZ' }
  },
  {
    id: '4',
    type: 'update',
    title: 'Resume Updated',
    description: 'New version uploaded successfully',
    timestamp: '2024-01-19T09:15:00Z',
    status: 'info'
  },
  {
    id: '5',
    type: 'application',
    title: 'Application Submitted',
    description: 'Applied to Full Stack Developer at DataTech',
    timestamp: '2024-01-18T16:20:00Z',
    status: 'info',
    metadata: { company: 'DataTech' }
  },
  {
    id: '6',
    type: 'match',
    title: 'Good Match Found',
    description: 'Software Architect at Enterprise Solutions',
    timestamp: '2024-01-18T14:10:00Z',
    status: 'info',
    metadata: { score: 85, company: 'Enterprise Solutions' }
  },
  {
    id: '7',
    type: 'crawl',
    title: 'Search Warning',
    description: 'Some job boards were temporarily unavailable',
    timestamp: '2024-01-17T11:30:00Z',
    status: 'warning'
  }
];

export default function ActivityFeed() {
  const getActivityIcon = (type: string, status?: ActivityStatus) => {
    const iconClass = `w-4 h-4 ${
      status === 'success' ? 'text-green-600' :
      status === 'warning' ? 'text-orange-600' :
      'text-blue-600'
    }`;

    switch (type) {
      case 'crawl':
        return <Search className={iconClass} />;
      case 'match':
        return <Star className={iconClass} />;
      case 'application':
        return <CheckCircle className={iconClass} />;
      case 'update':
        return <Upload className={iconClass} />;
      case 'notification':
        return <Mail className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  // Fix 1: Use strict typing and type assertion
  const getStatusBadge = (status?: ActivityStatus) => {
    if (!status) return null;
    
    const badgeClasses: Record<ActivityStatus, string> = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      info: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[status]}`}>
        {status}
      </span>
    );
  };

  // Alternative Fix 2: Using bracket notation with proper type checking
  const getStatusBadgeAlt = (status?: string) => {
    if (!status) return null;
    
    const badgeClasses: { [key: string]: string } = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      info: 'bg-blue-100 text-blue-800'
    };

    // Check if status exists in badgeClasses before using it
    if (!(status in badgeClasses)) return null;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[status]}`}>
        {status}
      </span>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Recent Activity
        </h2>
        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {mockActivityData.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type, activity.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h3>
                <div className="flex items-center gap-2">
                  {activity.metadata?.score && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activity.metadata.score >= 85 ? 'bg-green-100 text-green-700' :
                      activity.metadata.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.metadata.score}%
                    </span>
                  )}
                  {getStatusBadge(activity.status)}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
                
                {activity.metadata?.count && (
                  <span className="text-xs text-purple-600 font-medium">
                    +{activity.metadata.count} jobs
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-700">5</div>
            <div className="text-xs text-purple-600">This Week</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">23</div>
            <div className="text-xs text-green-600">New Matches</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">3</div>
            <div className="text-xs text-blue-600">Applications</div>
          </div>
        </div>
      </div>

      {/* Quick Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(['All', 'Matches', 'Applications', 'Updates'] as const).map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'All'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}