// src/config/axiosConfig.ts
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URLS, REQUEST_TIMEOUT } from '../constants/api';
import { storageUtils } from '../utils/storage';

// Create axios instance for auth API
export const authAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.AUTH,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create general API instance (for other endpoints)
export const apiAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URLS.AUTH, // You can change this to a general API base URL
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string): void => {
  accessToken = access;
  refreshToken = refresh;
  
  // Set default authorization header for both instances
  authAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  apiAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

export const clearTokens = (): void => {
  accessToken = null;
  refreshToken = null;
  
  // Remove authorization headers
  delete authAxios.defaults.headers.common['Authorization'];
  delete apiAxios.defaults.headers.common['Authorization'];
};

export const getAccessToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

// Request interceptor to add auth token
const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = storageUtils.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor for token refresh
const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

const errorInterceptor = async (error: any): Promise<any> => {
  const originalRequest = error.config;

  // If the error is 401 and we haven't already tried to refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const currentRefreshToken = storageUtils.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Try to refresh the token
      const response = await authAxios.post('/api/v1/auth/refresh-token', {
        refresh_token: currentRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;
      
      // Update tokens
      setTokens(access_token, newRefreshToken);
      storageUtils.setTokens(access_token, newRefreshToken, expires_in);

      // Retry the original request with new token
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return axios(originalRequest);

    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      storageUtils.clearAuthData();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Add interceptors to both instances
[authAxios, apiAxios].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});

// Initialize tokens from storage
const initializeTokens = (): void => {
  const storedAccessToken = storageUtils.getAccessToken();
  const storedRefreshToken = storageUtils.getRefreshToken();
  
  if (storedAccessToken && storedRefreshToken) {
    setTokens(storedAccessToken, storedRefreshToken);
  }
};

// Initialize on module load
initializeTokens();