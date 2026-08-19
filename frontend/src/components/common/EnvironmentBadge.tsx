import React from 'react';

interface EnvironmentBadgeProps {
  environment: string;
  className?: string;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({
  environment,
  className = '',
}) => {
  const env = environment.toLowerCase();

  const getStyles = () => {
    if (env.includes('prod')) {
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    }
    if (env.includes('stag')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
    return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide uppercase border ${getStyles()} ${className}`}
    >
      {environment}
    </span>
  );
};
