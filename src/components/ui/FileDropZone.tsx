// src/components/ui/FileDropZone.tsx
import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { validateResumeFile, handleFileDrop } from '@src/utils/fileUtils';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  isUploading = false,
  disabled = false,
  className = '',
  accept = '.pdf'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = useCallback((file: File) => {
    const validation = validateResumeFile(file);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const file = handleFileDrop(e.nativeEvent);
    if (file) {
      handleFileSelection(file);
    }
  }, [disabled, isUploading, handleFileSelection]);

  const handleDragOverEvent = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelection]);

  const getStateClasses = () => {
    if (disabled) return 'bg-gray-50 border-gray-200 cursor-not-allowed';
    if (isUploading) return 'bg-blue-50 border-blue-200 cursor-wait';
    if (isDragOver) return 'bg-blue-50 border-blue-400 border-solid';
    return 'bg-white border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer';
  };

  const getIconColor = () => {
    if (disabled) return 'text-gray-400';
    if (isUploading || isDragOver) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOverEvent}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          w-full p-8 border-2 border-dashed rounded-lg transition-all duration-200
          ${getStateClasses()}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div className={`transition-colors duration-200 ${getIconColor()}`}>
            {isUploading ? (
              <div className="animate-spin">
                <Upload size={48} />
              </div>
            ) : (
              <FileText size={48} />
            )}
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h3 className={`text-lg font-medium ${
              disabled ? 'text-gray-400' : 'text-gray-900'
            }`}>
              {isUploading ? 'Uploading...' : 'Drop your resume here'}
            </h3>
            
            {!isUploading && (
              <p className={`text-sm ${
                disabled ? 'text-gray-400' : 'text-gray-600'
              }`}>
                or <span className="text-blue-600 font-medium">click to browse</span>
              </p>
            )}
            
            <p className={`text-xs ${
              disabled ? 'text-gray-400' : 'text-gray-500'
            }`}>
              PDF files only, max 10MB
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};