// src/contexts/MatchingContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { apiAxios } from '@src/config/axiosConfig';

interface MatchingStatus {
  user_id: number;
  has_ongoing_processing: boolean;
  total_ongoing_jobs: number;
  status_breakdown: Record<string, number>;
  ongoing_statuses: string[];
  timestamp: string;
  status?: 'rejected' | 'completed';
  message?: string;
  total_jobs_analyzed?: number;
  total_jobs_queued?: number;
}

interface MatchingContextType {
  matchingStatus: MatchingStatus | null;
  isLoading: boolean;
  error: string | null;
  checkMatchingStatus: () => Promise<void>;
  canStartMatching: boolean;
  isProcessing: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  resetError: () => void;
  hasUserInitiatedMatching: boolean;
  setUserInitiatedMatching: (value: boolean) => void;
  showCompletionModal: boolean;
  hideCompletionModal: () => void;
}

const MatchingContext = createContext<MatchingContextType | undefined>(undefined);

interface MatchingProviderProps {
  children: React.ReactNode;
}

export const MatchingProvider: React.FC<MatchingProviderProps> = ({ children }) => {
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasUserInitiatedMatching, setHasUserInitiatedMatching] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [previousProcessingState, setPreviousProcessingState] = useState<boolean | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const hideCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
  }, []);

  const setUserInitiatedMatching = useCallback((value: boolean) => {
    setHasUserInitiatedMatching(value);
    // Store in sessionStorage to persist across page refreshes
    if (value) {
      sessionStorage.setItem('userInitiatedMatching', 'true');
    } else {
      sessionStorage.removeItem('userInitiatedMatching');
    }
  }, []);

  // Restore user initiated matching state on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('userInitiatedMatching');
    if (stored === 'true') {
      setHasUserInitiatedMatching(true);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      console.log('Stopping matching status polling...');
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const checkMatchingStatus = useCallback(async () => {
    // Don't show loading on subsequent checks during polling
    if (!pollingInterval) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.CHECK_USER_ONGOING_MATCHING}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check matching status: ${response.status}`);
      }

      const data: MatchingStatus = await response.json();
      
      // Detect completion: was processing, now not processing, and user had initiated matching
      const wasProcessing = previousProcessingState === true;
      const isNowNotProcessing = !data.has_ongoing_processing;
      const shouldShowCompletion = wasProcessing && isNowNotProcessing && hasUserInitiatedMatching;

      if (shouldShowCompletion) {
        console.log('Matching completed! Showing completion modal...');
        setShowCompletionModal(true);
        // Clear the user initiated flag since we've handled completion
        setUserInitiatedMatching(false);
      }

      setMatchingStatus(data);
      setPreviousProcessingState(data.has_ongoing_processing);

      // Auto-stop polling if processing is complete
      if (!data.has_ongoing_processing && pollingInterval) {
        console.log('Processing completed, stopping polling...');
        stopPolling();
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check matching status';
      setError(errorMsg);
      console.error('Error checking matching status:', err);
      
      // Stop polling on error to prevent spam
      if (pollingInterval) {
        stopPolling();
      }
    } finally {
      setIsLoading(false);
    }
  }, [pollingInterval, stopPolling, previousProcessingState, hasUserInitiatedMatching, setUserInitiatedMatching]);

  const startPolling = useCallback(() => {
    if (pollingInterval) return; // Already polling

    console.log('Starting matching status polling...');
    const interval = setInterval(() => {
      checkMatchingStatus();
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  }, [checkMatchingStatus, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Determine if user can start matching
  const canStartMatching = !matchingStatus?.has_ongoing_processing && 
                          matchingStatus?.status !== 'rejected';
  
  const isProcessing = matchingStatus?.has_ongoing_processing || false;

  const value: MatchingContextType = {
    matchingStatus,
    isLoading,
    error,
    checkMatchingStatus,
    canStartMatching,
    isProcessing,
    startPolling,
    stopPolling,
    resetError,
    hasUserInitiatedMatching,
    setUserInitiatedMatching,
    showCompletionModal,
    hideCompletionModal,
  };

  return (
    <MatchingContext.Provider value={value}>
      {children}
    </MatchingContext.Provider>
  );
};

export const useMatchingContext = (): MatchingContextType => {
  const context = useContext(MatchingContext);
  if (context === undefined) {
    throw new Error('useMatchingContext must be used within a MatchingProvider');
  }
  return context;
};