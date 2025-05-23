// src/components/ui/Alert.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        primary: 'bg-lavender-50 border-lavender-200 text-lavender-800',
        success: 'bg-success/10 border-success/30 text-success',
        error: 'bg-error/10 border-error/30 text-error',
        warning: 'bg-warning/10 border-warning/30 text-warning',
        info: 'bg-info/10 border-info/30 text-info',
        plum: 'bg-plum/10 border-plum/30 text-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, icon, children, dismissible, onDismiss, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={alertVariants({ variant, className })}
        {...props}
      >
        <div className="flex items-start">
          {icon && <span className="mr-3 mt-0.5 flex-shrink-0">{icon}</span>}
          <div className="flex-1">
            {title && <h5 className="mb-1 font-medium">{title}</h5>}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="ml-3 -mt-1 -mr-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-lavender-500"
              aria-label="Dismiss alert"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };
