import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  statusVariant?: 'default' | 'up' | 'down' | 'warning' | 'info';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  statusVariant = 'default',
  className = '',
}) => {
  const getBadge = () => {
    switch (statusVariant) {
      case 'up':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
      case 'down':
        return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />;
      case 'warning':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />;
      case 'info':
        return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#EAEAEA] bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-500">
          {label}
        </span>
        {icon ? (
          <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
            {icon}
          </div>
        ) : (
          getBadge()
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </span>
          {icon && getBadge()}
        </div>
        {subtext && (
          <div className="mt-1 text-xs text-neutral-400 font-normal">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
