import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Failed to load data',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-rose-200/80 bg-rose-50/60 text-rose-900 shadow-card ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-950">{title}</h4>
          <p className="text-xs text-rose-800/80 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-100 hover:bg-rose-200/80 text-rose-900 rounded-lg border border-rose-200 transition-colors shrink-0 shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
