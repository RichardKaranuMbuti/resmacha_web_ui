// src/constants/api.ts

// Base URLs for different microservices
export const API_BASE_URLS = {
  AUTH: 'http://localhost:8004',
  SCRAPPING: 'http://localhost:8002',
  MATCHING: 'http://localhost:8003',
 
  // Add more microservices as needed
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh-token',
    LOGOUT: '/api/v1/auth/logout',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  
  // User endpoints
  USER: {
   
  },

  // Scrapping endpoints
  SCRAPPING: {
    LINKDIN_JOB: '/linkedin/jobs/scrape',
  },
  // Matching endpoints
  MATCHING: {
    JOB_MATCH: '/api/matching/match',
    JOB_MATCH_RESULT: '/api/matching/results',
  }
  // Add more endpoint groups as needed
  
} as const;

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