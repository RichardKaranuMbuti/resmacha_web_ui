// src/components/ui/Select.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const selectVariants = cva(
  'flex w-full appearance-none rounded-md border bg-background pr-8 pl-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border',
        lavender: 'border-lavender-300 focus-visible:border-lavender-500',
        plum: 'border-plum focus-visible:border-plum-dark',
        error: 'border-error focus-visible:border-error focus-visible:ring-error',
      },
      size: {
        sm: 'h-8 text-xs px-2.5',
        md: 'h-10',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  optionGroups?: Array<{
    label: string;
    options: Array<{
      value: string;
      label: string;
      disabled?: boolean;
    }>;
  }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant,
    size,
    label,
    helperText,
    error,
    fullWidth = true,
    options,
    optionGroups,
    ...props
  }, ref) => {
    // If there's an error, override variant
    const effectiveVariant = error ? 'error' : variant;
    
    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {label && (
          <label
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectVariants({
              variant: effectiveVariant,
              size,
              className,
            })}
            {...props}
          >
            {optionGroups
              ? optionGroups.map((group, index) => (
                  <optgroup key={index} label={group.label}>
                    {group.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              : options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-4 w-4 text-text-tertiary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {(helperText || error) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select, selectVariants };
