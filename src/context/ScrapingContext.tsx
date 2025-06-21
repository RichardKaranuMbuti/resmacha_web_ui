//src/context/ScrapingContext.tsx
'use client';

import { apiAxios } from '@src/config/axiosConfig';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ScrapingJob {
  scraping_job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  job_title: string;
  location: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total_jobs_found: number;
  error_message?: string;
}

interface RecentScrap {
  scraping_job_id: string;
  job_title: string;
  location: string;
  source: string;
  status: string;
  total_jobs_found: number;
  created_at: string;
  completed_at?: string;
  has_results: boolean;
}

interface ScrapingSummary {
  total_scraping_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  pending_jobs: number;
  total_jobs_scraped: number;
  success_rate: number;
  most_recent_activity?: {
    job_id: string;
    job_title: string;
    status: string;
    created_at: string;
  };
}

interface ScrapingContextType {
  currentJob: ScrapingJob | null;
  recentScraps: RecentScrap[];
  summary: ScrapingSummary | null;
  isLoading: boolean;
  error: string | null;
  hasActiveJob: boolean;
  checkScrapingStatus: () => Promise<void>;
  initiateScraping: (jobTitle: string, location: string) => Promise<string>;
  clearCurrentJob: () => void;
  refreshData: () => Promise<void>;
}

const ScrapingContext = createContext<ScrapingContextType | undefined>(undefined);

const STORAGE_KEY = 'scraping_job_id';

// Helper function to get auth token
const getAuthToken = () => {
  const authHeader = apiAxios.defaults.headers.common['Authorization'];
  if (typeof authHeader === 'string') {
    return authHeader.replace('Bearer ', '');
  }
  return null;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export function ScrapingProvider({ children }: { children: ReactNode }) {
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);
  const [recentScraps, setRecentScraps] = useState<RecentScrap[]>([]);
  const [summary, setSummary] = useState<ScrapingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasActiveJob = currentJob?.status === 'pending' || currentJob?.status === 'processing';

  const checkScrapingStatus = useCallback(async () => {
    const storedJobId = localStorage.getItem(STORAGE_KEY);
    if (!storedJobId) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.SCRAPE_STATUS}/${storedJobId}`
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentJob(data);
        
        // If job is completed or failed, keep it visible for user to see results
        // Don't auto-clear immediately - let user interact with it
        if (data.status === 'completed' || data.status === 'failed') {
          // Stop polling by not setting up new intervals
          // The job will be cleared when user clicks "View Results" or manually cleared
        }
      } else if (response.status === 404) {
        // Job not found, clear stored ID
        localStorage.removeItem(STORAGE_KEY);
        setCurrentJob(null);
      } else {
        throw new Error(`Failed to check status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error checking scraping status:', err);
      setError('Failed to check job status. Please try refreshing.');
      // Only clear on specific errors, not network issues
      if (err instanceof Error && err.message.includes('404')) {
        localStorage.removeItem(STORAGE_KEY);
        setCurrentJob(null);
      }
    }
  }, []);

  const fetchRecentScraps = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.RECENT_SCRAPS}`
      );

      if (response.ok) {
        const data = await response.json();
        setRecentScraps(data.data?.scraps || []);
      } else {
        console.error('Failed to fetch recent scraps:', response.status);
      }
    } catch (err) {
      console.error('Error fetching recent scraps:', err);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.SCRAP_SUMMARY}`
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
      } else {
        console.error('Failed to fetch summary:', response.status);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        checkScrapingStatus(),
        fetchRecentScraps(),
        fetchSummary()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scraping data';
      setError(errorMessage);
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkScrapingStatus, fetchRecentScraps, fetchSummary]);

  const initiateScraping = useCallback(async (jobTitle: string, location: string): Promise<string> => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.LINKEDIN_JOB}?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store the job ID
      localStorage.setItem(STORAGE_KEY, data.scraping_job_id);
      
      // Update current job state
      setCurrentJob({
        scraping_job_id: data.scraping_job_id,
        status: 'processing',
        job_title: jobTitle,
        location: location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_jobs_found: 0
      });

      return data.scraping_job_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate scraping';
      throw new Error(errorMessage);
    }
  }, []);

  const clearCurrentJob = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentJob(null);
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Poll for status updates when there's an active job
  useEffect(() => {
    if (!currentJob) return;
    
    // Only poll if job is still pending or processing
    if (currentJob.status !== 'pending' && currentJob.status !== 'processing') {
      return; // Stop polling when job is completed or failed
    }

    const interval = setInterval(() => {
      checkScrapingStatus();
    }, 4000); // Check every 4 seconds for faster detection

    return () => clearInterval(interval);
  }, [currentJob?.status, currentJob?.scraping_job_id, checkScrapingStatus]);

  // Check for existing job on mount
  useEffect(() => {
    const storedJobId = localStorage.getItem(STORAGE_KEY);
    if (storedJobId) {
      checkScrapingStatus();
    }
  }, [checkScrapingStatus]);

  const value: ScrapingContextType = {
    currentJob,
    recentScraps,
    summary,
    isLoading,
    error,
    hasActiveJob,
    checkScrapingStatus,
    initiateScraping,
    clearCurrentJob,
    refreshData
  };

  return (
    <ScrapingContext.Provider value={value}>
      {children}
    </ScrapingContext.Provider>
  );
}

export function useScrapingContext() {
  const context = useContext(ScrapingContext);
  if (context === undefined) {
    throw new Error('useScrapingContext must be used within a ScrapingProvider');
  }
  return context;
}