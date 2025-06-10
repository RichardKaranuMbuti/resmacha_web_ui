// src/constants/api.ts

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost');
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;


// Debug logging
console.log('🔧 API Config Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  NEXT_PUBLIC_API_URL,
  hasApiUrl: !!NEXT_PUBLIC_API_URL
});

// Base URLs for different environments
export const API_BASE_URLS = {
  // In development: direct service URLs
  // In production: single domain with service prefixes
  SCRAPING: isDevelopment ? 'http://localhost:8002' : `${NEXT_PUBLIC_API_URL}/api/scraping`, 
  MATCHING: isDevelopment ? 'http://localhost:8003' : `${NEXT_PUBLIC_API_URL}/api/matching`,
  USER: isDevelopment ? 'http://localhost:8004' : `${NEXT_PUBLIC_API_URL}/api/users`,
} as const;

// Consistent API Endpoints (same for both dev and prod)
export const API_ENDPOINTS = {
  // Auth endpoints - consistent paths
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh-token',
    LOGOUT: '/api/v1/auth/logout',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    HEALTH: '/health', // Consistent health check
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/v1/users/profile',
    UPDATE: '/api/v1/users/update',
    HEALTH: '/health',
  },

  // Scraping endpoints  
  SCRAPING: {
    LINKEDIN_JOB: '/api/v1/scraping/linkedin/jobs/scrape',
    HEALTH: '/health',
  },
  
  // Matching endpoints
  MATCHING: {
    JOB_MATCH: '/api/v1/matching/match',
    JOB_MATCH_RESULT: '/api/v1/matching/results',
    HEALTH: '/health',
  }
} as const;

// Helper function to build full URLs
export const buildApiUrl = (service: keyof typeof API_BASE_URLS, endpoint: string): string => {
  return `${API_BASE_URLS[service]}${endpoint}`;
};

// Usage examples:
// Development: http://localhost:8004/api/v1/auth/register
// Production: http://resmatcha-api.eastus.cloudapp.azure.com/api/auth/api/v1/auth/register

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Request timeout
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Token expiry buffer (refresh 5 minutes before expiry)
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds