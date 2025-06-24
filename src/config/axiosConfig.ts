//src/config/axiosConfig.ts - Fixed version
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URLS, API_ENDPOINTS, REQUEST_TIMEOUT } from '../constants/api';

// REMOVED: Client-side cookie utilities - we'll use HTTP-only cookies set by the server

// Create axios instances
export const authAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.USER,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // ADDED: Enable cookies for all requests
});

export const apiAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.USER,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // ADDED: Enable cookies for all requests
});

export const matchingAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.MATCHING,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // ADDED: Enable cookies for all requests
});

// Define types for the failed queue
interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

// SIMPLIFIED: Remove client-side token management
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

// Process failed requests queue
const processQueue = (error: Error | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  
  failedQueue = [];
};

// Emit custom logout event
const emitLogoutEvent = () => {
  if (typeof window !== 'undefined') {
    console.log('🚨 Emitting auth:logout event from axios');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};

// REMOVED: setTokens, clearTokens, getAccessToken, getRefreshToken
// Tokens are now managed server-side via HTTP-only cookies

// REMOVED: Request interceptor - no need to manually add auth headers
// Cookies are automatically sent with withCredentials: true

// Response interceptor for token refresh
const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

// Define interface for retry-enabled request config
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const errorInterceptor = async (error: AxiosError): Promise<AxiosResponse> => {
  const originalRequest = error.config as RetryableAxiosRequestConfig;

  // If the error is 401 and we haven't already tried to refresh
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    
    // Skip refresh for auth endpoints to avoid infinite loops
    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<unknown>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        return axios(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('🔄 Attempting token refresh...');
      
      // FIXED: Use the same axios instance to maintain cookie behavior
      await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {});

      console.log('✅ Token refresh successful');
      
      // Process the queue - tokens are automatically updated via cookies
      processQueue(null);

      // Retry the original request
      return axios(originalRequest);

    } catch (refreshError) {
      console.error('🚨 Token refresh failed:', refreshError);
      
      // Process the queue with error
      const errorObj = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
      processQueue(errorObj);
      
      // Emit logout event - server will clear cookies
      emitLogoutEvent();
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
};

// Add interceptors to instances that need authentication
[apiAxios, matchingAxios].forEach(instance => {
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});