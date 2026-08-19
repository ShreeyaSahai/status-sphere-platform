import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-2',
  }[size];

  return (
    <div
      className={`inline-block animate-spin rounded-full border-neutral-200 border-t-neutral-900 ${sizeClasses} ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
