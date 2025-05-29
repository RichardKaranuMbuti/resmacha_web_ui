// src/components/dashboard/RecentJobMatches.tsx
'use client'
import { Building2, Clock, ExternalLink, MapPin, Star, ThumbsUp } from 'lucide-react';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  shouldApply: boolean;
  scoreJustification: string;
  judgmentJustification: string;
  missingKeywords: string[];
  improvementTips: string[];
  postedDate: string;
  salary?: string;
}

const mockJobMatches: JobMatch[] = [
  {
    id: '1',
    title: 'Senior Software Engineer - Frontend',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    matchScore: 92,
    shouldApply: true,
    scoreJustification: 'Excellent match with 8+ years React experience and strong TypeScript skills. Leadership experience aligns perfectly with team lead requirements.',
    judgmentJustification: 'Strong recommendation to apply. Your experience with scaling React applications and team leadership makes you an ideal candidate.',
    missingKeywords: ['GraphQL', 'Next.js'],
    improvementTips: ['Consider adding GraphQL experience to your resume', 'Highlight your Next.js projects more prominently'],
    postedDate: '2024-01-19T08:00:00Z',
    salary: '$140k - $180k'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    matchScore: 78,
    shouldApply: true,
    scoreJustification: 'Good technical match with full-stack experience. Startup environment aligns with your adaptability and quick learning abilities.',
    judgmentJustification: 'Recommended to apply. The role offers growth opportunities and matches your preference for dynamic environments.',
    missingKeywords: ['Docker', 'Kubernetes', 'AWS Lambda'],
    improvementTips: ['Add container orchestration experience', 'Showcase cloud architecture projects'],
    postedDate: '2024-01-18T14:30:00Z',
    salary: '$110k - $140k'
  },
  {
    id: '3',
    title: 'Software Architect',
    company: 'Enterprise Solutions Ltd.',
    location: 'New York, NY',
    matchScore: 85,
    shouldApply: true,
    scoreJustification: 'Strong architectural thinking and system design experience. Leadership background fits the senior role requirements.',
    judgmentJustification: 'Worth applying. Your system design experience and team leadership make you a strong candidate for this architectural role.',
    missingKeywords: ['Microservices', 'Event-driven architecture'],
    improvementTips: ['Emphasize your microservices experience', 'Add examples of event-driven systems you\'ve designed'],
    postedDate: '2024-01-17T11:15:00Z',
    salary: '$160k - $200k'
  }
];

export default function RecentJobMatches() {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-100';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Job Matches</h2>
        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          View All Matches →
        </button>
      </div>

      <div className="space-y-4">
        {mockJobMatches.map((job) => (
          <div key={job.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(job.matchScore)}`}>
                    <Star className="w-3 h-3" />
                    {job.matchScore}% Match
                  </div>
                  {job.shouldApply && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <ThumbsUp className="w-3 h-3" />
                      Apply
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                  {job.salary && (
                    <div className="font-medium text-gray-700">
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>
              
              <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                View Details
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">AI Analysis</h4>
                <p className="text-sm text-gray-700">{job.scoreJustification}</p>
              </div>
              
              {job.missingKeywords.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.missingKeywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Improvement Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {job.improvementTips.slice(0, 2).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}