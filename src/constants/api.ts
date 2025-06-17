// src/constants/api.ts

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Get API URL with fallback
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://resmatcha-api.duckdns.org';

// Debug logging
console.log('🔧 API Config Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  NEXT_PUBLIC_API_URL,
  usingFallback: !process.env.NEXT_PUBLIC_API_URL && !isDevelopment
});

// Warn if using fallback in production
if (!isDevelopment && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️ Using fallback API URL in production. Set NEXT_PUBLIC_API_URL environment variable.');
}

// Base URLs for different environments
export const API_BASE_URLS = {
  // Development: direct service URLs
  // Production: single domain with ingress routing
  USER: isDevelopment ? 'http://localhost:8004' : NEXT_PUBLIC_API_URL, // Keep USER for backward compatibility
  USERS: isDevelopment ? 'http://localhost:8004' : NEXT_PUBLIC_API_URL, // Alias for consistency
  MATCHING: isDevelopment ? 'http://localhost:8003' : NEXT_PUBLIC_API_URL,
  SCRAPING: isDevelopment ? 'http://localhost:8002' : NEXT_PUBLIC_API_URL,
} as const;

// API Endpoints - matching your actual ingress routes and service implementations
export const API_ENDPOINTS = {
  // Auth endpoints - routed through user service (/api/v1/users prefix in ingress)
  // Your user service router uses prefix="/api/v1/users", so auth endpoints are nested under that
  AUTH: {
    REGISTER: '/api/v1/users/auth/register',
    LOGIN: '/api/v1/users/auth/login', 
    REFRESH: '/api/v1/users/auth/refresh-token',
    LOGOUT: '/api/v1/users/auth/logout',
    VERIFY_EMAIL: '/api/v1/users/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/users/auth/forgot-password',  
    RESET_PASSWORD: '/api/v1/users/auth/reset-password',
  },
  
  // User profile endpoints
  USER: {
    PROFILE: '/api/v1/users/profile',
    UPDATE: '/api/v1/users/update',
  },

  // Scraping endpoints  
  SCRAPING: {
    LINKEDIN_JOB: '/api/v1/scraping/linkedin/jobs/scrape',
  },
  
  // Matching endpoints
  MATCHING: {
    JOB_MATCH: '/api/v1/matching/match',
    JOB_MATCH_RESULT: '/api/v1/matching/results',
  },

  // Resume endpoints (handled by matching service)
  RESUME: {
    UPLOAD: '/api/v1/resumes/upload',
    LIST: '/api/v1/resumes/',
    LATEST: '/api/v1/resumes/latest',
    GET_BY_ID: '/api/v1/resumes', // + /{resume_id}
    UPDATE: '/api/v1/resumes', // + /{resume_id}
    DELETE: '/api/v1/resumes', // + /{resume_id}
    GET_CONTENT: '/api/v1/resumes', // + /{resume_id}/content
    REFRESH_TEXT: '/api/v1/resumes', // + /{resume_id}/refresh-text
    // Legacy endpoints (deprecated but included for completeness)
    LEGACY_PATH: '/api/v1/resumes', // + /{user_id}/path
    LEGACY_CONTENT: '/api/v1/resumes', // + /{user_id}/content
  },

  // Health endpoints
  HEALTH: {
    USERS: '/api/users/health',
    MATCHING: '/api/matching/health', 
    SCRAPING: '/api/scraping/health',
  }
} as const;

// Helper function to build full URLs - keeping existing interface
export const buildApiUrl = (service: keyof typeof API_BASE_URLS, endpoint: string): string => {
  return `${API_BASE_URLS[service]}${endpoint}`;
};

// Backward compatibility - your code uses API_BASE_URLS.USER
// These functions maintain the same interface as before
export const getAuthUrl = (endpoint: keyof typeof API_ENDPOINTS.AUTH): string => {
  return `${API_BASE_URLS.USER}${API_ENDPOINTS.AUTH[endpoint]}`;
};

export const getUserUrl = (endpoint: keyof typeof API_ENDPOINTS.USER): string => {
  return `${API_BASE_URLS.USER}${API_ENDPOINTS.USER[endpoint]}`;
};

export const getScrapingUrl = (endpoint: keyof typeof API_ENDPOINTS.SCRAPING): string => {
  return `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING[endpoint]}`;
};

export const getMatchingUrl = (endpoint: keyof typeof API_ENDPOINTS.MATCHING): string => {
  return `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.MATCHING[endpoint]}`;
};

export const getResumeUrl = (endpoint: keyof typeof API_ENDPOINTS.RESUME): string => {
  return `${API_BASE_URLS.MATCHING}${API_ENDPOINTS.RESUME[endpoint]}`;
};

export const getHealthUrl = (service: keyof typeof API_ENDPOINTS.HEALTH): string => {
  const serviceMap = {
    USERS: 'USER', // Use USER for backward compatibility
    MATCHING: 'MATCHING', 
    SCRAPING: 'SCRAPING'
  } as const;
  return `${API_BASE_URLS[serviceMap[service]]}${API_ENDPOINTS.HEALTH[service]}`;
};

// Usage examples - showing how URLs are constructed:
console.log('📝 API URL Examples:');
console.log('Development vs Production routing:');
if (isDevelopment) {
  console.log('Auth Register (dev):', `http://localhost:8004${API_ENDPOINTS.AUTH.REGISTER}`);
  console.log('User Profile (dev):', `http://localhost:8004${API_ENDPOINTS.USER.PROFILE}`);
} else {
  console.log('Auth Register (prod):', `${NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REGISTER}`);  
  console.log('User Profile (prod):', `${NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER.PROFILE}`);
  console.log('LinkedIn Scraping (prod):', `${NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SCRAPING.LINKEDIN_JOB}`);
  console.log('Job Matching (prod):', `${NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MATCHING.JOB_MATCH}`);
  console.log('Users Health (prod):', `${NEXT_PUBLIC_API_URL}${API_ENDPOINTS.HEALTH.USERS}`);
}

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