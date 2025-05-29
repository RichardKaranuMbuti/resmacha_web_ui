// src/components/ui/TextField.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useState } from 'react';

const inputVariants = cva(
  'w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 bg-white focus:border-plum focus:ring-plum/20',
        error: 'border-error bg-white focus:border-error focus:ring-error/20',
        success: 'border-green-500 bg-white focus:border-green-500 focus:ring-green-500/20',
        ghost: 'border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-plum focus:ring-plum/20',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const labelVariants = cva('block text-sm font-medium mb-1', {
  variants: {
    variant: {
      default: 'text-gray-700',
      error: 'text-error',
      success: 'text-green-600',
      ghost: 'text-gray-600',
    },
    required: {
      true: 'after:content-["*"] after:ml-1 after:text-error',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const helperTextVariants = cva('mt-1 text-xs', {
  variants: {
    variant: {
      default: 'text-gray-500',
      error: 'text-error',
      success: 'text-green-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  showPasswordToggle?: boolean;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    variant,
    size,
    label,
    helperText,
    error,
    success,
    required = false,
    leftIcon,
    rightIcon,
    onRightIconClick,
    showPasswordToggle = false,
    type = 'text',
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine the current variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    // Determine input type
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    // Handle password toggle
    const handlePasswordToggle = () => {
      setShowPassword(!showPassword);
    };

    // Determine right icon
    const getRightIcon = () => {
      if (showPasswordToggle && type === 'password') {
        return (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8 8M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        );
      }
      return rightIcon;
    };

    const displayedRightIcon = getRightIcon();

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={labelVariants({ 
              variant: currentVariant, 
              required,
            })}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputVariants({ 
              variant: currentVariant, 
              size, 
              className: [
                leftIcon && 'pl-10',
                displayedRightIcon && 'pr-10',
                className
              ].filter(Boolean).join(' ')
            })}
            onFocus={(e) => {
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {displayedRightIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={onRightIconClick || (showPasswordToggle ? handlePasswordToggle : undefined)}
            >
              {displayedRightIcon}
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <p className={helperTextVariants({ 
            variant: error ? 'error' : success ? 'success' : 'default' 
          })}>
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { inputVariants, TextField };