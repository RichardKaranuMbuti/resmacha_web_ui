// src/components/results/StartMatchingView.tsx
import { Award, Brain, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface StartMatchingViewProps {
  onStartMatching: () => void;
  onLoadResults: () => void;
  isMatching: boolean;
  canStartMatching?: boolean;
  processingStatus?: {
    status?: string;
    message?: string;
    total_ongoing_jobs?: number;
    ongoing_jobs?: Array<{
      job_id: string;
      processing_status: string;
      created_at: string;
    }>;
    has_ongoing_processing?: boolean;
  } | null;
  hasExistingResults?: boolean; // New prop to indicate if results exist
}

export const StartMatchingView = ({ 
  onStartMatching, 
  onLoadResults, 
  isMatching,
  canStartMatching = true,
  processingStatus,
  hasExistingResults = false
}: StartMatchingViewProps) => {
  // Show processing status message if there's an ongoing process
  const showProcessingWarning = !canStartMatching && processingStatus && processingStatus.status;

  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-8">
        <Award className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Ready to Find Your Perfect Matches?
      </h1>
      
      <p className="text-xl text-gray-600 mb-8">
        {hasExistingResults 
          ? "You have existing job matching results. Choose an option below."
          : "Our AI will analyze all discovered jobs and score them based on your profile"
        }
      </p>

      {/* Processing Warning */}
      {showProcessingWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center space-x-2 text-amber-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Processing in Progress</span>
          </div>
          <p className="text-sm text-amber-600">
            {processingStatus?.message || 'There is already a matching process running. Please wait for it to complete.'}
          </p>
          {processingStatus?.total_ongoing_jobs && (
            <p className="text-xs text-amber-600 mt-1">
              {processingStatus.total_ongoing_jobs} jobs being processed
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onStartMatching}
          disabled={isMatching || !canStartMatching}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
        >
          {isMatching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>AI is Matching...</span>
            </>
          ) : !canStartMatching ? (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span>Processing in Progress</span>
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
          onClick={onLoadResults}
          disabled={!hasExistingResults}
          className={`text-lg font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 ${
            hasExistingResults
              ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>View Existing Matches</span>
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        {!canStartMatching 
          ? "A matching process is already running. You can view existing results or wait for the current process to complete."
          : hasExistingResults
            ? "Already have matches? View them directly or run a new AI analysis"
            : "Start your first AI matching process to discover relevant job opportunities"
        }
      </p>
    </div>
  );
};