// src/components/dashboard/ScoreDistribution.tsx
'use client';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const scoreDistributionData = [
  { range: '0-20', count: 45, percentage: 5.3 },
  { range: '21-40', count: 123, percentage: 14.5 },
  { range: '41-60', count: 234, percentage: 27.6 },
  { range: '61-80', count: 287, percentage: 33.9 },
  { range: '81-100', count: 158, percentage: 18.7 }
];

const applicationRecommendationData = [
  { name: 'Should Apply', value: 234, color: '#10B981' },
  { name: 'Consider', value: 156, color: '#F59E0B' },
  { name: 'Skip', value: 457, color: '#EF4444' }
];

const monthlyTrendData = [
  { month: 'Sep', avgScore: 68.2, jobsAnalyzed: 156 },
  { month: 'Oct', avgScore: 71.5, jobsAnalyzed: 203 },
  { month: 'Nov', avgScore: 69.8, jobsAnalyzed: 278 },
  { month: 'Dec', avgScore: 72.4, jobsAnalyzed: 210 },
  { month: 'Jan', avgScore: 74.1, jobsAnalyzed: 289 }
];

export default function ScoreDistribution() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Match Score Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} jobs (${scoreDistributionData.find(d => d.count === value)?.percentage}%)`,
                    'Count'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                  name="Jobs"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-700">18.7%</p>
              <p className="text-xs text-purple-600">High Match (81-100)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-700">33.9%</p>
              <p className="text-xs text-blue-600">Good Match (61-80)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-700">47.4%</p>
              <p className="text-xs text-gray-600">Low Match (0-60)</p>
            </div>
          </div>
        </div>

        {/* Application Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationRecommendationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {applicationRecommendationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} jobs`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {applicationRecommendationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.value} jobs ({((item.value / applicationRecommendationData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Match Score Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                domain={[60, 80]}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name === 'avgScore' ? `${value}% avg score` : `${value} jobs analyzed`,
                  name === 'avgScore' ? 'Average Score' : 'Jobs Analyzed'
                ]}
              />
              <Bar 
                dataKey="avgScore" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                name="avgScore"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Average Match Score by Month</span>
          </div>
        </div>
      </div>
    </div>
  );
}