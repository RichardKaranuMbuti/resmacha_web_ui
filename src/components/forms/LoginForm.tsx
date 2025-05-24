"use client";
// src/components/forms/LoginForm.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import type { ApiError, LoginRequest } from '../../types/auth';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { ErrorModal } from '../ui/Modal';
import { TextField } from '../ui/TextField';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const INITIAL_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
};

export const LoginForm: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      // Redirect to dashboard or intended destination
      const intendedDestination = sessionStorage.getItem('intended_destination') || '/dashboard';
      sessionStorage.removeItem('intended_destination');
      window.location.href = intendedDestination;
    }
  }, [isAuthenticated]);

  // Load saved email if remember me was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Validation rules
  const validateField = (name: keyof LoginFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        return undefined;

      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof LoginFormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof LoginFormData;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  // Handle remember me toggle
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || isLoading) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const loginData: LoginRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await login(loginData);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('remembered_email', loginData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // Success - user will be redirected by the useEffect hook
      
    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      let errorMsg = 'Login failed. Please check your credentials and try again.';
      
      // Handle specific error cases
      if (apiError.status === 401) {
        errorMsg = 'Invalid email or password. Please try again.';
      } else if (apiError.status === 403) {
        errorMsg = 'Your account has been disabled. Please contact support.';
      } else if (apiError.status === 429) {
        errorMsg = 'Too many login attempts. Please try again later.';
      } else if (apiError.status >= 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (apiError.message) {
        errorMsg = apiError.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setShowErrorModal(false);
    // Form remains filled for retry
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Navigate to forgot password page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/forgot-password';
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <>
      <Container size="md" className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            <div className="space-y-4">
              {/* Email */}
              <TextField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="you@example.com"
                required
                disabled={isFormDisabled}
                autoComplete="email"
                autoFocus
              />

              {/* Password */}
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter your password"
                required
                disabled={isFormDisabled}
                showPasswordToggle
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={isFormDisabled}
                  className="h-4 w-4 text-plum focus:ring-plum border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isFormDisabled}
                className="text-sm font-medium text-plum hover:text-plum-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting || isLoading}
              loadingText="Signing In..."
              disabled={isFormDisabled}
              size="lg"
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Social Login Buttons (Optional) */}
            <div className="space-y-3">
              {/* Google Sign In - Uncomment if needed */}
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={isFormDisabled}
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>
            </div>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/signup"
                  className="font-medium text-plum hover:text-plum-dark transition-colors duration-200"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </form>
        </div>
      </Container>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Sign In Failed"
        message={errorMessage}
        actionLabel="Try Again"
        onAction={handleRetry}
      />
    </>
  );
};