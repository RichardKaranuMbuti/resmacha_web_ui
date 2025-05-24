// src/app/dashboard/page.tsx
import ActivityFeed from '@src/components/dashboard/ActivityFeed';
import ApplicationInsights from '@src/components/dashboard/ApplicationInsights';
import DashboardStats from '@src/components/dashboard/DashboardStats';
import QuickActions from '@src/components/dashboard/QuickActions';
import RecentJobMatches from '@src/components/dashboard/RecentJobMatches';
import ScoreDistribution from '@src/components/dashboard/ScoreDistribution';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Resmacha',
  description: 'Your AI-powered job search dashboard',
};

// Mock user data - replace with actual data fetching
const mockUserData = {
  name: 'Sarah Johnson',
  targetRole: 'Senior Software Engineer',
  location: 'San Francisco, CA',
  totalJobsAnalyzed: 847,
  highScoreMatches: 23,
  applicationsSubmitted: 12,
  responseRate: 33.3,
  averageMatchScore: 72.4,
  lastCrawlDate: '2024-01-20T10:30:00Z',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-lavender-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {mockUserData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Searching for {mockUserData.targetRole} positions in {mockUserData.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Last crawl: {new Date(mockUserData.lastCrawlDate).toLocaleDateString()}
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Run New Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <DashboardStats data={mockUserData} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <RecentJobMatches />
            <ScoreDistribution />
            <ApplicationInsights />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <QuickActions />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}