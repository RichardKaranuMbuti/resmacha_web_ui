// src/components/ui/Avatar.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import React from 'react';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-14 w-14 text-xl',
        '2xl': 'h-16 w-16 text-2xl',
      },
      variant: {
        default: 'bg-lavender-200 text-lavender-800',
        plum: 'bg-plum text-text-primary',
        outline: 'border-2 border-border bg-background',
      },
      status: {
        online: "after:absolute after:bottom-0 after:right-0 after:block after:h-2 after:w-2 after:rounded-full after:bg-success after:ring-2 after:ring-background",
        offline: "after:absolute after:bottom-0 after:right-0 after:block after:h-2 after:w-2 after:rounded-full after:bg-text-tertiary after:ring-2 after:ring-background",
        busy: "after:absolute after:bottom-0 after:right-0 after:block after:h-2 after:w-2 after:rounded-full after:bg-error after:ring-2 after:ring-background",
        away: "after:absolute after:bottom-0 after:right-0 after:block after:h-2 after:w-2 after:rounded-full after:bg-warning after:ring-2 after:ring-background",
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  '2xl': 64,
};

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', variant, status, src, alt, fallback, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(!src);
    const imageSize = sizeMap[size || 'md'];

    return (
      <div
        ref={ref}
        className={avatarVariants({ size, variant, status, className })}
        {...props}
      >
        {src && !hasError ? (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            width={imageSize}
            height={imageSize}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <span className="font-medium">
            {alt
              ? alt
                  .split(' ')
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'U'}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
