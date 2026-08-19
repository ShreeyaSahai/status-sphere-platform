import React from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Menu, RefreshCw, ChevronDown } from 'lucide-react';
import { useRefresh, type PollingInterval } from '@/context';
import { getSystemHealth } from '@/api/health';
import { getApplications, getApplicationIncidents, getApplicationHealthChecks } from '@/api/applications';
import { getLatestCheck } from '@/utils/metrics';
import { formatRelativeTime } from '@/utils/formatters';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const {
    pollingInterval,
    setPollingInterval,
    refreshAll,
    isRefreshing,
    lastRefreshedAt,
  } = useRefresh();

  // Query backend health
  const { data: healthData, isError: isHealthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: getSystemHealth,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  // Query applications
  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Query incidents for all applications
  const incidentQueries = useQueries({
    queries: applications.map((app) => ({
      queryKey: ['incidents', app.id],
      queryFn: () => getApplicationIncidents(app.id),
      refetchInterval: pollingInterval > 0 ? pollingInterval : false,
      refetchIntervalInBackground: false,
      enabled: applications.length > 0,
    })),
  });

  // Query health checks for all applications
  const healthCheckQueries = useQueries({
    queries: applications.map((app) => ({
      queryKey: ['health-checks', app.id],
      queryFn: () => getApplicationHealthChecks(app.id),
      refetchInterval: pollingInterval > 0 ? pollingInterval : false,
      refetchIntervalInBackground: false,
      enabled: applications.length > 0,
    })),
  });

  const openIncidents = incidentQueries.flatMap((query) => {
    const incidents = query.data || [];
    return incidents.filter((inc) => inc.status === 'OPEN');
  });

  const currentlyDownServices = applications.filter((_, index) => {
    const checks = healthCheckQueries[index]?.data || [];
    const latestCheck = getLatestCheck(checks);
    return latestCheck?.status === 'DOWN';
  });

  const isSystemDown = isHealthError || (healthData && healthData.status !== 'healthy' && healthData.status !== 'ok');
  const hasActiveIncidents = openIncidents.length > 0;
  const hasDownServices = currentlyDownServices.length > 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 md:px-8 border-b border-[#EAEAEA] bg-white/80 backdrop-blur-md">
      {/* Left side: mobile toggle & dynamic system status indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic System Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-normal text-neutral-600 bg-[#F7F8FA] border border-[#EAEAEA]">
          <span className="relative flex h-2 w-2">
            {isSystemDown ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            ) : hasActiveIncidents ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </>
            ) : hasDownServices ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </>
            )}
          </span>
          <span className="font-medium text-neutral-700">
            {isSystemDown
              ? 'System disrupted'
              : hasActiveIncidents
              ? openIncidents.length === 1
                ? '1 active incident'
                : `${openIncidents.length} active incidents`
              : hasDownServices
              ? currentlyDownServices.length === 1
                ? '1 service down'
                : `${currentlyDownServices.length} services down`
              : 'All systems operational'}
          </span>
        </div>
      </div>

      {/* Right side: Auto-refresh selector, Refresh button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Polling Interval Selector */}
        <div className="relative inline-flex items-center">
          <select
            value={pollingInterval}
            onChange={(e) => setPollingInterval(Number(e.target.value) as PollingInterval)}
            className="appearance-none bg-white text-neutral-600 hover:text-neutral-900 border border-[#EAEAEA] text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-neutral-400 cursor-pointer shadow-subtle"
            aria-label="Auto-refresh interval"
          >
            <option value={30000}>30s auto</option>
            <option value={15000}>15s auto</option>
            <option value={60000}>60s auto</option>
            <option value={0}>Manual</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Refresh data button */}
        <button
          type="button"
          onClick={() => refreshAll()}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-[#EAEAEA] rounded-lg transition-colors shadow-subtle active:scale-95 disabled:opacity-50"
          title={`Last updated ${formatRelativeTime(lastRefreshedAt.toISOString())}`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900' : 'text-neutral-400'}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
};
