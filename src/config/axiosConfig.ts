//src/config/axiosConfig.ts - localStorage token-based auth
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URLS, API_ENDPOINTS, REQUEST_TIMEOUT } from '../constants/api';
import { storageUtils } from '../utils/storage';

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
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

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

// Request interceptor to add auth tokens
const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Always get fresh token from storage for each request
  const token = storageUtils.getAccessToken();
  
  if (token) {
    // Ensure headers object exists with proper typing
    if (!config.headers) {
      config.headers = {} as InternalAxiosRequestConfig['headers'];
    }
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token attached to request:', config.url);
  } else {
    console.warn('⚠️ No token available for request:', config.url);
  }
  
  return config;
};

// Response interceptor for successful responses
const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

// Define interface for retry-enabled request config
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const errorInterceptor = async (error: AxiosError): Promise<AxiosResponse> => {
  const originalRequest = error.config as RetryableAxiosRequestConfig;

  // Log the error for debugging
  console.error('🚨 Axios error:', {
    status: error.response?.status,
    url: originalRequest?.url,
    message: error.message
  });

  // If the error is 401 and we haven't already tried to refresh
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    
    // Skip refresh for auth endpoints to avoid infinite loops
    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')) {
      console.log('🚫 Skipping token refresh for auth endpoint');
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      console.log('⏳ Queueing request while refresh in progress');
      return new Promise<unknown>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        // Ensure fresh token is attached after refresh
        const freshToken = storageUtils.getAccessToken();
        if (freshToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        }
        return axios(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('🔄 Attempting token refresh...');
      
      const refreshToken = storageUtils.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint with refresh token
      const response = await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });

      if (response.data?.access_token) {
        // Store new tokens
        storageUtils.setTokens(response.data.access_token, response.data.refresh_token || refreshToken);
        console.log('✅ Token refresh successful');
        
        // Update authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        }
        
        // Process the queue
        processQueue(null);

        // Retry the original request
        return axios(originalRequest);
      } else {
        throw new Error('No access token in refresh response');
      }

    } catch (refreshError) {
      console.error('🚨 Token refresh failed:', refreshError);
      
      // Process the queue with error
      const errorObj = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
      processQueue(errorObj);
      
      // Clear tokens and emit logout event
      storageUtils.clearAuthData();
      emitLogoutEvent();
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
};

// Add interceptors to all instances that need authentication
[authAxios, apiAxios, matchingAxios].forEach((instance, index) => {
  const instanceNames = ['authAxios', 'apiAxios', 'matchingAxios'];
  console.log(`🔧 Setting up interceptors for ${instanceNames[index]}`);
  
  instance.interceptors.request.use(
    requestInterceptor,
    (error) => {
      console.error(`❌ Request interceptor error for ${instanceNames[index]}:`, error);
      return Promise.reject(error);
    }
  );
  
  instance.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  );
});

// Export a utility function to manually attach token (as backup)
export const attachTokenToRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = storageUtils.getAccessToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as InternalAxiosRequestConfig['headers'];
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};