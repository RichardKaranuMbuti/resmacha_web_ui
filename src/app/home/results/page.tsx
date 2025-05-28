// src/app/home/results/page.tsx
'use client';

import { useState } from 'react';
import { useJobMatching } from '@src/hooks/useJobMatching';
import { JobMatch } from '@src/types/jobMatch';
import { MatchingAnimation } from '@src/components/results/MatchingAnimation';
import { StartMatchingView } from '@src/components/results/StartMatchingView';
import { ResultsHeader } from '@src/components/results/ResultsHeader';
import { StatsCards } from '@src/components/results/StatsCards';
import { JobGrid } from '@src/components/results/JobGrid';
import { JobDetailModal } from '@src/components/results/JobDetailModal';
import { ErrorModal } from '@src/components/ui/ErrorModal';

export default function ResultsPage() {
  const {
    isMatching,
    hasStartedMatching,
    jobs,
    error,
    matchingStats,
    startMatching,
    loadResults,
    setError
  } = useJobMatching();

  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleStartMatching = async () => {
    try {
      await startMatching();
    } catch (err) {
      setShowErrorModal(true);
    }
  };

  const handleLoadResults = async () => {
    try {
      await loadResults();
    } catch (err) {
      setShowErrorModal(true);
    }
  };

  const handleJobClick = (job: JobMatch) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {!hasStartedMatching && !jobs.length ? (
          <StartMatchingView
            onStartMatching={handleStartMatching}
            onLoadResults={handleLoadResults}
            isMatching={isMatching}
          />
        ) : isMatching ? (
          <MatchingAnimation matchingStats={matchingStats} />
        ) : (
          <div>
            <ResultsHeader jobCount={jobs.length} />
            <StatsCards jobs={jobs} />
            <JobGrid jobs={jobs} onJobClick={handleJobClick} />
          </div>
        )}
      </div>

      <JobDetailModal 
        job={selectedJob}
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
      />

      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={handleCloseErrorModal} 
        error={error} 
      />
    </div>
  );
}