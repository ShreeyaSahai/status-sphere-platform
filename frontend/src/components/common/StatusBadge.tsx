import React from 'react';
import type { HealthStatus, IncidentStatus } from '@/types/api';

export type CombinedStatus = HealthStatus | IncidentStatus | 'ACTIVE' | 'INACTIVE' | 'DEGRADED';

interface StatusBadgeProps {
  status: CombinedStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-xs px-3 py-1 gap-2 font-medium',
  }[size];

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  }[size];

  const getStyles = () => {
    switch (status) {
      case 'UP':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
          dot: 'bg-emerald-500',
          label: 'Operational',
        };
      case 'DOWN':
        return {
          badge: 'bg-rose-50 text-rose-700 border border-rose-200/70',
          dot: 'bg-rose-500',
          label: 'Down',
        };
      case 'DEGRADED':
        return {
          badge: 'bg-amber-50 text-amber-800 border border-amber-200/70',
          dot: 'bg-amber-500',
          label: 'Degraded',
        };
      case 'OPEN':
        return {
          badge: 'bg-amber-50 text-amber-800 border border-amber-200/70',
          dot: 'bg-amber-500',
          label: 'Open incident',
        };
      case 'RESOLVED':
        return {
          badge: 'bg-blue-50 text-blue-700 border border-blue-200/70',
          dot: 'bg-blue-500',
          label: 'Resolved',
        };
      case 'ACTIVE':
        return {
          badge: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
          dot: 'bg-emerald-500',
          label: 'Active',
        };
      case 'INACTIVE':
        return {
          badge: 'bg-neutral-100 text-neutral-400 border border-neutral-200',
          dot: 'bg-neutral-400',
          label: 'Paused',
        };
      default:
        return {
          badge: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
          dot: 'bg-neutral-400',
          label: String(status),
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={`inline-flex items-center rounded-full font-normal transition-colors ${sizeClasses} ${style.badge} ${className}`}
    >
      {showDot && (
        <span className={`inline-block rounded-full shrink-0 ${dotSizeClasses} ${style.dot}`} />
      )}
      <span>{style.label}</span>
    </span>
  );
};
