// src/components/dashboard/DashboardStats.tsx
'use client'
import { CheckCircle, Clock, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';

interface DashboardStatsProps {
  data: {
    totalJobsAnalyzed: number;
    highScoreMatches: number;
    applicationsSubmitted: number;
    responseRate: number;
    averageMatchScore: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Jobs Analyzed',
      value: data.totalJobsAnalyzed.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: Target,
      color: 'purple',
      description: 'Total positions crawled and analyzed'
    },
    {
      title: 'High-Score Matches',
      value: data.highScoreMatches.toString(),
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: Zap,
      color: 'green',
      description: 'Matches scoring 85+ points'
    },
    {
      title: 'Applications Sent',
      value: data.applicationsSubmitted.toString(),
      change: '+15.1%',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'blue',
      description: 'Applications submitted this week'
    },
    {
      title: 'Response Rate',
      value: `${data.responseRate}%`,
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'orange',
      description: 'Employer response rate'
    },
    {
      title: 'Avg Match Score',
      value: data.averageMatchScore.toFixed(1),
      change: '+5.3%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Average AI compatibility score'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      orange: 'bg-orange-100 text-orange-700',
      indigo: 'bg-indigo-100 text-indigo-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === 'increase';
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                isIncrease ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncrease ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-700">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}