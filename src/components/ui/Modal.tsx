// src/components/ui/Modal.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

// Note: In a real project, you would use a library like @headlessui/react
// This is a simplified version for demonstration purposes

const modalOverlayVariants = cva(
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
  {
    variants: {
      center: {
        true: 'items-center',
        false: 'items-start pt-16',
      },
    },
    defaultVariants: {
      center: true,
    },
  }
);

const modalContentVariants = cva(
  'bg-background rounded-lg shadow-xl relative overflow-hidden max-h-[90vh] flex flex-col',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        md: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        full: 'max-w-full w-full',
      },
      fullHeight: {
        true: 'h-[90vh]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  center?: boolean;
  closeOnOverlayClick?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    isOpen,
    onClose,
    title,
    description,
    size,
    className,
    children,
    center = true,
    fullHeight = false,
    closeOnOverlayClick = true,
    ...props
  }, ref) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    return (
      <div
        className={modalOverlayVariants({ center })}
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          ref={ref}
          className={modalContentVariants({ size, fullHeight, className })}
          {...props}
        >
          {/* Modal Header */}
          {(title || description) && (
            <div className="border-b border-border p-4">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-text-secondary text-sm mt-1">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-lavender-100 text-lavender-900 hover:bg-lavender-200"
            aria-label="Close modal"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="p-4 overflow-auto flex-1">{children}</div>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

export { Modal };
