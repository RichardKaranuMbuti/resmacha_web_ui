//src/context/ScrapingContext.tsx
'use client';

import { apiAxios } from '@src/config/axiosConfig';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ScrapingJob {
  scraping_job_id: string;
  status: 'pending' | 'queued' | 'processing' | 'processing_details' | 'cards_completed' | 'updating_database' | 'completed' | 'failed' | 'cancelled' | 'retry' | 'dead_letter';
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
  shouldShowJobStatus: boolean;
  checkScrapingStatus: () => Promise<void>;
  initiateScraping: (jobTitle: string, location: string) => Promise<string>;
  clearCurrentJob: () => void;
  refreshData: () => Promise<void>;
  navigateToResults: () => void;
  stayOnApplyPage: () => void;
}

const ScrapingContext = createContext<ScrapingContextType | undefined>(undefined);

const STORAGE_KEY = 'scraping_job_id';
const LAST_KNOWN_STATUS_KEY = 'last_known_status';

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

// Helper function to determine if status transition is valid
const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const statusOrder = [
    'pending', 'queued', 'processing', 'processing_details', 
    'cards_completed', 'updating_database', 'completed'
  ];
  
  // Allow same status (no change)
  if (currentStatus === newStatus) return true;
  
  // Allow failure, cancellation, retry, or dead_letter from any status
  if (['failed', 'cancelled', 'retry', 'dead_letter'].includes(newStatus)) return true;
  
  // Allow forward progression in the normal flow
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);
  
  if (currentIndex >= 0 && newIndex >= 0) {
    return newIndex > currentIndex;
  }
  
  return false;
};

export function ScrapingProvider({ children }: { children: ReactNode }) {
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);
  const [recentScraps, setRecentScraps] = useState<RecentScrap[]>([]);
  const [summary, setSummary] = useState<ScrapingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if job is still active (should keep polling)
  const hasActiveJob = currentJob && [
    'pending', 'queued', 'processing', 'processing_details', 
    'cards_completed', 'updating_database', 'retry'
  ].includes(currentJob.status);

  // Determine if we should show the job status screen (including completed/failed jobs)
  const shouldShowJobStatus = currentJob && [
    'pending', 'queued', 'processing', 'processing_details', 
    'cards_completed', 'updating_database', 'retry', 'completed', 'failed', 'cancelled', 'dead_letter'
  ].includes(currentJob.status);

  const checkScrapingStatus = useCallback(async () => {
    const storedJobId = localStorage.getItem(STORAGE_KEY);
    if (!storedJobId) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.SCRAPE_STATUS}/${storedJobId}`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Validate that we have a valid status
        if (!data.status || typeof data.status !== 'string') {
          console.warn('Invalid status received:', data.status);
          setError('Received invalid job status. Please try refreshing.');
          return;
        }
        
        const lastKnownStatus = localStorage.getItem(LAST_KNOWN_STATUS_KEY);
        
        // Check for invalid status transitions
        if (lastKnownStatus && !isValidStatusTransition(lastKnownStatus, data.status)) {
          console.warn(`Invalid status transition: ${lastKnownStatus} -> ${data.status}`);
          setError('Something unexpected happened with your job. You can start a new search.');
          return;
        }
        
        setCurrentJob(data);
        localStorage.setItem(LAST_KNOWN_STATUS_KEY, data.status);
        
        // Clear any previous errors
        setError(null);
        
      } else if (response.status === 404) {
        // Job not found, clear stored data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
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
        localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
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
      
      // Store the job ID and initial status
      localStorage.setItem(STORAGE_KEY, data.scraping_job_id);
      localStorage.setItem(LAST_KNOWN_STATUS_KEY, 'pending');
      
      // Update current job state
      setCurrentJob({
        scraping_job_id: data.scraping_job_id,
        status: 'pending',
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
    localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
    setCurrentJob(null);
  }, []);

  const navigateToResults = useCallback(() => {
    clearCurrentJob();
    window.location.href = '/home/results';
  }, [clearCurrentJob]);

  const stayOnApplyPage = useCallback(() => {
    clearCurrentJob();
    // Refresh the data to show the dashboard
    refreshData();
  }, [clearCurrentJob, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Poll for status updates when there's an active job
  useEffect(() => {
    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      checkScrapingStatus();
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [hasActiveJob, checkScrapingStatus]);

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
    hasActiveJob: !!hasActiveJob,
    shouldShowJobStatus: !!shouldShowJobStatus,
    checkScrapingStatus,
    initiateScraping,
    clearCurrentJob,
    refreshData,
    navigateToResults,
    stayOnApplyPage
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