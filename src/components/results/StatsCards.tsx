// src/components/results/StatsCards.tsx
import { Star, TrendingUp, Target } from 'lucide-react';
import { JobMatch } from '@src/types/jobMatch';

interface StatsCardsProps {
  jobs: JobMatch[];
}

export const StatsCards = ({ jobs }: StatsCardsProps) => {
  const excellentMatches = jobs.filter(j => j.match_score >= 80).length;
  const goodMatches = jobs.filter(j => j.match_score >= 60 && j.match_score < 80).length;
  const recommended = jobs.filter(j => j.should_apply).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-green-600">{excellentMatches}</p>
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
            <p className="text-3xl font-bold text-yellow-600">{goodMatches}</p>
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
            <p className="text-3xl font-bold text-blue-600">{recommended}</p>
            <p className="text-gray-600">Recommended</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};