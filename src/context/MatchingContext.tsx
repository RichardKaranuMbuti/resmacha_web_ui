// src/contexts/MatchingContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@src/constants/api';
import { matchingAxios } from '@src/config/axiosConfig';
import { storageUtils } from '@src/utils/storage';
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
      console.log('🔑 Making request to:', API_ENDPOINTS.MATCHING.CHECK_USER_ONGOING_MATCHING);
      
      // Ensure we have a valid token before making the request
      const token = storageUtils.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the configured axios instance instead of manual token handling
      const response = await matchingAxios.get<MatchingStatus>(
        API_ENDPOINTS.MATCHING.CHECK_USER_ONGOING_MATCHING
      );

      const data = response.data;
      
      // Validate response data
      if (!data || typeof data.has_ongoing_processing !== 'boolean') {
        console.warn('⚠️ Invalid matching status response:', data);
        throw new Error('Invalid response from matching service');
      }
      
      // Store the current state before updating
      const currentProcessingState = data.has_ongoing_processing;
      
      // Detect completion: was processing, now not processing, and user had initiated matching
      const wasProcessing = previousProcessingState === true;
      const isNowNotProcessing = !currentProcessingState;
      const shouldShowCompletion = wasProcessing && isNowNotProcessing && hasUserInitiatedMatching;

      console.log('🔍 Completion detection:', {
        wasProcessing,
        isNowNotProcessing,
        hasUserInitiatedMatching,
        shouldShowCompletion,
        previousProcessingState,
        currentProcessingState
      });

      if (shouldShowCompletion) {
        console.log('✅ Matching completed! Showing completion modal...');
        setShowCompletionModal(true);
        // Clear the user initiated flag since we've handled completion
        setUserInitiatedMatching(false);
        // Stop polling since we're done
        stopPolling();
      }

      // Update the state
      setMatchingStatus(data);
      setPreviousProcessingState(currentProcessingState);

      // Auto-stop polling if processing is complete and no user initiated matching
      if (!currentProcessingState && pollingInterval && !hasUserInitiatedMatching) {
        console.log('⏹️ Processing completed (no user initiation), stopping polling...');
        stopPolling();
      }

      console.log('✅ Matching status updated:', {
        has_ongoing_processing: currentProcessingState,
        total_ongoing_jobs: data.total_ongoing_jobs,
        user_id: data.user_id,
        previousState: previousProcessingState
      });

    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      let errorMsg = 'Failed to check matching status';
      
      // Safely check for response and status with proper type guards
      const responseStatus = error.response?.status;
      
      console.error('❌ Matching status check failed:', {
        status: responseStatus,
        url: error.config?.url,
        message: error.message,
        response: error.response?.data
      });
      
      if (responseStatus === 401) {
        errorMsg = 'Authentication failed. Please log in again.';
        console.error('🚨 Authentication error in matching context:', err);
        
        // The axios interceptor will handle this automatically
        // but we still log it for debugging
      } else if (responseStatus === 403) {
        errorMsg = 'Access denied. You may not have permission to access matching services.';
      } else if (responseStatus === 404) {
        errorMsg = 'Matching service endpoint not found. Please check the API configuration.';
      } else if (responseStatus && responseStatus >= 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      console.error('❌ Error checking matching status:', {
        status: responseStatus,
        message: errorMsg,
        error: err
      });
      
      // Stop polling on persistent errors to prevent spam
      if (pollingInterval && (responseStatus === 401 || responseStatus === 403 || responseStatus === 404)) {
        console.log('⏹️ Stopping polling due to persistent error');
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

    // Ensure we have authentication before starting polling
    const token = storageUtils.getAccessToken();
    if (!token) {
      console.error('❌ Cannot start polling: No authentication token');
      setError('Authentication required. Please log in again.');
      return;
    }

    console.log('▶️ Starting matching status polling...');
    
    // Check immediately
    checkMatchingStatus();
    
    // Then set up interval
    const interval = setInterval(() => {
      // Double-check token is still valid before each poll
      const currentToken = storageUtils.getAccessToken();
      if (!currentToken) {
        console.log('⏹️ No token available, stopping polling');
        clearInterval(interval);
        setPollingInterval(null);
        setError('Session expired. Please log in again.');
        return;
      }
      
      checkMatchingStatus();
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  }, [checkMatchingStatus, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        console.log('🧹 Cleaning up matching polling interval on unmount');
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Listen for auth logout events to clean up state
  useEffect(() => {
    const handleLogout = () => {
      console.log('🚨 Auth logout detected in matching context, cleaning up...');
      stopPolling();
      setMatchingStatus(null);
      setError(null);
      setShowCompletionModal(false);
      setHasUserInitiatedMatching(false);
      setPreviousProcessingState(null);
      
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userInitiatedMatching');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      
      return () => {
        window.removeEventListener('auth:logout', handleLogout);
      };
    }
  }, [stopPolling]);

  // Check token validity on mount and refresh if needed
  useEffect(() => {
    const initializeMatching = async () => {
      const token = storageUtils.getAccessToken();
      if (!token) {
        console.log('ℹ️ No token available on matching context mount');
        setError('Please log in to access matching services');
        return;
      }
      
      console.log('🏁 MatchingProvider initializing with valid token...');
      // Optionally check status on mount
      // checkMatchingStatus();
    };

    initializeMatching();
  }, []);

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