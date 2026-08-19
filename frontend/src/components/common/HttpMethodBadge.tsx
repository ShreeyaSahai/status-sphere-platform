import React from 'react';
import type { HttpMethod } from '@/types/api';

interface HttpMethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export const HttpMethodBadge: React.FC<HttpMethodBadgeProps> = ({
  method,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200/80 ${className}`}
    >
      {method}
    </span>
  );
};
