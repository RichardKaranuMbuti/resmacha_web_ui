// src/components/ui/Button.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-plum text-text-primary hover:bg-plum-dark',
        secondary: 'bg-lavender-100 text-lavender-900 hover:bg-lavender-200',
        outline: 'border border-plum bg-transparent text-plum hover:bg-plum/10',
        ghost: 'hover:bg-lavender-100 text-lavender-800 hover:text-lavender-900',
        link: 'text-lavender-700 underline-offset-4 hover:underline',
        destructive: 'bg-error text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 rounded-md',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 rounded-lg',
        icon: 'h-9 w-9',
      },
      fullWidth: {
        true: 'w-full',
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, fullWidth, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
