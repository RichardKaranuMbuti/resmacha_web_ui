//src/components/scraping/ScrapingStatusGuard.tsx
'use client';

import { useScrapingContext } from '@src/context/ScrapingContext';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Target,
  Zap,
  BarChart3,
  Search
} from 'lucide-react';
import { ReactNode } from 'react';

interface ScrapingStatusGuardProps {
  children: ReactNode;
}

const ActiveJobStatus = () => {
  const { currentJob, checkScrapingStatus, clearCurrentJob} = useScrapingContext();

  if (!currentJob) return null;

  const getStatusConfig = () => {
    switch (currentJob.status) {
      case 'pending':
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: "🎯 AI Hunters Preparing...",
          subtitle: "Getting ready to scour the web for your perfect job",
          bgColor: "from-yellow-400 to-orange-500",
          textColor: "text-yellow-600",
          bgClass: "bg-yellow-50"
        };
      case 'processing':
        return {
          icon: <Bot className="w-8 h-8 text-blue-500 animate-bounce" />,
          title: "🤖 AI Job Hunters in Action!",
          subtitle: "Our intelligent agents are scanning LinkedIn for opportunities",
          bgColor: "from-blue-500 to-purple-600",
          textColor: "text-blue-600",
          bgClass: "bg-blue-50"
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          title: `🎉 Mission Complete! Found ${currentJob.total_jobs_found} jobs`,
          subtitle: "Your AI agents have successfully completed the job hunt",
          bgColor: "from-green-500 to-emerald-600",
          textColor: "text-green-600",
          bgClass: "bg-green-50"
        };
      case 'failed':
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: "❌ Hunt Interrupted",
          subtitle: currentJob.error_message || "Something went wrong during the search",
          bgColor: "from-red-500 to-red-600",
          textColor: "text-red-600",
          bgClass: "bg-red-50"
        };
      default:
        return {
          icon: <Bot className="w-8 h-8 text-gray-500" />,
          title: "Status Unknown",
          subtitle: "Checking job status...",
          bgColor: "from-gray-400 to-gray-500",
          textColor: "text-gray-600",
          bgClass: "bg-gray-50"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className={`${config.bgClass} rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100`}>
          <div className="text-center">
            {/* Animated Icon */}
            <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${config.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
              {config.icon}
              {currentJob.status === 'processing' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {config.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8">
              {config.subtitle}
            </p>

            {/* Job Details */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-semibold text-gray-900">{currentJob.job_title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{currentJob.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Animation for Processing */}
            {currentJob.status === 'processing' && (
              <div className="mb-8">
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-sm text-gray-500 animate-pulse">
                  Estimated completion: 2-3 minutes
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => {
                if (currentJob.status === 'completed') {
                  // Clear the job and refresh data to show dashboard
                  clearCurrentJob();
                  
                } else {
                  checkScrapingStatus();
                }
              }}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                currentJob.status === 'completed' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>
                {currentJob.status === 'completed' ? 'View Results' : 'Refresh Status'}
              </span>
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrapingSummaryDashboard = ({ children }: { children: ReactNode }) => {
  const { summary, recentScraps } = useScrapingContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your AI Job Hunt Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your job hunting progress and deploy new AI agents when ready
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Hunts</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_scraping_jobs}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jobs Found</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_jobs_scraped}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.success_rate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.completed_jobs}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentScraps.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Job Hunts</h2>
            <div className="space-y-4">
              {recentScraps.map((scrap) => (
                <div key={scrap.scraping_job_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      scrap.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {scrap.status === 'completed' 
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <Clock className="w-5 h-5 text-yellow-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{scrap.job_title}</p>
                      <p className="text-sm text-gray-500">{scrap.location} • {scrap.total_jobs_found} jobs found</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(scrap.created_at).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-medium ${
                      scrap.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {scrap.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deploy New Hunters Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-center text-white mb-8">
          <Zap className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Ready to Deploy New AI Hunters?</h2>
          <p className="text-blue-100 mb-6">
            Start a new job search and let our intelligent agents find the perfect opportunities for you
          </p>
        </div>

        {/* Render the Apply Page */}
        {children}
      </div>
    </div>
  );
};

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Issue</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Bot className="w-8 h-8 text-white animate-bounce" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Your Dashboard...</h2>
      <div className="flex justify-center space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  </div>
);

export default function ScrapingStatusGuard({ children }: ScrapingStatusGuardProps) {
  const { isLoading, error, hasActiveJob, refreshData } = useScrapingContext();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refreshData} />;
  }

  if (hasActiveJob) {
    return <ActiveJobStatus />;
  }

  return <ScrapingSummaryDashboard>{children}</ScrapingSummaryDashboard>;
}