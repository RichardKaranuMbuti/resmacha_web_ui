"use client";
// src/context/AuthProvider.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAxios, clearTokens, setTokens } from '../config/axiosConfig';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserData = storageUtils.getUserData();
        const accessToken = storageUtils.getAccessToken();

        // Type guard to ensure the stored data is a valid User object
        const isValidUser = (data: any): data is User => {
          return data && 
            typeof data.id === 'number' && 
            typeof data.email === 'string' &&
            data.hasOwnProperty('username');
        };

        if (isValidUser(storedUserData) && accessToken) {
          setUser(storedUserData);
        } else if (storedUserData) {
          // Clear invalid data
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

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call your login API: POST /api/v1/auth/login
      const response = await authAxios.post<LoginResponse>(
        '/api/v1/auth/login',
        {
          email: credentials.email,
          password: credentials.password
        }
      );

      const { access_token, refresh_token, expires_in, token_type } = response.data;

      // Store tokens securely
      setTokens(access_token, refresh_token);
      storageUtils.setTokens(access_token, refresh_token, expires_in);

      // After login, we need to get user profile
      // Since your login response doesn't include user data, we need to decode from JWT
      try {
        // Decode JWT token to get user info
        const tokenParts = access_token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Create user object from token payload
          // Note: You might want to make a separate API call to get full user profile
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

          storageUtils.setUserData(userData);
          setUser(userData);
        }
      } catch (tokenError) {
        console.error('Error decoding token:', tokenError);
        // If token decoding fails, create minimal user object
        const userData: User = {
          id: Date.now(), // Temporary ID
          email: credentials.email,
          username: '',
          first_name: '',
          last_name: '',
          is_active: true,
          auth_provider: 'local',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        storageUtils.setUserData(userData);
        setUser(userData);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error types from your API
      let errorMessage = 'Login failed. Please try again.';
      let errorStatus = 500;
      
      if (error.response) {
        errorStatus = error.response.status;
        
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
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      const apiError: ApiError = {
        message: errorMessage,
        status: errorStatus,
        code: error.response?.data?.code,
        details: error.response?.data
      };
      
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call your register API: POST /api/v1/auth/register
      const response = await authAxios.post<RegisterResponse>(
        '/api/v1/auth/register',
        {
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          password: userData.password
        }
      );

      const newUser = response.data;
      
      // Store user data after successful registration
      const formattedUser: User = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        is_active: newUser.is_active,
        auth_provider: newUser.auth_provider,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      };

      // Auto-login after successful registration
      await login({
        email: userData.email,
        password: userData.password
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error types from your API
      let errorMessage = 'Registration failed. Please try again.';
      let errorStatus = 500;
      
      if (error.response) {
        errorStatus = error.response.status;
        
        switch (errorStatus) {
          case 409:
            errorMessage = 'An account with this email or username already exists.';
            break;
          case 422:
            if (error.response.data?.detail) {
              if (Array.isArray(error.response.data.detail)) {
                errorMessage = error.response.data.detail.map((err: any) => 
                  err.msg || err.message
                ).join(', ');
              } else {
                errorMessage = error.response.data.detail;
              }
            } else {
              errorMessage = 'Please check your information and try again.';
            }
            break;
          case 400:
            errorMessage = error.response.data?.message || 'Invalid registration data.';
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
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      const apiError: ApiError = {
        message: errorMessage,
        status: errorStatus,
        code: error.response?.data?.code,
        details: error.response?.data
      };
      
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentRefreshToken = storageUtils.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Call your refresh API: POST /api/v1/auth/refresh-token
      const response = await authAxios.post('/api/v1/auth/refresh-token', {
        refresh_token: currentRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;
      
      setTokens(access_token, newRefreshToken);
      storageUtils.setTokens(access_token, newRefreshToken, expires_in);

    } catch (error: any) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, []);

  const logout = useCallback((): void => {
    try {
      // Optionally call logout endpoint if you have one
      // authAxios.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all auth data regardless of API call success
      clearTokens();
      storageUtils.clearAuthData();
      setUser(null);
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes (your token expires in 30 minutes)

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