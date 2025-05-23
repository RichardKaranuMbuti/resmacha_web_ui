// src/components/ui/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-lavender-500 text-white',
        secondary: 'bg-lavender-100 text-lavender-800',
        outline: 'border border-lavender-300 text-lavender-700',
        plum: 'bg-plum text-text-primary',
        success: 'bg-success/20 text-success',
        error: 'bg-error/20 text-error',
        warning: 'bg-warning/20 text-warning',
        info: 'bg-info/20 text-info',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, size, ...props }: BadgeProps) => {
  return (
    <div className={badgeVariants({ variant, size, className })} {...props} />
  );
};

export { Badge, badgeVariants };
