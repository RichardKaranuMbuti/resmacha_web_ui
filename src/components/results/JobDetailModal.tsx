// src/components/results/JobDetailModal.tsx
import {
  X,
  Building,
  MapPin,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { JobMatch } from '@src/types/jobMatch';
import { getScoreTextColor } from '@src/utils/jobMatchHelpers';

interface JobDetailModalProps {
  job: JobMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailModal = ({ job, isOpen, onClose }: JobDetailModalProps) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{job.job_details.job_title}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreTextColor(job.match_score)}`}>
                  {job.match_score}% Match
                </div>
              </div>
              <div className="flex items-center text-gray-600 space-x-4">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {job.job_details.company_name}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.job_details.location}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Analysis */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              AI Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Match Score Justification</h4>
                <p className="text-gray-600">{job.score_justification}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Application Recommendation</h4>
                <div className="flex items-start space-x-3">
                  {job.should_apply ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <p className="text-gray-600">{job.judgment_justification}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Keywords */}
          {job.missing_keywords.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.missing_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Tips */}
          {job.improvement_tips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Improvement Tips
              </h3>
              <div className="space-y-2">
                {job.improvement_tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-blue-800 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" />
              Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.job_details.employment_type !== 'N/A' && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm text-purple-600 font-medium">Employment Type</span>
                  <p className="text-purple-800">{job.job_details.employment_type}</p>
                </div>
              )}
              {job.job_details.seniority_level !== 'N/A' && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm text-purple-600 font-medium">Seniority Level</span>
                  <p className="text-purple-800">{job.job_details.seniority_level}</p>
                </div>
              )}
              {job.job_details.job_function !== 'N/A' && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm text-purple-600 font-medium">Job Function</span>
                  <p className="text-purple-800">{job.job_details.job_function}</p>
                </div>
              )}
              {job.job_details.industries !== 'N/A' && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm text-purple-600 font-medium">Industry</span>
                  <p className="text-purple-800">{job.job_details.industries}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white rounded-b-3xl border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Analyzed on {new Date(job.date_processed).toLocaleDateString()}
            </div>
            <a
              href={job.job_details.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>View Job</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
