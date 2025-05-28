// src/components/results/ResultsHeader.tsx
import { CheckCircle } from 'lucide-react';

interface ResultsHeaderProps {
  jobCount: number;
}

export const ResultsHeader = ({ jobCount }: ResultsHeaderProps) => (
  <div className="text-center mb-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6">
      <CheckCircle className="w-8 h-8 text-white" />
    </div>
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      Your Job Matches Are Ready! 🎉
    </h1>
    <p className="text-xl text-gray-600">
      Found {jobCount} opportunities ranked by AI compatibility
    </p>
  </div>
);
