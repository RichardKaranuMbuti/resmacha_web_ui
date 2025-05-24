// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { ButtonSpinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-plum text-text-primary hover:bg-plum-dark active:bg-plum-dark/90 shadow-sm hover:shadow-md',
        secondary: 'bg-lavender-100 text-lavender-900 hover:bg-lavender-200 active:bg-lavender-300 shadow-sm',
        outline: 'border border-plum bg-transparent text-plum hover:bg-plum/10 active:bg-plum/20 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-lavender-100 text-lavender-800 hover:text-lavender-900 active:bg-lavender-200',
        link: 'text-lavender-700 underline-offset-4 hover:underline p-0 h-auto',
        destructive: 'bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 shadow-sm hover:shadow-md',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-lg',
        icon: 'h-9 w-9 rounded-md',
        'icon-sm': 'h-7 w-7 rounded',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={buttonVariants({ 
          variant, 
          size, 
          fullWidth, 
          loading, 
          className 
        })}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading ? (
          <ButtonSpinner
            variant={
              variant === 'outline' || variant === 'ghost' || variant === 'link' 
                ? 'default' 
                : 'white'
            }
            size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'}
            text={loadingText}
          />
        ) : (
          <>
            {leftIcon && (
              <span className="mr-2 flex-shrink-0">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="ml-2 flex-shrink-0">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button Component
export interface IconButtonProps
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { Button, buttonVariants };
