import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  children,
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2.5 font-normal" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-neutral-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-700 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main title & action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500 font-normal">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
