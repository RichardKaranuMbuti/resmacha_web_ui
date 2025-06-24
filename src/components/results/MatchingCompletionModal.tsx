// src/components/results/MatchingCompletionModal.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, CheckCircle2, X, ArrowRight } from 'lucide-react';

interface MatchingCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchingCompletionModal = ({ isOpen, onClose }: MatchingCompletionModalProps) => {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isOpen) return null;

  const handleViewResults = () => {
    setIsAnimating(true);
    // Add a small delay for animation before navigation
    setTimeout(() => {
      router.push('/home/results');
      onClose();
    }, 300);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Animated Icons */}
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
              <Target className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-500 animate-bounce" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Mission Accomplished!
          </h2>
          
          {/* Description */}
          <div className="space-y-3 mb-8">
            <p className="text-lg text-gray-700 font-medium">
              Our AI agents have successfully scoured the job universe and found your perfect matches!
            </p>
            <p className="text-sm text-gray-600">
              Your personalized job recommendations are ready for review.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewResults}
              disabled={isAnimating}
              className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 ${
                isAnimating 
                  ? 'opacity-75 cursor-wait transform scale-95' 
                  : 'hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-lg'
              }`}
            >
              {isAnimating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading Results...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>View My Matches</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Close
            </button>
          </div>

          {/* Fun fact */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium">
              💡 Pro tip: Your matches are saved and you can access them anytime from the results page!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};