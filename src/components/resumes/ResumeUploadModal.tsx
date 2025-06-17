// src/components/resumes/ResumeUploadModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { ResumeUpload } from './ResumeUpload';
import type { Resume } from '@src/types/resume';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (resume: Resume) => void;
  onUploadError?: (error: string) => void;
  title?: string;
  description?: string;
  showDescription?: boolean;
  closeOnSuccess?: boolean;
  maxDescriptionLength?: number;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError,
  title = 'Upload Resume',
  description = 'Upload a PDF file of your resume to get started.',
  showDescription = true,
  closeOnSuccess = false,
  maxDescriptionLength = 200
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal close with animation - wrapped in useCallback
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  // Handle successful upload
  const handleUploadSuccess = useCallback((resume: Resume) => {
    onUploadSuccess?.(resume);
    
    if (closeOnSuccess) {
      handleClose();
    }
  }, [onUploadSuccess, closeOnSuccess, handleClose]);

  // Handle upload error
  const handleUploadError = useCallback((error: string) => {
    onUploadError?.(error);
  }, [onUploadError]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 transition-opacity duration-200
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto
          transform transition-all duration-200
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                     rounded-full transition-colors"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            showDescription={showDescription}
            maxDescriptionLength={maxDescriptionLength}
          />
        </div>

        {/* Modal Footer (optional additional actions) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Supported formats: PDF (max 10MB)</span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Press ESC to close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified version without footer
export const SimpleResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError,
  title = 'Upload Resume',
  description,
  showDescription = true,
  closeOnSuccess = true,
  maxDescriptionLength = 200
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal close with animation - wrapped in useCallback
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  const handleUploadSuccess = useCallback((resume: Resume) => {
    onUploadSuccess?.(resume);
    
    if (closeOnSuccess) {
      handleClose();
    }
  }, [onUploadSuccess, closeOnSuccess, handleClose]);

  const handleUploadError = useCallback((error: string) => {
    onUploadError?.(error);
  }, [onUploadError]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 transition-opacity duration-200
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl w-full max-w-xl
          transform transition-all duration-200
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                     rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {description && (
            <p className="text-sm text-gray-600 mb-6">
              {description}
            </p>
          )}
          
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            showDescription={showDescription}
            maxDescriptionLength={maxDescriptionLength}
          />
        </div>
      </div>
    </div>
  );
};