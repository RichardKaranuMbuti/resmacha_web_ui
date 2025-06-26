//src/context/ScrapingContext.tsx
'use client';

import { apiAxios } from '@src/config/axiosConfig';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

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

// Create a separate axios instance for scraping API
const scrapingAxios = axios.create({
  baseURL: API_BASE_URLS.SCRAPING,
  timeout: 30000, // 30 seconds timeout for scraping operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to attach auth token
scrapingAxios.interceptors.request.use((config) => {
  // Get token from apiAxios instance (which has the token management)
  const authHeader = apiAxios.defaults.headers.common['Authorization'] as string;
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
});

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
    const storedJobId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!storedJobId) return;

    try {
      console.log('🔍 Checking scraping status for job:', storedJobId);
      
      const response = await scrapingAxios.get<ScrapingJob>(
        `${API_ENDPOINTS.SCRAPING.SCRAPE_STATUS}/${storedJobId}`
      );

      const data = response.data;
      
      // Validate that we have a valid status
      if (!data.status || typeof data.status !== 'string') {
        console.warn('⚠️ Invalid status received:', data.status);
        setError('Received invalid job status. Please try refreshing.');
        return;
      }
      
      const lastKnownStatus = typeof window !== 'undefined' ? localStorage.getItem(LAST_KNOWN_STATUS_KEY) : null;
      
      // Check for invalid status transitions
      if (lastKnownStatus && !isValidStatusTransition(lastKnownStatus, data.status)) {
        console.warn(`⚠️ Invalid status transition: ${lastKnownStatus} -> ${data.status}`);
        setError('Something unexpected happened with your job. You can start a new search.');
        return;
      }
      
      setCurrentJob(data);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_KNOWN_STATUS_KEY, data.status);
      }
      
      // Clear any previous errors
      setError(null);
      
      console.log('✅ Scraping status updated:', {
        job_id: data.scraping_job_id,
        status: data.status,
        total_jobs_found: data.total_jobs_found
      });
      
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error('❌ Error checking scraping status:', err);
      
      if (error.response?.status === 404) {
        // Job not found, clear stored data
        console.log('🗑️ Job not found (404), clearing stored data');
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
        }
        setCurrentJob(null);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to check job status. Please try refreshing.';
        setError(errorMessage);
        
        // Only clear on specific errors, not network issues
        if (error.response?.status === 404) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
          }
          setCurrentJob(null);
        }
      }
    }
  }, []);

  const fetchRecentScraps = useCallback(async () => {
    try {
      console.log('📋 Fetching recent scraps...');
      
      const response = await scrapingAxios.get<{data: {scraps: RecentScrap[]}}>(
        API_ENDPOINTS.SCRAPING.RECENT_SCRAPS
      );

      setRecentScraps(response.data.data?.scraps || []);
      console.log('✅ Recent scraps fetched:', response.data.data?.scraps?.length || 0);
      
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error('❌ Error fetching recent scraps:', error);
      // Don't throw error for non-critical data
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      console.log('📊 Fetching scraping summary...');
      
      const response = await scrapingAxios.get<{data: ScrapingSummary}>(
        API_ENDPOINTS.SCRAPING.SCRAP_SUMMARY
      );

      setSummary(response.data.data);
      console.log('✅ Summary fetched:', response.data.data);
      
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error('❌ Error fetching summary:', error);
      // Don't throw error for non-critical data
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Refreshing scraping data...');
      
      await Promise.all([
        checkScrapingStatus(),
        fetchRecentScraps(),
        fetchSummary()
      ]);
      
      console.log('✅ Data refresh completed');
      
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load scraping data';
      setError(errorMessage);
      console.error('❌ Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkScrapingStatus, fetchRecentScraps, fetchSummary]);

  const initiateScraping = useCallback(async (jobTitle: string, location: string): Promise<string> => {
    try {
      console.log('🚀 Initiating scraping for:', { jobTitle, location });
      
      const response = await scrapingAxios.post<{scraping_job_id: string}>(
        `${API_ENDPOINTS.SCRAPING.LINKEDIN_JOB}?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`
      );

      const data = response.data;
      
      // Store the job ID and initial status
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, data.scraping_job_id);
        localStorage.setItem(LAST_KNOWN_STATUS_KEY, 'pending');
      }
      
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

      console.log('✅ Scraping initiated successfully:', data.scraping_job_id);
      
      return data.scraping_job_id;
      
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate scraping';
      console.error('❌ Error initiating scraping:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const clearCurrentJob = useCallback(() => {
    console.log('🗑️ Clearing current job');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_KNOWN_STATUS_KEY);
    }
    setCurrentJob(null);
  }, []);

  const navigateToResults = useCallback(() => {
    console.log('🔗 Navigating to results page');
    clearCurrentJob();
    if (typeof window !== 'undefined') {
      window.location.href = '/home/results';
    }
  }, [clearCurrentJob]);

  const stayOnApplyPage = useCallback(() => {
    console.log('📄 Staying on apply page, refreshing data');
    clearCurrentJob();
    // Refresh the data to show the dashboard
    refreshData();
  }, [clearCurrentJob, refreshData]);

  // Initial data load
  useEffect(() => {
    console.log('🏁 ScrapingProvider initializing...');
    refreshData();
  }, [refreshData]);

  // Poll for status updates when there's an active job
  useEffect(() => {
    if (!hasActiveJob) return;

    console.log('⏰ Starting polling for active job');
    
    const interval = setInterval(() => {
      checkScrapingStatus();
    }, 8000); // Check every 8 seconds

    return () => {
      console.log('⏹️ Stopping polling interval');
      clearInterval(interval);
    };
  }, [hasActiveJob, checkScrapingStatus]);

  // Check for existing job on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedJobId = localStorage.getItem(STORAGE_KEY);
      if (storedJobId) {
        console.log('🔍 Found existing job on mount:', storedJobId);
        checkScrapingStatus();
      }
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