// src/components/results/JobCard.tsx
import { 
  Building, 
  MapPin, 
  CheckCircle, 
  X, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { JobMatch } from '@src/types/jobMatch';
import { getScoreColor } from '@src/utils/jobMatchHelpers';

interface JobCardProps {
  job: JobMatch;
  onClick: (job: JobMatch) => void;
}

export const JobCard = ({ job, onClick }: JobCardProps) => (
  <div
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
    onClick={() => onClick(job)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {job.job_details.job_title}
        </h3>
        <div className="flex items-center text-gray-600 space-x-4 mb-3">
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-1" />
            <span className="text-sm">{job.job_details.company_name}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{job.job_details.location}</span>
          </div>
        </div>
      </div>
      <div className="ml-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getScoreColor(job.match_score)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
          {job.match_score}%
        </div>
      </div>
    </div>

    {/* AI Recommendation */}
    <div className="mb-4">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        job.should_apply 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {job.should_apply ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            AI Recommends Apply
          </>
        ) : (
          <>
            <X className="w-4 h-4 mr-1" />
            Not Recommended
          </>
        )}
      </div>
    </div>

    {/* Score Justification Preview */}
    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
      {job.score_justification}
    </p>

    {/* Missing Keywords */}
    {job.missing_keywords.length > 0 && (
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Missing Keywords:</p>
        <div className="flex flex-wrap gap-1">
          {job.missing_keywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
            >
              {keyword}
            </span>
          ))}
          {job.missing_keywords.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{job.missing_keywords.length - 3} more
            </span>
          )}
        </div>
      </div>
    )}

    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="flex items-center text-gray-500 text-xs">
        <Clock className="w-3 h-3 mr-1" />
        {new Date(job.date_processed).toLocaleDateString()}
      </div>
      <div className="flex items-center text-blue-600 text-sm font-medium">
        <span>View Details</span>
        <ExternalLink className="w-4 h-4 ml-1" />
      </div>
    </div>
  </div>
);