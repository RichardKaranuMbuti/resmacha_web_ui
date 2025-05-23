// src/components/ui/Toggle.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const toggleVariants = cva(
  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-text-tertiary data-[state=checked]:bg-lavender-600',
        plum: 'bg-text-tertiary data-[state=checked]:bg-plum',
        success: 'bg-text-tertiary data-[state=checked]:bg-success',
        error: 'bg-text-tertiary data-[state=checked]:bg-error',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const toggleThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-3.5 w-3.5 data-[state=checked]:translate-x-4',
        md: 'h-4.5 w-4.5 data-[state=checked]:translate-x-5',
        lg: 'h-5.5 w-5.5 data-[state=checked]:translate-x-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof toggleVariants> {
  label?: string;
  helperText?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, variant, size, label, helperText, checked, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="flex items-center">
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="sr-only"
            checked={checked}
            {...props}
          />
          <label
            htmlFor={id}
            className={toggleVariants({ variant, size, className })}
            data-state={checked ? 'checked' : 'unchecked'}
          >
            <span
              className={toggleThumbVariants({ size })}
              data-state={checked ? 'checked' : 'unchecked'}
              style={{
                transform: checked
                  ? size === 'sm'
                    ? 'translateX(1rem)'
                    : size === 'lg'
                    ? 'translateX(1.25rem)'
                    : 'translateX(1.125rem)'
                  : 'translateX(0.125rem)',
              }}
            />
            <span className="sr-only">{label || 'Toggle'}</span>
          </label>
        </div>
        {(label || helperText) && (
          <div className="ml-3">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-text-primary">
                {label}
              </label>
            )}
            {helperText && (
              <p className="text-xs text-text-secondary mt-0.5">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
