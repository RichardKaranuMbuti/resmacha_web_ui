// src/app/home/results/page.tsx
'use client';

import { useState, useCallback } from 'react';
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

  const handleStartMatching = useCallback(async () => {
    try {
      await startMatching();
    } catch (error) {
      console.error('Failed to start job matching:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while starting job matching';
      setError(errorMessage);
      setShowErrorModal(true);
    }
  }, [startMatching, setError]);

  const handleLoadResults = useCallback(async () => {
    try {
      await loadResults();
    } catch (error) {
      console.error('Failed to load job results:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while loading results';
      setError(errorMessage);
      setShowErrorModal(true);
    }
  }, [loadResults, setError]);

  const handleJobClick = useCallback((job: JobMatch) => {
    setSelectedJob(job);
    setShowJobModal(true);
  }, []);

  const handleCloseJobModal = useCallback(() => {
    setShowJobModal(false);
    setSelectedJob(null);
  }, []);

  const handleCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setError('');
  }, [setError]);

  const renderContent = () => {
    if (!hasStartedMatching && !jobs.length) {
      return (
        <StartMatchingView
          onStartMatching={handleStartMatching}
          onLoadResults={handleLoadResults}
          isMatching={isMatching}
        />
      );
    }

    if (isMatching) {
      return <MatchingAnimation matchingStats={matchingStats} />;
    }

    return (
      <div className="space-y-8">
        <ResultsHeader jobCount={jobs.length} />
        <StatsCards jobs={jobs} />
        <JobGrid jobs={jobs} onJobClick={handleJobClick} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>

      <JobDetailModal 
        job={selectedJob}
        isOpen={showJobModal}
        onClose={handleCloseJobModal}
      />

      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={handleCloseErrorModal} 
        error={error} 
      />
    </div>
  );
}