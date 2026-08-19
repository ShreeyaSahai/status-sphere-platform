import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Incident, Application } from '@/types/api';

interface IncidentBannerProps {
  openIncidents: { incident: Incident; application: Application }[];
  className?: string;
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({
  openIncidents,
  className = '',
}) => {
  if (openIncidents.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5 shadow-card ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-800">
                Active disruption{openIncidents.length > 1 ? 's' : ''} ({openIncidents.length})
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
              {openIncidents.length === 1 ? (
                <span>
                  <strong className="font-semibold text-neutral-900">{openIncidents[0].application.name}</strong> is currently experiencing downtime: {openIncidents[0].incident.reason || 'Health check failure'}
                </span>
              ) : (
                <span>
                  {openIncidents.map((i) => i.application.name).join(', ')} are currently experiencing service degradation.
                </span>
              )}
            </p>
          </div>
        </div>

        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-100/90 hover:bg-amber-200/80 border border-amber-200 rounded-lg transition-colors shadow-subtle shrink-0 self-start sm:self-auto"
        >
          <span>View incidents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
