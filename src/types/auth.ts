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

// Fix for empty interface - use type alias instead
export type RegisterResponse = User;

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

// Define specific types for API error details
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorDetails {
  validation_errors?: ValidationError[];
  timestamp?: string;
  path?: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: ApiErrorDetails;
}

// Additional utility types for auth
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// OAuth-specific types
export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

export interface OAuthLoginRequest {
  provider: 'google';
  token: string;
}

// Password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface PasswordResetResponse {
  message: string;
}

// Profile update types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}