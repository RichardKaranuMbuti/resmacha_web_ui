"use client";
// src/components/forms/SignupForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import type { ApiError, RegisterRequest } from '../../types/auth';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { ErrorModal, SuccessModal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { TextField } from '../ui/TextField';

interface SignupFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  confirmPassword?: string;
}

// Define types for API error details
interface ValidationError {
  msg?: string;
  message?: string;
  field?: string;
  type?: string;
}

interface ApiErrorDetails {
  detail?: string | ValidationError[] | Record<string, unknown>;
  message?: string;
  errors?: ValidationError[];
}

// Extend the ApiError type to include better typing for details
interface TypedApiError extends Omit<ApiError, 'details'> {
  details?: ApiErrorDetails;
}

const INITIAL_FORM_DATA: SignupFormData = {
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  password: '',
  confirmPassword: '',
};

export const SignupForm: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState('');

  // Validation rules
  const validateField = (name: keyof SignupFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return undefined;

      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return undefined;

      case 'first_name':
        if (!value.trim()) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        if (value.length > 50) return 'First name must be less than 50 characters';
        return undefined;

      case 'last_name':
        if (!value.trim()) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        if (value.length > 50) return 'Last name must be less than 50 characters';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 128) return 'Password must be less than 128 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>¡¿])/.test(value)) return 'Password must contain at least one special character';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;

      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof SignupFormData>).forEach((key) => {
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
    const fieldName = name as keyof SignupFormData;
    
    // Clear any inline messages when user starts typing
    if (inlineError) setInlineError('');
    if (inlineSuccess) setInlineSuccess('');
    
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

    // Validate confirm password in real-time if password changes
    if (fieldName === 'password' && formData.confirmPassword) {
      const confirmPasswordError = formData.confirmPassword !== value ? 'Passwords do not match' : undefined;
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }

    // Validate confirm password field in real-time
    if (fieldName === 'confirmPassword') {
      const confirmPasswordError = value !== formData.password ? 'Passwords do not match' : undefined;
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  };

  // Type guard to check if a value is a string
  const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };

  // Type guard to check if a value is a ValidationError
  const isValidationError = (value: unknown): value is ValidationError => {
    return (
      typeof value === 'object' && 
      value !== null && 
      ('msg' in value || 'message' in value)
    );
  };

  // Parse API error messages with proper typing
  const parseApiError = (error: TypedApiError): string => {
    console.log('Full API Error:', error); // Debug log
    
    // Handle specific error cases based on your API responses
    if (error.status === 409) {
      return 'An account with this email or username already exists.';
    }
    
    if (error.status === 422) {
      // Handle validation errors from backend
      if (error.details?.detail) {
        if (Array.isArray(error.details.detail)) {
          const validationErrors = error.details.detail
            .filter(isValidationError)
            .map((err: ValidationError) => err.msg || err.message || 'Validation error')
            .filter(Boolean);
          
          if (validationErrors.length > 0) {
            return validationErrors.join(', ');
          }
        }
        
        if (isString(error.details.detail)) {
          return error.details.detail;
        }
      }
      
      return 'Please check your information and try again.';
    }
    
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Failed to create account. Please try again.';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submitted - starting validation');
    
    // Clear any previous messages
    setInlineError('');
    setInlineSuccess('');
    
    // Prevent double submission
    if (isSubmitting || isLoading) {
      console.log('⏸️ Already submitting or loading, preventing duplicate submission');
      return;
    }

    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      setInlineError('Please fix the errors above and try again.');
      return;
    }

    console.log('✅ Form validation passed');
    setIsSubmitting(true);

    try {
      // Show immediate feedback
      setInlineSuccess('Creating your account...');
      
      // Prepare data for API
      const registerData: RegisterRequest = {
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
      };

      console.log('🚀 Calling register with data:', { 
        ...registerData, 
        password: '[HIDDEN]' 
      });

      // IMPORTANT: Make sure register function is called properly
      await register(registerData);
      
      console.log('✅ Registration completed successfully');
      
      // Success feedback
      setInlineSuccess('Account created successfully! Redirecting...');
      setShowSuccessModal(true);
      
      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setErrors({});

    } catch (error) {
      console.error('❌ Signup error:', error);
      
      const apiError = error as TypedApiError;
      const errorMsg = parseApiError(apiError);
      
      console.log('📝 Parsed error message:', errorMsg);
      
      setErrorMessage(errorMsg);
      setInlineError(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Registration process completed');
    }
  };

  // Handle success modal close - user is already logged in at this point
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect to dashboard or home page
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'; // Adjust redirect as needed
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setShowErrorModal(false);
    setInlineError('');
    // Form remains filled for retry
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <>
      <Container size="md" className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join us today and get started
            </p>
          </div>

          {/* Inline Status Messages */}
          {inlineError && (
            <Alert 
              variant="error" 
              dismissible 
              onDismiss={() => setInlineError('')}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            >
              {inlineError}
            </Alert>
          )}

          {inlineSuccess && (
            <Alert 
              variant="success"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              {inlineSuccess}
            </Alert>
          )}

          {/* Loading Spinner */}
          {isSubmitting && (
            <div className="flex justify-center">
              <Spinner size="lg" showLabel label="Creating your account..." />
            </div>
          )}

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
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />

              {/* Username */}
              <TextField
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="username"
                required
                disabled={isFormDisabled}
                helperText="3-20 characters, letters, numbers, and underscores only"
                autoComplete="username"
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />

              {/* First Name */}
              <TextField
                label="First Name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                error={errors.first_name}
                placeholder="John"
                required
                disabled={isFormDisabled}
                autoComplete="given-name"
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />

              {/* Last Name */}
              <TextField
                label="Last Name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                error={errors.last_name}
                placeholder="Doe"
                required
                disabled={isFormDisabled}
                autoComplete="family-name"
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
                autoComplete="new-password"
                helperText="At least 8 characters with uppercase, lowercase, number, and special character"
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                style={{ color: '#111827' }} // Force dark text for better visibility
              />

              {/* Confirm Password */}
              <TextField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                required
                disabled={isFormDisabled}
                showPasswordToggle
                autoComplete="new-password"
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                style={{ color: '#111827' }} // Force dark text for better visibility
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting || isLoading}
              loadingText="Creating Account..."
              disabled={isFormDisabled}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="sm" variant="white" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in here
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
        title="Signup Failed"
        message={errorMessage}
        actionLabel="Try Again"
        onAction={handleRetry}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Welcome!"
        message="Account created successfully! You are now logged in and ready to get started."
        actionLabel="Continue to Dashboard"
        onAction={handleSuccessClose}
      />
    </>
  );
};