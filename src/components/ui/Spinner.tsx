// src/components/ui/Spinner.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border-[1px]',
        sm: 'h-4 w-4 border-[1.5px]',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-3',
        '2xl': 'h-16 w-16 border-4',
      },
      variant: {
        default: 'border-plum',
        primary: 'border-plum',
        secondary: 'border-lavender-600',
        white: 'border-white',
        dark: 'border-gray-800',
        light: 'border-gray-300',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const containerVariants = cva('flex items-center justify-center', {
  variants: {
    fullScreen: {
      true: 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50',
      false: '',
    },
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    fullScreen: false,
    padding: 'none',
  },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  fullScreen?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    size,
    variant,
    fullScreen = false,
    padding = 'none',
    label = 'Loading...',
    showLabel = false,
    ...props
  }, ref) => {
    const spinnerElement = (
      <div className="flex flex-col items-center gap-2">
        <div
          className={spinnerVariants({ size, variant, className })}
          role="status"
          aria-label={label}
        />
        {showLabel && (
          <span className="text-sm text-gray-600 animate-pulse">
            {label}
          </span>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={containerVariants({ fullScreen: true, padding })}
          {...props}
        >
          {spinnerElement}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={containerVariants({ fullScreen: false, padding, className })}
        {...props}
      >
        {spinnerElement}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Button Spinner - for use inside buttons
export interface ButtonSpinnerProps
  extends Omit<SpinnerProps, 'fullScreen' | 'padding' | 'showLabel'> {
  text?: string;
}

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  size = 'sm',
  variant = 'white',
  text,
  className,
  ...props
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={spinnerVariants({ size, variant, className })}
        role="status"
        aria-label="Loading"
        {...props}
      />
      {text && <span>{text}</span>}
    </div>
  );
};

export { Spinner, spinnerVariants };
