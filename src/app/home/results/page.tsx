'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { apiAxios } from '@src/config/axiosConfig';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Building, 
  DollarSign, 
  Star, 
  ExternalLink, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Target,
  Zap,
  Award
} from 'lucide-react';

interface JobMatch {
  job_id: string;
  match_score: number;
  should_apply: boolean;
  score_justification: string;
  judgment_justification: string;
  missing_keywords: string[];
  improvement_tips: string[];
  date_processed: string;
  job_details: {
    job_id: string;
    job_title: string;
    company_name: string;
    location: string;
    job_url: string;
    seniority_level: string;
    employment_type: string;
    job_function: string;
    industries: string;
    applicants: string;
    date_posted: string;
    date_scraped: string;
    is_analysed: boolean;
  };
}

interface MatchResponse {
  user_id: string;
  total_jobs_analyzed: number;
  total_jobs_queued: number;
  status: string;
  message: string;
  analyzed_jobs: JobMatch[];
}

interface JobDetailModalProps {
  job: JobMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

const ErrorModal = ({ isOpen, onClose, error }: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Error Occurred</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const JobDetailModal = ({ job, isOpen, onClose }: JobDetailModalProps) => {
  if (!isOpen || !job) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{job.job_details.job_title}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(job.match_score)}`}>
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

export default function ResultsPage() {
  const [isMatching, setIsMatching] = useState(false);
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [matchingStats, setMatchingStats] = useState<{
    total_analyzed: number;
    total_queued: number;
  } | null>(null);

  const startMatching = async () => {
    setIsMatching(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.JOB_MATCH}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatchingStats({
        total_analyzed: data.total_jobs_analyzed,
        total_queued: data.total_jobs_queued
      });
      setHasStartedMatching(true);
      
      // Simulate processing time then load results
      setTimeout(() => {
        setIsMatching(false);
        loadResults();
      }, 4000);

    } catch (err) {
      setIsMatching(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShowErrorModal(true);
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.JOB_MATCH_RESULT}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobMatch[] = await response.json();
      setJobs(data.sort((a, b) => b.match_score - a.match_score));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
      setShowErrorModal(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const openJobModal = (job: JobMatch) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const MatchingAnimation = () => (
    <div className="text-center py-16">
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <Brain className="w-12 h-12 text-white animate-bounce" />
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">AI is analyzing your matches! 🧠</h3>
        <div className="space-y-2 text-lg">
          <p className="text-gray-600 animate-pulse">Evaluating job requirements...</p>
          <p className="text-gray-600 animate-pulse delay-500">Scoring compatibility...</p>
          <p className="text-gray-600 animate-pulse delay-1000">Preparing recommendations...</p>
        </div>
        {matchingStats && (
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
            <p className="text-blue-800 font-medium">
              Processing {matchingStats.total_queued} jobs for analysis
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {!hasStartedMatching && !jobs.length ? (
          <div className="max-w-3xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-8">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Find Your Perfect Matches?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Our AI will analyze all discovered jobs and score them based on your profile
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={startMatching}
                disabled={isMatching}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
              >
                {isMatching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI is Matching...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Start AI Matching</span>
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="text-gray-400 text-sm font-medium">OR</div>
              
              <button
                onClick={loadResults}
                className="bg-white border-2 border-gray-300 text-gray-700 text-lg font-semibold py-4 px-8 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 flex items-center space-x-3"
              >
                <CheckCircle className="w-5 h-5" />
                <span>View Existing Matches</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Already have matches? View them directly or run a new AI analysis
            </p>
          </div>
        ) : isMatching ? (
          <MatchingAnimation />
        ) : (
          <div>
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Job Matches Are Ready! 🎉
              </h1>
              <p className="text-xl text-gray-600">
                Found {jobs.length} opportunities ranked by AI compatibility
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{jobs.filter(j => j.match_score >= 80).length}</p>
                    <p className="text-gray-600">Excellent Matches</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{jobs.filter(j => j.match_score >= 60 && j.match_score < 80).length}</p>
                    <p className="text-gray-600">Good Matches</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{jobs.filter(j => j.should_apply).length}</p>
                    <p className="text-gray-600">Recommended</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => openJobModal(job)}
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
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal 
        job={selectedJob}
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        error={error} 
      />
    </div>
  );
}