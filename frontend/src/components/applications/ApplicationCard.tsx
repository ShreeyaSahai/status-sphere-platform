import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, AlertTriangle, Radio } from 'lucide-react';
import type { Application } from '@/types/api';
import { getApplicationHealthChecks, getApplicationIncidents } from '@/api/applications';
import { StatusBadge } from '@/components/common/StatusBadge';
import { HttpMethodBadge } from '@/components/common/HttpMethodBadge';
import { TagPill } from '@/components/common/TagPill';
import { formatLatency, formatRelativeTime } from '@/utils/formatters';
import { getLatestCheck, calculateUptimePercentage, getOpenIncident } from '@/utils/metrics';
import { useRefresh } from '@/context';

interface ApplicationCardProps {
  application: Application;
  className?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  className = '',
}) => {
  const { pollingInterval } = useRefresh();

  // Query health checks for this app
  const { data: healthChecks = [] } = useQuery({
    queryKey: ['health-checks', application.id],
    queryFn: () => getApplicationHealthChecks(application.id),
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Query incidents for this app
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', application.id],
    queryFn: () => getApplicationIncidents(application.id),
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  const latestCheck = getLatestCheck(healthChecks);
  const uptimePercentage = calculateUptimePercentage(healthChecks);
  const openIncident = getOpenIncident(incidents);

  const status = latestCheck ? latestCheck.status : (application.is_active ? 'UP' : 'INACTIVE');

  // Last 24 checks for micro sparkline (chronological oldest to newest)
  const microChecks = [...healthChecks].slice(0, 24).reverse();

  return (
    <div
      className={`group rounded-2xl border border-[#EAEAEA] hover:border-neutral-300 bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top header row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#EAEAEA] flex items-center justify-center text-neutral-600 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <Link to={`/applications/${application.id}`} className="block">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors truncate">
                  {application.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate mt-0.5">
                <HttpMethodBadge method={application.method} />
                <span className="truncate font-mono text-[11px]">{application.url.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={openIncident ? 'OPEN' : status} size="sm" />
            <Link
              to={`/applications/${application.id}`}
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
              aria-label={`View ${application.name} details`}
            >
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Active Incident notice if any */}
        {openIncident && (
          <div className="mb-3.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="truncate font-medium">{openIncident.reason || 'Service degradation active'}</span>
          </div>
        )}

        {/* Key Metrics Numbers */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-neutral-900">{uptimePercentage}%</span>
            <span className="text-xs text-neutral-400">uptime</span>
          </div>
          <div className="text-xs font-mono text-neutral-500 font-medium">
            {formatLatency(latestCheck?.response_time_ms)}
          </div>
        </div>

        {/* Micro Sparkline / Telemetry strip */}
        <div className="mt-2.5">
          <div className="flex items-center gap-[3px] h-2 w-full">
            {microChecks.length > 0 ? (
              microChecks.map((c) => (
                <div
                  key={c.id}
                  className={`flex-1 h-full rounded-full transition-opacity ${
                    c.status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={`${c.status} - ${formatLatency(c.response_time_ms)} (${formatRelativeTime(c.checked_at)})`}
                />
              ))
            ) : (
              <div className="w-full text-center text-[10px] text-neutral-400">
                Awaiting telemetry...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info: Tags & Last Checked */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {application.tags && application.tags.length > 0 ? (
            application.tags.slice(0, 2).map((tag) => (
              <TagPill key={tag} tag={tag} className="text-[10px] py-0 px-1.5" />
            ))
          ) : (
            <span className="text-neutral-400 text-[11px]">No tags</span>
          )}
          {application.tags && application.tags.length > 2 && (
            <span className="text-neutral-400 text-[10px]">+{application.tags.length - 2}</span>
          )}
        </div>

        <div className="text-[11px] text-neutral-400 shrink-0">
          {latestCheck ? formatRelativeTime(latestCheck.checked_at) : 'No checks yet'}
        </div>
      </div>
    </div>
  );
};
