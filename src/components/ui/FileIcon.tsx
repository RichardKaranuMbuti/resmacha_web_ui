// src/components/ui/FileIcon.tsx
import React from 'react';
import { FileText, File, AlertTriangle } from 'lucide-react';
import { SUPPORTED_FILE_TYPES } from '@src/utils/fileUtils';

interface FileIconProps {
  fileName?: string;
  contentType?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  fileName = '',
  contentType = '',
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  // Size mappings
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const iconSize = sizeMap[size];

  // Get appropriate icon based on file type
  const getIcon = () => {
    // Check by content type first
    if (contentType === SUPPORTED_FILE_TYPES.PDF) {
      return FileText;
    }

    // Check by file extension as fallback
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  // Get color classes based on variant
  const getColorClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get background classes for container (optional styling)
  // const getBackgroundClasses = () => {
  //   switch (variant) {
  //     case 'success':
  //       return 'bg-green-50';
  //     case 'error':
  //       return 'bg-red-50';
  //     case 'warning':
  //       return 'bg-yellow-50';
  //     default:
  //       return 'bg-gray-50';
  //   }
  // };

  const IconComponent = getIcon();
  const colorClasses = getColorClasses();

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {variant === 'error' ? (
        <div className="relative">
          <IconComponent size={iconSize} className={colorClasses} />
          <AlertTriangle 
            size={Math.max(12, iconSize * 0.6)} 
            className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full"
          />
        </div>
      ) : (
        <IconComponent size={iconSize} className={colorClasses} />
      )}
    </div>
  );
};

// Alternative version with background circle
export const FileIconWithBackground: React.FC<FileIconProps> = ({
  fileName = '',
  contentType = '',
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 14, container: 'w-7 h-7' },
    md: { icon: 18, container: 'w-9 h-9' },
    lg: { icon: 22, container: 'w-11 h-11' },
    xl: { icon: 28, container: 'w-14 h-14' }
  };

  const { icon: iconSize, container: containerSize } = sizeMap[size];

  const getIcon = () => {
    if (contentType === SUPPORTED_FILE_TYPES.PDF) {
      return FileText;
    }

    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'success':
        return {
          icon: 'text-green-600',
          bg: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: 'text-red-600',
          bg: 'bg-red-50 border-red-200'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          bg: 'bg-yellow-50 border-yellow-200'
        };
      default:
        return {
          icon: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const IconComponent = getIcon();
  const colors = getColorClasses();

  return (
    <div className={`
      ${containerSize} 
      rounded-full border 
      ${colors.bg} 
      flex items-center justify-center 
      transition-colors duration-200
      ${className}
    `}>
      {variant === 'error' ? (
        <div className="relative">
          <IconComponent size={iconSize} className={colors.icon} />
          <AlertTriangle 
            size={Math.max(8, iconSize * 0.4)} 
            className="absolute -top-0.5 -right-0.5 text-red-500 bg-white rounded-full"
          />
        </div>
      ) : (
        <IconComponent size={iconSize} className={colors.icon} />
      )}
    </div>
  );
};