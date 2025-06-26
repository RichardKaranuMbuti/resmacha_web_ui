// src/context/AuthProvider.tsx - localStorage token-based auth
"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAxios } from '../config/axiosConfig';
import { API_ENDPOINTS } from '../constants/api';
import type {
  ApiError,
  AuthContextType,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User
} from '../types/auth';
import { storageUtils } from '../utils/storage';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Define interfaces for better type safety
interface ErrorResponse {
  message?: string;
  code?: string;
  detail?: string | Array<{
    type?: string;
    loc?: string[];
    msg?: string;
    message?: string;
    input?: unknown;
    ctx?: { reason?: string };
  }>;
  [key: string]: unknown;
}

interface AxiosError {
  response?: {
    status: number;
    data?: ErrorResponse;
  };
  request?: unknown;
  message: string;
  config?: {
    url?: string;
  };
}

// Helper function to parse validation errors
const parseValidationErrors = (detail: ErrorResponse['detail']): string => {
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (Array.isArray(detail)) {
    return detail
      .map(err => err.msg || err.message || 'Validation error')
      .join(', ');
  }
  
  return 'Validation error occurred';
};

// Type guard to check if response data contains tokens
const hasTokens = (data: unknown): data is LoginResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'access_token' in data &&
    typeof (data as Record<string, unknown>).access_token === 'string'
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async (): Promise<void> => {
    console.log('🚪 Logging out user...');
    
    try {
      // Call logout endpoint to clear server-side session
      await authAxios.post(API_ENDPOINTS.AUTH.LOGOUT);
      console.log('✅ Logout API call successful');
    } catch (logoutError) {
      console.error('❌ Logout API call failed:', logoutError);
    } finally {
      // Clear local storage
      storageUtils.clearAuthData();
      setUser(null);
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/signup';
        
        if (!isAuthPage) {
          console.log('🔄 Redirecting to login page...');
          window.location.href = '/login';
        }
      }
    }
  }, []);

  // Initialize auth state from storage and verify with server
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('🔍 Checking for existing session...');
        
        const accessToken = storageUtils.getAccessToken();
        
        if (!accessToken) {
          console.log('ℹ️ No access token found in storage');
          return;
        }
        
        // Try to get user data from server using stored token
        const response = await authAxios.get(API_ENDPOINTS.AUTH.ME);
        
        if (response.data) {
          const userData: User = response.data;
          setUser(userData);
          
          // Update stored user data
          const userDataForStorage = {
            ...userData,
            id: userData.id.toString(),
            name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username
          };
          storageUtils.setUserData(userDataForStorage);
          
          console.log('✅ User initialized from stored token');
        }
      } catch (error) {
        console.log('ℹ️ No valid session found - clearing stored data', error);
        // Clear any stale local data
        storageUtils.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = (): void => {
      console.log('🚨 Received auth:logout event from axios interceptor');
      void logout();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleAuthLogout);
      
      return () => {
        window.removeEventListener('auth:logout', handleAuthLogout);
      };
    }
  }, [logout]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      console.log('🚀 Starting login process with:', { email: credentials.email });
      
      const response = await authAxios.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password
        }
      );

      console.log('✅ Login API response received');

      if (response.data?.access_token) {
        // Store tokens in localStorage
        storageUtils.setTokens(
          response.data.access_token, 
          response.data.refresh_token || ''
        );
        
        console.log('🔄 Tokens stored, fetching user data...');
        
        try {
          const userResponse = await authAxios.get(API_ENDPOINTS.AUTH.ME);
          const userData: User = userResponse.data;
          
          // Store user data in localStorage
          const userDataForStorage = {
            ...userData,
            id: userData.id.toString(),
            name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username
          };

          storageUtils.setUserData(userDataForStorage);
          setUser(userData);
          
          console.log('✅ User data set successfully after login');
          
        } catch (userFetchError) {
          console.error('❌ Could not fetch user data after login:', userFetchError);
          
          // Clear tokens on user fetch failure
          storageUtils.clearAuthData();
          
          const axiosError = userFetchError as AxiosError;
          if (axiosError.response?.status === 401) {
            throw new Error('Login succeeded but token validation failed. Please try again.');
          } else {
            throw new Error('Login successful but could not fetch user data. Please try again.');
          }
        }
      } else {
        throw new Error('Login response missing access token');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      const axiosError = error as AxiosError;
      
      let errorMessage = 'Login failed. Please try again.';
      let errorStatus = 500;
      
      if (axiosError.response) {
        errorStatus = axiosError.response.status;
        
        if (axiosError.response.data?.detail) {
          if (typeof axiosError.response.data.detail === 'string') {
            errorMessage = axiosError.response.data.detail;
          } else if (Array.isArray(axiosError.response.data.detail)) {
            errorMessage = parseValidationErrors(axiosError.response.data.detail);
          }
        } else {
          switch (errorStatus) {
            case 401:
              errorMessage = 'Invalid email or password.';
              break;
            case 422:
              errorMessage = 'Please check your email and password format.';
              break;
            case 404:
              errorMessage = 'Account not found. Please check your email.';
              break;
            case 429:
              errorMessage = 'Too many login attempts. Please try again later.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = axiosError.response.data?.message || errorMessage;
          }
        }
      } else if (axiosError.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      const apiError: ApiError = {
        message: errorMessage,
        status: errorStatus,
        code: axiosError.response?.data?.code,
        details: axiosError.response?.data
      };
      
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      console.log('🚀 Starting registration process with:', { 
        ...userData, 
        password: '[HIDDEN]' 
      });
      
      // Use union type to handle both possible response types
      const response = await authAxios.post<LoginResponse | RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          password: userData.password
        }
      );

      console.log('✅ Registration API response received:', response.status);

      // Check if registration returns tokens directly using type guard
      if (response.data && hasTokens(response.data)) {
        // Registration returned tokens - store them and set user
        const regResponse = response.data;
        
        storageUtils.setTokens(
          regResponse.access_token, 
          regResponse.refresh_token || ''
        );
        
        try {
          const userResponse = await authAxios.get(API_ENDPOINTS.AUTH.ME);
          const registeredUser: User = userResponse.data;
          
          const userDataForStorage = {
            ...registeredUser,
            id: registeredUser.id.toString(),
            name: `${registeredUser.first_name} ${registeredUser.last_name}`.trim() || registeredUser.username
          };

          storageUtils.setUserData(userDataForStorage);
          setUser(registeredUser);
          
          console.log('✅ Registration successful with direct tokens');
        } catch (userFetchError) {
          console.error('❌ Could not fetch user data after registration:', userFetchError);
          storageUtils.clearAuthData();
          throw new Error('Registration successful but could not fetch user data. Please try logging in.');
        }
      } else if (response.data) {
        // Registration returned user data directly
        const registeredUser = response.data as User;
        
        const userDataForStorage = {
          ...registeredUser,
          id: registeredUser.id.toString(),
          name: `${registeredUser.first_name} ${registeredUser.last_name}`.trim() || registeredUser.username
        };

        storageUtils.setUserData(userDataForStorage);
        setUser(registeredUser);
        
        console.log('✅ Registration successful with user data');
      } else {
        // Fallback: auto-login after successful registration
        await login({
          email: userData.email,
          password: userData.password
        });
        console.log('✅ Auto-login after registration successful');
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      const axiosError = error as AxiosError;
      
      let errorMessage = 'Registration failed. Please try again.';
      let errorStatus = 500;
      
      if (axiosError.response) {
        errorStatus = axiosError.response.status;
        
        if (axiosError.response.data?.detail) {
          if (typeof axiosError.response.data.detail === 'string') {
            errorMessage = axiosError.response.data.detail;
          } else if (Array.isArray(axiosError.response.data.detail)) {
            errorMessage = parseValidationErrors(axiosError.response.data.detail);
          }
        } else {
          switch (errorStatus) {
            case 409:
              errorMessage = 'An account with this email or username already exists.';
              break;
            case 422:
              errorMessage = 'Please check your information and try again.';
              break;
            case 400:
              errorMessage = axiosError.response.data?.message || 'Invalid registration data.';
              break;
            case 429:
              errorMessage = 'Too many registration attempts. Please try again later.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = axiosError.response.data?.message || errorMessage;
          }
        }
      } else if (axiosError.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      const apiError: ApiError = {
        message: errorMessage,
        status: errorStatus,
        code: axiosError.response?.data?.code,
        details: axiosError.response?.data
      };
      
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Manual refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual token refresh requested');
    try {
      const refreshToken = storageUtils.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });

      if (response.data?.access_token) {
        storageUtils.setTokens(
          response.data.access_token, 
          response.data.refresh_token || refreshToken
        );
        console.log('✅ Manual token refresh successful');
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      
      const axiosError = error as AxiosError;
      
      // If refresh token is invalid/expired, logout user
      if (axiosError.response?.status === 401 || 
          (axiosError.response?.data?.detail && 
           typeof axiosError.response.data.detail === 'string' && 
           axiosError.response.data.detail.includes('Invalid or expired refresh token'))) {
        console.log('🚨 Refresh token expired, logging out user');
        await logout();
      }
      
      throw error;
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};