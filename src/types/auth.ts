// src/types/auth.ts

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  auth_provider: 'local' | 'google';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
}

export interface RegisterResponse extends User {}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}