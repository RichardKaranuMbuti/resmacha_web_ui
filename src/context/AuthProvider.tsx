"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAxios, clearTokens, setTokens } from '../config/axiosConfig';
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
interface TokenPayload {
  sub: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

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
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserData = storageUtils.getUserData();
        const accessToken = storageUtils.getAccessToken();

        const isValidUser = (data: unknown): data is User => {
          return data !== null && 
            typeof data === 'object' &&
            data !== undefined &&
            'id' in data &&
            'email' in data &&
            'username' in data &&
            typeof (data as User).id === 'number' && 
            typeof (data as User).email === 'string' &&
            typeof (data as User).username === 'string';
        };

        if (isValidUser(storedUserData) && accessToken) {
          setUser(storedUserData);
        } else if (storedUserData) {
          storageUtils.clearAuthData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        storageUtils.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = useCallback((): void => {
    try {
      // Optionally call logout endpoint
      // authAxios.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearTokens();
      storageUtils.clearAuthData();
      setUser(null);
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentRefreshToken = storageUtils.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // FIXED: Use consistent endpoint
      const response = await authAxios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: currentRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;
      
      setTokens(access_token, newRefreshToken);
      storageUtils.setTokens(access_token, newRefreshToken, expires_in);

    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, [logout]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      console.log('🚀 Starting login process with:', { email: credentials.email });
      
      // FIXED: Use consistent endpoint and better logging
      const response = await authAxios.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password
        }
      );

      console.log('✅ Login API response received');

      const { access_token, refresh_token } = response.data;

      // Store tokens securely
      setTokens(access_token, refresh_token);
      storageUtils.setTokens(access_token, refresh_token, response.data.expires_in);

      // Decode JWT token to get user info
      try {
        const tokenParts = access_token.split('.');
        if (tokenParts.length === 3) {
          const payload: TokenPayload = JSON.parse(atob(tokenParts[1]));
          
          const userData: User = {
            id: parseInt(payload.sub),
            email: payload.email || credentials.email,
            username: payload.username || '',
            first_name: payload.first_name || '',
            last_name: payload.last_name || '',
            is_active: payload.is_active !== false,
            auth_provider: 'local',
            created_at: payload.created_at || new Date().toISOString(),
            updated_at: payload.updated_at || new Date().toISOString()
          };

          const userDataForStorage = {
            ...userData,
            id: userData.id.toString(),
            name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username
          };

          storageUtils.setUserData(userDataForStorage);
          setUser(userData);
          
          console.log('✅ User data set successfully');
        }
      } catch (tokenError) {
        console.error('Error decoding token:', tokenError);
        // Fallback user object
        const userData: User = {
          id: Date.now(),
          email: credentials.email,
          username: '',
          first_name: '',
          last_name: '',
          is_active: true,
          auth_provider: 'local',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const userDataForStorage = {
          ...userData,
          id: userData.id.toString(),
          name: userData.email
        };

        storageUtils.setUserData(userDataForStorage);
        setUser(userData);
      }
      
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
      
      // FIXED: Use consistent endpoint and better logging
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

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

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