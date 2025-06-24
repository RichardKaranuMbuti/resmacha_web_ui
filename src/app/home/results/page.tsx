// src/app/home/results/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useJobMatching } from '@src/hooks/useJobMatching';
import { JobMatch } from '@src/types/jobMatch';
import { MatchingAnimation } from '@src/components/results/MatchingAnimation';
import { StartMatchingView } from '@src/components/results/StartMatchingView';
import { ProcessingView } from '@src/components/results/ProcessingView';
import { ResultsHeader } from '@src/components/results/ResultsHeader';
import { StatsCards } from '@src/components/results/StatsCards';
import { JobGrid } from '@src/components/results/JobGrid';
import { JobDetailModal } from '@src/components/results/JobDetailModal';
import { ErrorModal } from '@src/components/ui/ErrorModal';
import { MatchingCompletionModal } from '@src/components/results/MatchingCompletionModal';
import { useMatchingContext } from '@src/context/MatchingContext';

type ViewState = 'loading' | 'start' | 'processing' | 'results' | 'matching';

export default function ResultsPage() {
  const { 
    checkMatchingStatus, 
    showCompletionModal, 
    hideCompletionModal,
    hasUserInitiatedMatching,
    setUserInitiatedMatching,
    startPolling,
    stopPolling
  } = useMatchingContext();
  
  const {
    isMatching,
    hasStartedMatching,
    jobs,
    error,
    matchingStats,
    matchingStatus,
    canStartMatching,
    isProcessing,
    startMatching,
    loadResults,
    checkForExistingResults,
    resetError,
    clearResults
  } = useJobMatching();

  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize the page by checking matching status and existing results
  useEffect(() => {
    const initializePage = async () => {
      if (initialized) return;

      try {
        setViewState('loading');

        // First, check matching status
        await checkMatchingStatus();

        // Then check for existing results
        const resultsExist = await checkForExistingResults();
        setHasExistingResults(resultsExist);

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize page:', error);
        setViewState('start');
        setInitialized(true);
      }
    };

    initializePage();
  }, [initialized, checkMatchingStatus, checkForExistingResults]);

  // Start polling when processing begins
  useEffect(() => {
    if (isProcessing && hasUserInitiatedMatching) {
      startPolling();
    } else if (!isProcessing) {
      stopPolling();
    }
  }, [isProcessing, hasUserInitiatedMatching, startPolling, stopPolling]);

  // Update view state based on ACTUAL matching status from API
  useEffect(() => {
    if (!initialized) return;

    // Priority 1: If API says processing is happening, show processing view
    if (isProcessing) {
      setViewState('processing');
    } 
    // Priority 2: If user just started matching locally (brief animation)
    else if (isMatching && hasStartedMatching) {
      setViewState('matching');
    } 
    // Priority 3: If we have results to show
    else if (jobs.length > 0) {
      setViewState('results');
    } 
    // Priority 4: Default to start view
    else {
      setViewState('start');
    }
  }, [initialized, isProcessing, isMatching, hasStartedMatching, jobs.length]);

  const handleStartMatching = useCallback(async () => {
    try {
      resetError();
      // Mark that user initiated matching
      setUserInitiatedMatching(true);
      await startMatching();
      // State will be updated via useEffect based on isMatching state
    } catch (error) {
      console.error('Failed to start job matching:', error);
      setUserInitiatedMatching(false); // Reset on error
      setShowErrorModal(true);
    }
  }, [startMatching, resetError, setUserInitiatedMatching]);

  const handleLoadResults = useCallback(async () => {
    try {
      resetError();
      await loadResults();
      // State will be updated via useEffect based on jobs state
    } catch (error) {
      console.error('Failed to load job results:', error);
      setShowErrorModal(true);
    }
  }, [loadResults, resetError]);

  const handleStartNewMatching = useCallback(async () => {
    try {
      resetError();
      await clearResults();
      setHasExistingResults(false);
      setViewState('start');
    } catch (error) {
      console.error('Failed to clear results:', error);
      setShowErrorModal(true);
    }
  }, [clearResults, resetError]);

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
    resetError();
  }, [resetError]);

  const handleCompletionModalClose = useCallback(() => {
    hideCompletionModal();
    // Load results if user hasn't viewed them yet
    if (jobs.length === 0) {
      handleLoadResults();
    }
  }, [hideCompletionModal, handleLoadResults, jobs.length]);

  const renderContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Checking status...</p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <ProcessingView
            totalJobs={matchingStatus?.total_ongoing_jobs || 0}
            ongoingStatuses={matchingStatus?.ongoing_statuses || []}
            onViewResults={hasExistingResults ? handleLoadResults : undefined}
            showViewResults={hasExistingResults}
          />
        );

      case 'matching':
        return <MatchingAnimation matchingStats={matchingStats} />;

      case 'results':
        return (
          <div className="space-y-8">
            <ResultsHeader jobCount={jobs.length} />
            <StatsCards jobs={jobs} />
            <JobGrid jobs={jobs} onJobClick={handleJobClick} />
            
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleStartNewMatching}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                disabled={isProcessing || isMatching}
              >
                Start New Job Matching
              </button>
            </div>
          </div>
        );

      case 'start':
      default:
        return (
          <StartMatchingView
            onStartMatching={handleStartMatching}
            onLoadResults={handleLoadResults}
            isMatching={isMatching} // Only local matching state, not combined
            canStartMatching={canStartMatching}
            processingStatus={matchingStatus}
            hasExistingResults={hasExistingResults}
          />
        );
    }
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

      <MatchingCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCompletionModalClose}
      />
    </div>
  );
}