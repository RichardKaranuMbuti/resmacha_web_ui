// src/components/results/JobGrid.tsx
import { AlertCircle } from 'lucide-react';
import { JobMatch } from '@src/types/jobMatch';
import { JobCard } from './JobCard';

interface JobGridProps {
  jobs: JobMatch[];
  onJobClick: (job: JobMatch) => void;
}

export const JobGrid = ({ jobs, onJobClick }: JobGridProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard 
          key={job.job_id} 
          job={job} 
          onClick={onJobClick} 
        />
      ))}
    </div>
  );
};