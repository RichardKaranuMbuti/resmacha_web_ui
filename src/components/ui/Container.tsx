// src/components/ui/Container.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',   // 640px
        md: 'max-w-screen-md',   // 768px
        lg: 'max-w-screen-lg',   // 1024px
        xl: 'max-w-screen-xl',   // 1280px
        '2xl': 'max-w-screen-2xl', // 1536px
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-2 sm:px-3 lg:px-4',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-10 lg:px-12',
      },
      centered: {
        true: 'flex flex-col items-center',
      },
    },
    defaultVariants: {
      size: 'lg',
      padding: 'md',
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, centered, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={containerVariants({ size, padding, centered, className })}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

export { Container, containerVariants };
