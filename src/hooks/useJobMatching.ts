// src/hooks/useJobMatching.ts
'use client';

import { useState } from 'react';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { apiAxios } from '@src/config/axiosConfig';
import { JobMatch, MatchingStats } from '@src/types/jobMatch';

export const useJobMatching = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [error, setError] = useState('');
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);

  const startMatching = async () => {
    setIsMatching(true);
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
      setMatchingStats({
        total_analyzed: data.total_jobs_analyzed,
        total_queued: data.total_jobs_queued
      });
      setHasStartedMatching(true);
      
      // Simulate processing time then load results
      setTimeout(() => {
        setIsMatching(false);
        loadResults();
      }, 4000);

    } catch (err) {
      setIsMatching(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobMatch[] = await response.json();
      setJobs(data.sort((a, b) => b.match_score - a.match_score));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
      throw err;
    }
  };

  return {
    isMatching,
    hasStartedMatching,
    jobs,
    error,
    matchingStats,
    startMatching,
    loadResults,
    setError
  };
};
