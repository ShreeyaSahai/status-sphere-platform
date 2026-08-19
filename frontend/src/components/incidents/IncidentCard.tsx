import React from 'react';
import { Clock, Radio } from 'lucide-react';
import type { Incident, Application } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatRelativeTime, formatDuration } from '@/utils/formatters';
import { Link } from 'react-router-dom';

interface IncidentCardProps {
  incident: Incident;
  application?: Application;
  className?: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  application,
  className = '',
}) => {
  const isOpen = incident.status === 'OPEN';
  const duration = formatDuration(incident.started_at, incident.resolved_at);

  return (
    <div
      className={`py-4 sm:py-5 first:pt-2 last:pb-2 border-b border-[#F0F0F2] last:border-b-0 transition-colors ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Status Dot & Content */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Status Indicator Dot */}
          <div className="mt-1.5 shrink-0">
            {isOpen ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            )}
          </div>

          <div className="min-w-0">
            {/* Title & App Name */}
            <div className="flex flex-wrap items-center gap-2">
              {application ? (
                <Link
                  to={`/applications/${application.id}`}
                  className="text-sm font-semibold text-neutral-900 hover:text-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{application.name}</span>
                </Link>
              ) : (
                <span className="text-sm font-semibold text-neutral-900">Unknown service</span>
              )}
              <span className="text-neutral-300 hidden sm:inline">•</span>
              <span className="text-xs text-neutral-400 font-normal">
                {formatRelativeTime(incident.started_at)}
              </span>
            </div>

            {/* Incident Reason */}
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              {incident.reason || 'Service health check failure or timeout encountered.'}
            </p>

            {/* Micro Details Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-neutral-400 font-mono">
              <div>
                <span>Started: </span>
                <span className="text-neutral-600">{formatDate(incident.started_at)}</span>
              </div>
              <div>
                <span>Resolved: </span>
                {incident.resolved_at ? (
                  <span className="text-neutral-600">{formatDate(incident.resolved_at)} ({formatRelativeTime(incident.resolved_at)})</span>
                ) : (
                  <span className="text-amber-700 font-medium font-sans">Active ongoing</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Badge & Duration */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 self-start">
          <StatusBadge status={incident.status} size="sm" />
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{isOpen ? `Active for ${duration}` : `Downtime: ${duration}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
