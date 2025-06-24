//src/config/axiosConfig.ts
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URLS, API_ENDPOINTS, REQUEST_TIMEOUT } from '../constants/api';

// Cookie utilities for client-side
const cookieUtils = {
  getCookie: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  setCookie: (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  },

  deleteCookie: (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Create axios instances
export const authAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.USER,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const apiAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.USER,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const matchingAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.MATCHING,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Define types for the failed queue
interface QueuedRequest {
  resolve: (value: string | null) => void;
  reject: (error: Error) => void;
}

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

// Process failed requests queue
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
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

export const setTokens = (access: string, refresh: string): void => {
  accessToken = access;
  refreshToken = refresh;
  
  // Set cookies for middleware
  cookieUtils.setCookie('access_token', access, 7);
  cookieUtils.setCookie('refresh_token', refresh, 30);
  
  // Set default authorization header for ALL instances
  authAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  apiAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  matchingAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

export const clearTokens = (): void => {
  accessToken = null;
  refreshToken = null;
  
  // Clear cookies
  cookieUtils.deleteCookie('access_token');
  cookieUtils.deleteCookie('refresh_token');
  
  // Remove authorization headers from ALL instances
  delete authAxios.defaults.headers.common['Authorization'];
  delete apiAxios.defaults.headers.common['Authorization'];
  delete matchingAxios.defaults.headers.common['Authorization'];
};

export const getAccessToken = (): string | null => {
  return accessToken || cookieUtils.getCookie('access_token');
};

export const getRefreshToken = (): string | null => {
  return refreshToken || cookieUtils.getCookie('refresh_token');
};

// Request interceptor to add auth token
const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

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
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        if (originalRequest.headers && token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axios(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Attempting token refresh...');
      
      // Create a new axios instance to avoid interceptor loops
      const refreshAxios = axios.create({
        baseURL: API_BASE_URLS.USER,
        timeout: REQUEST_TIMEOUT,
      });

      const response = await refreshAxios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: currentRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      console.log('✅ Token refresh successful');
      
      // Update tokens (this will also update cookies)
      setTokens(access_token, newRefreshToken);
      
      // Process the queue with the new token
      processQueue(null, access_token);

      // Retry the original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }
      
      return axios(originalRequest);

    } catch (refreshError) {
      console.error('🚨 Token refresh failed:', refreshError);
      
      // Process the queue with error
      const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
      processQueue(error, null);
      
      // Clear tokens and emit logout event
      clearTokens();
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
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});

// Don't add interceptors to authAxios to avoid loops during auth operations
authAxios.interceptors.request.use(requestInterceptor);

// Initialize tokens from cookies on load
const initializeTokens = (): void => {
  const storedAccessToken = cookieUtils.getCookie('access_token');
  const storedRefreshToken = cookieUtils.getCookie('refresh_token');
  
  if (storedAccessToken && storedRefreshToken) {
    accessToken = storedAccessToken;
    refreshToken = storedRefreshToken;
    
    // Set headers
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
    apiAxios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
    matchingAxios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
  }
};

// Initialize on module load
initializeTokens();