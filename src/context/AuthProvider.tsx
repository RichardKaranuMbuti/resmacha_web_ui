// src/context/AuthProvider.tsx - Fixed version
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
  detail?: string | Array<{ msg?: string; message?: string }>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback((): void => {
    console.log('🚪 Logging out user...');
    
    try {
      // Call logout endpoint to clear HTTP-only cookies
      authAxios.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (logoutError) {
      console.error('Logout API call failed:', logoutError);
    } finally {
      // Clear local storage only
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
    const initializeAuth = async () => {
      try {
        // Try to get user data from server (this will use HTTP-only cookies)
        const response = await authAxios.get('/auth/me');
        
        if (response.data) {
          const userData: User = response.data;
          setUser(userData);
          
          // Store user data in localStorage for UI purposes only
          const userDataForStorage = {
            ...userData,
            id: userData.id.toString(),
            name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username
          };
          storageUtils.setUserData(userDataForStorage);
          
          console.log('✅ User initialized from server');
        }
      } catch {
        console.log('❌ No valid session found');
        // Clear any stale local data
        storageUtils.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('🚨 Received auth:logout event from axios');
      logout();
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

      // FIXED: No need to manually handle tokens - server sets HTTP-only cookies
      // Get user data from the response or make a separate call
      let userData: User;
      
      if (response.data.user) {
        userData = response.data.user;
      } else {
        // If user data not in login response, fetch it
        const userResponse = await authAxios.get('/auth/me');
        userData = userResponse.data;
      }

      // Store user data in localStorage for UI purposes only
      const userDataForStorage = {
        ...userData,
        id: userData.id.toString(),
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username
      };

      storageUtils.setUserData(userDataForStorage);
      setUser(userData);
      
      console.log('✅ User data set successfully');
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      const axiosError = error as AxiosError;
      
      let errorMessage = 'Login failed. Please try again.';
      let errorStatus = 500;
      
      if (axiosError.response) {
        errorStatus = axiosError.response.status;
        
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
      
      const response = await authAxios.post<RegisterResponse>(
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

      // Auto-login after successful registration
      await login({
        email: userData.email,
        password: userData.password
      });

      console.log('✅ Auto-login after registration successful');

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      const axiosError = error as AxiosError;
      
      let errorMessage = 'Registration failed. Please try again.';
      let errorStatus = 500;
      
      if (axiosError.response) {
        errorStatus = axiosError.response.status;
        
        switch (errorStatus) {
          case 409:
            errorMessage = 'An account with this email or username already exists.';
            break;
          case 422:
            if (axiosError.response.data?.detail) {
              if (Array.isArray(axiosError.response.data.detail)) {
                errorMessage = axiosError.response.data.detail.map((err: { msg?: string; message?: string }) => 
                  err.msg || err.message
                ).join(', ');
              } else {
                errorMessage = axiosError.response.data.detail;
              }
            } else {
              errorMessage = 'Please check your information and try again.';
            }
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

  // Simplified refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual token refresh requested');
    try {
      await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {});
      console.log('✅ Manual token refresh successful');
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      throw error;
    }
  }, []);

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