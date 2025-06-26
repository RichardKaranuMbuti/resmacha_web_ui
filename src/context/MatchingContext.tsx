// src/contexts/MatchingContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@src/constants/api';
import { matchingAxios } from '@src/config/axiosConfig';
import { AxiosError } from 'axios';

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
    if (typeof window !== 'undefined') {
      if (value) {
        sessionStorage.setItem('userInitiatedMatching', 'true');
      } else {
        sessionStorage.removeItem('userInitiatedMatching');
      }
    }
  }, []);

  // Restore user initiated matching state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('userInitiatedMatching');
      if (stored === 'true') {
        setHasUserInitiatedMatching(true);
      }
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      console.log('🔄 Stopping matching status polling...');
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
      console.log('🔍 Checking matching status...');
      
      const response = await matchingAxios.get<MatchingStatus>(
        API_ENDPOINTS.MATCHING.CHECK_USER_ONGOING_MATCHING
      );

      const data = response.data;
      
      // Detect completion: was processing, now not processing, and user had initiated matching
      const wasProcessing = previousProcessingState === true;
      const isNowNotProcessing = !data.has_ongoing_processing;
      const shouldShowCompletion = wasProcessing && isNowNotProcessing && hasUserInitiatedMatching;

      if (shouldShowCompletion) {
        console.log('✅ Matching completed! Showing completion modal...');
        setShowCompletionModal(true);
        // Clear the user initiated flag since we've handled completion
        setUserInitiatedMatching(false);
      }

      setMatchingStatus(data);
      setPreviousProcessingState(data.has_ongoing_processing);

      // Auto-stop polling if processing is complete
      if (!data.has_ongoing_processing && pollingInterval) {
        console.log('⏹️ Processing completed, stopping polling...');
        stopPolling();
      }

      console.log('✅ Matching status updated:', {
        has_ongoing_processing: data.has_ongoing_processing,
        total_ongoing_jobs: data.total_ongoing_jobs
      });

    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMsg = error.response?.data?.message || error.message || 'Failed to check matching status';
      setError(errorMsg);
      console.error('❌ Error checking matching status:', err);
      
      // Stop polling on error to prevent spam
      if (pollingInterval) {
        console.log('⏹️ Stopping polling due to error');
        stopPolling();
      }
    } finally {
      setIsLoading(false);
    }
  }, [pollingInterval, stopPolling, previousProcessingState, hasUserInitiatedMatching, setUserInitiatedMatching]);

  const startPolling = useCallback(() => {
    if (pollingInterval) {
      console.log('ℹ️ Polling already active, skipping...');
      return; // Already polling
    }

    console.log('▶️ Starting matching status polling...');
    
    // Check immediately
    checkMatchingStatus();
    
    // Then set up interval
    const interval = setInterval(() => {
      checkMatchingStatus();
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  }, [checkMatchingStatus, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        console.log('🧹 Cleaning up polling interval on unmount');
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