// src/hooks/useJobMatching.ts
'use client';

import { useState } from 'react';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { apiAxios } from '@src/config/axiosConfig';
import { JobMatch, MatchingStats } from '@src/types/jobMatch';
import { useMatchingContext } from '@src/context/MatchingContext';

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
    startPolling
  } = useMatchingContext();

  const startMatching = async () => {
    if (!canStartMatching) {
      const message = matchingStatus?.message || 'Cannot start matching: There is already an ongoing matching process';
      throw new Error(message);
    }

    setIsMatching(true);
    setHasStartedMatching(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.JOB_MATCH}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
      
      // Start polling for status updates
      startPolling();
      
      // Refresh the matching status after a brief delay
      setTimeout(() => {
        checkMatchingStatus();
      }, 1000);

    } catch (err) {
      setIsMatching(false);
      setHasStartedMatching(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  const checkForExistingResults = async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.JOB_MATCH_RESULT}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data: JobMatch[] = await response.json();
        return data && Array.isArray(data) && data.length > 0;
      }
      
      return false;
    } catch {
      console.log('No existing results found');
      return false;
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING.JOB_MATCH_RESULT}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No job matching results found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobMatch[] = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setJobs(data.sort((a, b) => b.match_score - a.match_score));
        setIsMatching(false);
      } else {
        throw new Error('No job matching results found');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load results';
      setError(errorMessage);
      throw err;
    }
  };

  const clearResults = async () => {
    try {
      setJobs([]);
      setIsMatching(false);
      setHasStartedMatching(false);
      setMatchingStats(null);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear results';
      setError(errorMessage);
      throw err;
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