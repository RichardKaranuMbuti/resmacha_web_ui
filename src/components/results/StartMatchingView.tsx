// src/components/results/StartMatchingView.tsx
import { Award, Brain, Zap, CheckCircle } from 'lucide-react';

interface StartMatchingViewProps {
  onStartMatching: () => void;
  onLoadResults: () => void;
  isMatching: boolean;
}

export const StartMatchingView = ({ 
  onStartMatching, 
  onLoadResults, 
  isMatching 
}: StartMatchingViewProps) => (
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
        onClick={onStartMatching}
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
        onClick={onLoadResults}
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
);