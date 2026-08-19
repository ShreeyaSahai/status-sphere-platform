import React from 'react';
import { Layers } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-10 sm:p-12 rounded-2xl border border-dashed border-[#EAEAEA] bg-white shadow-card ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F7F8FA] text-neutral-500 mb-4 border border-[#EAEAEA]">
        {icon || <Layers className="w-5 h-5 text-neutral-400" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
