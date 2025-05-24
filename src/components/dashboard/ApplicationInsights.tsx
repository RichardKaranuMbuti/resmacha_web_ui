// src/components/dashboard/ApplicationInsights.tsx
'use client';
import { AlertCircle, Award, CheckCircle2, TrendingUp, Users } from 'lucide-react';

const topMissingSkills = [
  { skill: 'GraphQL', frequency: 67, trend: 'up' },
  { skill: 'Docker', frequency: 54, trend: 'up' },
  { skill: 'Kubernetes', frequency: 45, trend: 'stable' },
  { skill: 'AWS Lambda', frequency: 38, trend: 'up' },
  { skill: 'TypeScript', frequency: 32, trend: 'down' },
  { skill: 'Next.js', frequency: 29, trend: 'up' }
];

const commonImprovements = [
  {
    category: 'Technical Skills',
    suggestions: [
      'Add cloud architecture experience to your resume',
      'Highlight containerization and orchestration skills',
      'Showcase API design and microservices experience'
    ],
    impact: 'High',
    color: 'red'
  },
  {
    category: 'Leadership',
    suggestions: [
      'Quantify team management experience with specific numbers',
      'Add examples of cross-functional collaboration',
      'Include mentoring and coaching achievements'
    ],
    impact: 'Medium',
    color: 'yellow'
  },
  {
    category: 'Project Impact',
    suggestions: [
      'Add measurable business outcomes to project descriptions',
      'Include performance improvements and optimization results',
      'Highlight cost savings and efficiency gains'
    ],
    impact: 'High',
    color: 'red'
  }
];

const industryInsights = [
  {
    industry: 'Tech Startups',
    avgScore: 78.3,
    jobCount: 234,
    topRequirement: 'Full-stack development',
    growth: '+12%'
  },
  {
    industry: 'Enterprise',
    avgScore: 71.2,
    jobCount: 156,
    topRequirement: 'System architecture',
    growth: '+8%'
  },
  {
    industry: 'Fintech',
    avgScore: 82.1,
    jobCount: 89,
    topRequirement: 'Security expertise',
    growth: '+23%'
  },
  {
    industry: 'Healthcare',
    avgScore: 69.8,
    jobCount: 67,
    topRequirement: 'Compliance knowledge',
    growth: '+15%'
  }
];

export default function ApplicationInsights() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Application Insights</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missing Skills Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Most Requested Missing Skills
          </h3>
          <div className="space-y-3">
            {topMissingSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{skill.skill}</span>
                    {getTrendIcon(skill.trend)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    {skill.frequency} jobs
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(skill.frequency / 70) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> Adding the top 3 missing skills could increase your match scores by an average of 15-20 points.
            </p>
          </div>
        </div>

        {/* Industry Insights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Industry Performance
          </h3>
          <div className="space-y-3">
            {industryInsights.map((industry, index) => (
              <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{industry.industry}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      industry.avgScore >= 80 ? 'bg-green-100 text-green-700' :
                      industry.avgScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {industry.avgScore}% avg
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {industry.growth}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {industry.jobCount} positions analyzed
                </div>
                <div className="text-xs text-gray-500">
                  Top requirement: <span className="font-medium">{industry.topRequirement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Recommendations */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Priority Improvements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commonImprovements.map((improvement, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{improvement.category}</h4>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getImpactColor(improvement.impact)}`}>
                  {improvement.impact} Impact
                </span>
              </div>
              <ul className="space-y-2">
                {improvement.suggestions.map((suggestion, suggestionIndex) => (
                  <li key={suggestionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-1 text-xs">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">23</div>
            <div className="text-xs text-purple-600">Skills to Add</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">+15%</div>
            <div className="text-xs text-green-600">Potential Score Boost</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">89</div>
            <div className="text-xs text-blue-600">Jobs Need Updates</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">4.2</div>
            <div className="text-xs text-orange-600">Avg Missing Skills</div>
          </div>
        </div>
      </div>
    </div>
  );
}