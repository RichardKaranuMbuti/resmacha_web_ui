// src/hooks/useJobMatching.ts
'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '@src/constants/api';
import { matchingAxios } from '@src/config/axiosConfig';
import { JobMatch, MatchingStats } from '@src/types/jobMatch';
import { useMatchingContext } from '@src/context/MatchingContext';
import { AxiosError } from 'axios';

export const useJobMatching = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [error, setError] = useState('');
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);

  const {
    matchingStatus,
    checkMatchingStatus,
    canStartMatching,
    isProcessing,
    startPolling,
    setUserInitiatedMatching
  } = useMatchingContext();

  const startMatching = async () => {
    if (!canStartMatching) {
      const message = matchingStatus?.message || 'Cannot start matching: There is already an ongoing matching process';
      throw new Error(message);
    }

    setIsMatching(true);
    setHasStartedMatching(true);
    setError('');

    // Set the user initiated flag in the context
    setUserInitiatedMatching(true);

    try {
      console.log('🚀 Starting job matching...');
      
      const response = await matchingAxios.post(API_ENDPOINTS.MATCHING.JOB_MATCH, {});

      const data = response.data;
      
      // Handle different response types
      if (data.status === 'rejected') {
        throw new Error(data.message || 'Matching request was rejected');
      }

      if (data.status === 'completed') {
        // Immediate completion case
        setIsMatching(false);
        if (data.message) {
          throw new Error(data.message);
        }
        return;
      }

      // Set stats for jobs being processed
      setMatchingStats({
        total_analyzed: data.total_jobs_analyzed || 0,
        total_queued: data.total_jobs_queued || 0
      });
      
      console.log('✅ Job matching started successfully');
      
      // Start polling for status updates
      startPolling();
      
      // Refresh the matching status after a brief delay
      setTimeout(() => {
        checkMatchingStatus();
      }, 1000);

    } catch (err) {
      setIsMatching(false);
      setHasStartedMatching(false);
      // Clear the user initiated flag on error
      setUserInitiatedMatching(false);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You may not have permission to start matching.';
        } else if (err.response?.status === 409) {
          errorMessage = 'A matching process is already in progress.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('❌ Failed to start job matching:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const checkForExistingResults = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking for existing results...');
      
      const response = await matchingAxios.get<JobMatch[]>(
        API_ENDPOINTS.MATCHING.JOB_MATCH_RESULT
      );

      const data = response.data;
      const hasResults = data && Array.isArray(data) && data.length > 0;
      
      console.log(`📊 Existing results check: ${hasResults ? 'Found' : 'None'}`);
      return hasResults;
      
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        console.log('ℹ️ No existing results found (404)');
        return false;
      }
      
      console.warn('⚠️ Error checking for existing results:', err);
      return false;
    }
  };

  const loadResults = async () => {
    try {
      console.log('📥 Loading job matching results...');
      
      const response = await matchingAxios.get<JobMatch[]>(
        API_ENDPOINTS.MATCHING.JOB_MATCH_RESULT
      );

      const data = response.data;
      
      if (data && Array.isArray(data) && data.length > 0) {
        const sortedJobs = data.sort((a, b) => b.match_score - a.match_score);
        setJobs(sortedJobs);
        setIsMatching(false);
        console.log(`✅ Loaded ${sortedJobs.length} job matching results`);
      } else {
        throw new Error('No job matching results found');
      }

    } catch (err) {
      let errorMessage = 'Failed to load results';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          errorMessage = 'No job matching results found';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('❌ Failed to load results:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearResults = async () => {
    try {
      console.log('🧹 Clearing job matching results...');
      
      setJobs([]);
      setIsMatching(false);
      setHasStartedMatching(false);
      setMatchingStats(null);
      setError('');
      
      console.log('✅ Results cleared successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear results';
      console.error('❌ Failed to clear results:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetError = () => {
    setError('');
  };

  return {
    isMatching, // Local matching state (only true when user just started matching)
    hasStartedMatching,
    jobs,
    error,
    matchingStats,
    matchingStatus,
    canStartMatching,
    isProcessing, // This comes from API - the real source of truth
    startMatching,
    loadResults,
    clearResults,
    checkForExistingResults,
    resetError,
    checkMatchingStatus
  };
};