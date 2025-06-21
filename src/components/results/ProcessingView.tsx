// src/components/results/ProcessingView.tsx
import { useState, useEffect } from 'react';
import { Bot, Zap, Sparkles, Target, CheckCircle2, Coffee } from 'lucide-react';

interface ProcessingViewProps {
  totalJobs: number;
  ongoingStatuses: string[];
  onViewResults?: () => void;
  showViewResults?: boolean;
}

const ProcessingMessages = [
  {
    icon: Bot,
    title: "AI Agents are on the hunt! 🎯",
    subtitle: "Scanning through thousands of opportunities to find your perfect matches",
  },
  {
    icon: Sparkles,
    title: "Magic is happening behind the scenes ✨",
    subtitle: "Our intelligent matching algorithm is analyzing job compatibility",
  },
  {
    icon: Target,
    title: "Precision targeting in progress 🔍",
    subtitle: "Matching your skills, experience, and preferences with top opportunities",
  },
  {
    icon: Zap,
    title: "Supercharging your job search ⚡",
    subtitle: "AI is working overtime to bring you the best career opportunities",
  },
  {
    icon: Coffee,
    title: "Grab a coffee, we&apos;ve got this! ☕",
    subtitle: "Our smart algorithms are curating personalized job recommendations",
  },
];

export const ProcessingView = ({ 
  totalJobs, 
  ongoingStatuses, 
  onViewResults, 
  showViewResults = false 
}: ProcessingViewProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate messages every 4 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % ProcessingMessages.length);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  // Simulate progress (this could be made more sophisticated based on actual processing data)
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 2 + 0.5; // Random increment between 0.5-2.5
        const newProgress = Math.min(prev + increment, 85); // Cap at 85% until completion
        return newProgress;
      });
    }, 2000);

    return () => clearInterval(progressInterval);
  }, []);

  const currentMessage = ProcessingMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-pulse">
          <IconComponent className="w-12 h-12 text-white" />
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-blue-200 rounded-full animate-spin opacity-30"></div>
          <div className="absolute w-40 h-40 border border-purple-200 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>

      {/* Dynamic Messages */}
      <div className="mb-8 min-h-[120px] flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 transition-all duration-500">
          {currentMessage.title}
        </h1>
        <p className="text-xl text-gray-600 transition-all duration-500">
          {currentMessage.subtitle}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {Math.round(progress)}% Complete
        </p>
      </div>

      {/* Processing Stats */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
            <div className="text-sm text-gray-600">Jobs Being Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{ongoingStatuses.length}</div>
            <div className="text-sm text-gray-600">Active Processes</div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">AI matching in progress...</span>
        </div>
        <div className="text-sm text-gray-500">
          Feel free to close this tab - we&apos;ll save your progress and you can check back anytime!
        </div>
      </div>

      {/* View Results Button (if available) */}
      {showViewResults && onViewResults && (
        <button
          onClick={onViewResults}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>View Your Matches</span>
        </button>
      )}

      {/* Helpful Tips */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-800 mb-3">💡 While you wait...</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Make sure your profile is complete for better matches</p>
          <p>• Check your email for match notifications</p>
          <p>• This process typically takes 2-5 minutes</p>
        </div>
      </div>
    </div>
  );
};