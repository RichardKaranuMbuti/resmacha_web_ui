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

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

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

const errorInterceptor = async (error: AxiosError): Promise<AxiosError> => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // If the error is 401 and we haven't already tried to refresh
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: currentRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      // Update tokens (this will also update cookies)
      setTokens(access_token, newRefreshToken);

      // Retry the original request with new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return axios(originalRequest);

    } catch (refreshError) {
      console.error('🚨 Token refresh failed, forcing logout');
      
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      
      // Force redirect to login - middleware will handle the redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Add interceptors to ALL instances
[authAxios, apiAxios, matchingAxios].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});

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