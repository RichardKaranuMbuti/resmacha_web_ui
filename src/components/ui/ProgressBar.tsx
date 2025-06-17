// src/components/ui/ProgressBar.tsx
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showPercentage = true,
  showIcon = true,
  animated = true,
  className = '',
  label
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const isComplete = clampedProgress === 100;
  const hasError = variant === 'error';
  const isLoading = clampedProgress > 0 && clampedProgress < 100 && !hasError;

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-1',
      text: 'text-xs',
      icon: 14
    },
    md: {
      height: 'h-2',
      text: 'text-sm',
      icon: 16
    },
    lg: {
      height: 'h-3',
      text: 'text-base',
      icon: 18
    }
  };

  const config = sizeConfig[size];

  // Color configurations
  const getColorClasses = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-100',
          fill: 'bg-green-500',
          text: 'text-green-700',
          icon: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          fill: 'bg-red-500',
          text: 'text-red-700',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          fill: 'bg-yellow-500',
          text: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      default:
        return {
          bg: 'bg-gray-200',
          fill: 'bg-blue-500',
          text: 'text-gray-700',
          icon: 'text-blue-500'
        };
    }
  };

  const colors = getColorClasses();

  // Get appropriate icon
  const getIcon = () => {
    if (hasError) return XCircle;
    if (isComplete) return CheckCircle;
    if (isLoading) return Loader2;
    return null;
  };

  const IconComponent = getIcon();

  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage row */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className={`font-medium ${colors.text} ${config.text}`}>
              {label}
            </span>
          )}
          
          {showPercentage && (
            <div className="flex items-center space-x-2">
              {showIcon && IconComponent && (
                <IconComponent 
                  size={config.icon} 
                  className={`
                    ${colors.icon} 
                    ${isLoading && animated ? 'animate-spin' : ''}
                  `} 
                />
              )}
              <span className={`font-medium ${colors.text} ${config.text}`}>
                {hasError ? 'Error' : `${Math.round(clampedProgress)}%`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={`
        w-full rounded-full overflow-hidden
        ${colors.bg} ${config.height}
      `}>
        <div
          className={`
            ${config.height} rounded-full transition-all duration-300 ease-out
            ${colors.fill}
            ${animated && isLoading ? 'animate-pulse' : ''}
          `}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Compact version without label
export const CompactProgressBar: React.FC<Omit<ProgressBarProps, 'label'>> = (props) => {
  return <ProgressBar {...props} label={undefined} />;
};

// Circular progress variant
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'error' | 'warning';
  showPercentage?: boolean;
  className?: string;
}> = ({
  progress,
  size = 40,
  strokeWidth = 3,
  variant = 'default',
  showPercentage = true,
  className = ''
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  const getStrokeColor = () => {
    switch (variant) {
      case 'success': return 'stroke-green-500';
      case 'error': return 'stroke-red-500';
      case 'warning': return 'stroke-yellow-500';
      default: return 'stroke-blue-500';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-300 ease-out ${getStrokeColor()}`}
        />
      </svg>
      
      {showPercentage && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          text-xs font-semibold ${getTextColor()}
        `}>
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};