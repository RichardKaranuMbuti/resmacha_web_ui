// src/components/dashboard/QuickActions.tsx
'use client';
import { Download, Filter, RefreshCw, Search, Settings, Upload } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Start New Search',
      description: 'Search for jobs with updated criteria',
      icon: Search,
      color: 'purple',
      action: () => console.log('Start new search')
    },
    {
      title: 'Update Resume',
      description: 'Upload latest version of your resume',
      icon: Upload,
      color: 'blue',
      action: () => console.log('Update resume')
    },
    {
      title: 'Export Matches',
      description: 'Download your job matches as CSV',
      icon: Download,
      color: 'green',
      action: () => console.log('Export matches')
    },
    {
      title: 'Adjust Filters',
      description: 'Modify your search preferences',
      icon: Filter,
      color: 'orange',
      action: () => console.log('Adjust filters')
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="w-full p-4 text-left border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${getColorClasses(action.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings Panel */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Search Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-500">Get notified of new high-score matches</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto-Apply</p>
              <p className="text-xs text-gray-500">Automatically apply to 90+ score matches</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
              <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
            </button>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Minimum Score Threshold
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="50" 
                max="95" 
                defaultValue="75" 
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 min-w-[3rem]">75%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Only show matches above this score</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Last Crawl Status
        </h3>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">Completed Successfully</span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <p>• Found 89 new positions</p>
            <p>• Analyzed 847 total jobs</p>
            <p>• Generated 23 high-score matches</p>
            <p>• Runtime: 4m 32s</p>
          </div>
        </div>
        
        <button className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Run New Crawl
        </button>
      </div>
    </div>
  );
}