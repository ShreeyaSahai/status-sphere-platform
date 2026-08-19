import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'text' | 'chart';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const renderItem = (index: number) => {
    switch (variant) {
      case 'card':
        return (
          <div
            key={index}
            className={`animate-pulse rounded-2xl border border-[#EAEAEA] bg-white p-6 shadow-card ${className}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-5 bg-neutral-100 rounded-full w-16" />
            </div>
            <div className="h-6 bg-neutral-100 rounded w-1/2 mb-3" />
            <div className="h-3 bg-neutral-100/70 rounded w-3/4 mb-4" />
            <div className="h-8 bg-neutral-100/50 rounded w-full" />
          </div>
        );
      case 'table':
        return (
          <div
            key={index}
            className={`animate-pulse flex items-center justify-between py-4 px-6 border-b border-neutral-100 ${className}`}
          >
            <div className="h-4 bg-neutral-100 rounded w-1/4" />
            <div className="h-4 bg-neutral-100 rounded w-1/6" />
            <div className="h-5 bg-neutral-100 rounded-full w-16" />
            <div className="h-4 bg-neutral-100 rounded w-1/12" />
            <div className="h-4 bg-neutral-100 rounded w-1/8" />
          </div>
        );
      case 'chart':
        return (
          <div
            key={index}
            className={`animate-pulse rounded-2xl border border-[#EAEAEA] bg-white p-6 shadow-card ${className}`}
          >
            <div className="h-4 bg-neutral-100 rounded w-1/4 mb-6" />
            <div className="h-48 bg-neutral-100/60 rounded w-full" />
          </div>
        );
      case 'text':
      default:
        return (
          <div key={index} className={`animate-pulse space-y-2.5 ${className}`}>
            <div className="h-4 bg-neutral-100 rounded w-3/4" />
            <div className="h-4 bg-neutral-100/70 rounded w-1/2" />
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => renderItem(index))}
    </>
  );
};
