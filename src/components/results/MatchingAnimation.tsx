// src/components/results/MatchingAnimation.tsx
import { Brain, Sparkles } from 'lucide-react';
import { MatchingStats } from '@src/types/jobMatch';

interface MatchingAnimationProps {
  matchingStats: MatchingStats | null;
}

export const MatchingAnimation = ({ matchingStats }: MatchingAnimationProps) => (
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