import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { 
  Server, 
  AlertCircle, 
  Clock, 
  Plus, 
  ArrowRight,
  Activity,
  Radio
} from 'lucide-react';
import { 
  getApplications, 
  getApplicationHealthChecks, 
  getApplicationIncidents 
} from '@/api/applications';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { IncidentBanner } from '@/components/incidents/IncidentBanner';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useRefresh } from '@/context';
import { 
  calculateUptimePercentage, 
  calculateAverageLatency, 
  calculateP95Latency, 
  getLatestCheck 
} from '@/utils/metrics';
import { formatLatency, formatRelativeTime } from '@/utils/formatters';

export const DashboardPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { pollingInterval } = useRefresh();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const basePath = workspaceId ? `/w/${workspaceId}` : '';

  // Fetch all active applications in this workspace
  const {
    data: applications = [],
    isLoading: isLoadingApps,
    isError: isAppsError,
    error: appsError,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['applications', workspaceId],
    queryFn: () => (workspaceId ? getApplications(workspaceId) : Promise.resolve([])),
    enabled: !!workspaceId,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Fetch health checks for all applications in parallel
  const healthCheckQueries = useQueries({
    queries: applications.map((app) => ({
      queryKey: ['health-checks', workspaceId, app.id],
      queryFn: () => (workspaceId ? getApplicationHealthChecks(workspaceId, app.id) : Promise.resolve([])),
      refetchInterval: pollingInterval > 0 ? pollingInterval : false,
      refetchIntervalInBackground: false,
      enabled: !!workspaceId && applications.length > 0,
    })),
  });

  // Fetch incidents for all applications in parallel
  const incidentQueries = useQueries({
    queries: applications.map((app) => ({
      queryKey: ['incidents', workspaceId, app.id],
      queryFn: () => (workspaceId ? getApplicationIncidents(workspaceId, app.id) : Promise.resolve([])),
      refetchInterval: pollingInterval > 0 ? pollingInterval : false,
      refetchIntervalInBackground: false,
      enabled: !!workspaceId && applications.length > 0,
    })),
  });

  // Flatten all health checks
  const allHealthChecks = healthCheckQueries.flatMap((q) => q.data || []);
  const allUptime = calculateUptimePercentage(allHealthChecks);
  const allAvgLatency = calculateAverageLatency(allHealthChecks);
  const allP95Latency = calculateP95Latency(allHealthChecks);

  // Aggregate all active open incidents
  const openIncidentsWithApp = incidentQueries.flatMap((query, index) => {
    const app = applications[index];
    const incidents = query.data || [];
    return incidents
      .filter((inc) => inc.status === 'OPEN')
      .map((incident) => ({ incident, application: app }));
  });

  // Check currently failing services based on latest check
  const currentlyDownServices = applications.filter((_, index) => {
    const checks = healthCheckQueries[index]?.data || [];
    const latestCheck = getLatestCheck(checks);
    return latestCheck?.status === 'DOWN';
  });

  // Fleet health status
  const fleetHealthStatus = openIncidentsWithApp.length > 0
    ? 'OPEN'
    : currentlyDownServices.length > 0
    ? 'DOWN'
    : allUptime < 99 && allHealthChecks.length > 0
    ? 'DEGRADED'
    : 'UP';

  // Prepare chronological health checks for Fleet Health chart (oldest to newest)
  const chartChecks = [...allHealthChecks]
    .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
    .slice(-30);

  if (isLoadingApps) {
    return (
      <div className="space-y-8">
        <PageHeader title="Overview" subtitle="Loading monitoring telemetry..." />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <SkeletonLoader variant="chart" count={1} />
          </div>
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            <SkeletonLoader variant="card" count={4} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (isAppsError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Overview" subtitle="Service health and fleet performance" />
        <ErrorAlert
          title="Could not load applications"
          message={appsError instanceof Error ? appsError.message : 'Failed to communicate with API.'}
          onRetry={() => refetchApps()}
        />
      </div>
    );
  }

  // Calculate SVG chart coordinates for Fleet Health card
  const chartWidth = 540;
  const chartHeight = 110;
  const padX = 12;
  const padY = 14;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY * 2;

  const latencies = chartChecks.map((c) => (typeof c.response_time_ms === 'number' ? c.response_time_ms : 0));
  const maxLat = Math.max(...latencies, 50);
  const minLat = 0;

  const chartPoints = chartChecks.map((check, idx) => {
    const x = padX + (idx / Math.max(chartChecks.length - 1, 1)) * innerW;
    const latency = typeof check.response_time_ms === 'number' ? check.response_time_ms : 0;
    const y = padY + innerH - ((latency - minLat) / (maxLat - minLat || 1)) * innerH;
    return { x, y, latency, check };
  });

  const lineD = chartPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = chartPoints.length > 1
    ? `${lineD} L ${chartPoints[chartPoints.length - 1].x},${chartHeight - padY} L ${chartPoints[0].x},${chartHeight - padY} Z`
    : '';

  const hoveredPoint = hoveredPointIndex !== null ? chartPoints[hoveredPointIndex] : null;

  return (
    <div className="space-y-8">
      {/* Top Header with Add Service CTA */}
      <PageHeader
        title="Overview"
        subtitle="Real-time service health and fleet performance"
        action={
          <Link
            to={`${basePath}/applications/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>New application</span>
          </Link>
        }
      />

      {/* Global Open Incidents Alert Banner */}
      <IncidentBanner openIncidents={openIncidentsWithApp} />

      {/* Overview Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Primary Fleet Health Card */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-[#EAEAEA] bg-white p-6 sm:p-7 shadow-card flex flex-col justify-between relative overflow-hidden">
          {/* Card Top */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-neutral-500">
                Fleet health
              </span>
              <StatusBadge
                status={fleetHealthStatus}
                size="sm"
              />
            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
                {allUptime}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
              Overall uptime across {applications.length} monitored {applications.length === 1 ? 'service' : 'services'}
            </p>
          </div>

          {/* Card Chart Section */}
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-medium text-neutral-600">Response telemetry trend</span>
              <span className="font-mono text-[11px]">
                {allAvgLatency > 0 ? `Avg ${allAvgLatency}ms` : 'Awaiting data'}
              </span>
            </div>

            {chartChecks.length > 1 ? (
              <div className="relative w-full h-[110px] overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full overflow-visible"
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  <defs>
                    <linearGradient id="fleetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Subtle horizontal baseline */}
                  <line
                    x1={padX}
                    y1={chartHeight - padY}
                    x2={chartWidth - padX}
                    y2={chartHeight - padY}
                    stroke="#F0F0F2"
                    strokeWidth="1"
                  />
                  <line
                    x1={padX}
                    y1={padY}
                    x2={chartWidth - padX}
                    y2={padY}
                    stroke="#F0F0F2"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Gradient Area Fill */}
                  <path d={areaD} fill="url(#fleetGradient)" />

                  {/* Line stroke */}
                  <path
                    d={lineD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Point Hits */}
                  {chartPoints.map((pt, idx) => (
                    <g
                      key={pt.check.id}
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      className="cursor-pointer"
                    >
                      <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPointIndex === idx ? 4 : 2}
                        fill={pt.check.status === 'UP' ? '#10B981' : '#EF4444'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>

                {/* Floating tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-1 right-2 bg-neutral-900 text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-dropdown pointer-events-none flex items-center gap-2">
                    <span className={hoveredPoint.check.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>
                      {hoveredPoint.check.status}
                    </span>
                    <span>{formatLatency(hoveredPoint.latency)}</span>
                    <span className="text-neutral-400 font-sans">{formatRelativeTime(hoveredPoint.check.checked_at)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[90px] flex items-center justify-center text-xs text-neutral-400 font-normal">
                Telemetry points will render here as automated health checks run.
              </div>
            )}
          </div>
        </div>

        {/* Compact Supporting Metrics */}
        <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          <MetricCard
            label="Monitored services"
            value={applications.length}
            subtext="Active HTTP check targets"
            icon={<Server className="w-4 h-4" />}
          />
          <MetricCard
            label="Active incidents"
            value={openIncidentsWithApp.length}
            subtext={openIncidentsWithApp.length === 0 ? 'All services operational' : 'Requires attention'}
            icon={<AlertCircle className="w-4 h-4" />}
            statusVariant={openIncidentsWithApp.length > 0 ? 'warning' : 'up'}
          />
          <MetricCard
            label="Average response time"
            value={allAvgLatency > 0 ? `${allAvgLatency}ms` : '—'}
            subtext="Mean fleet latency"
            icon={<Clock className="w-4 h-4" />}
          />
          <MetricCard
            label="P95 latency"
            value={allP95Latency > 0 ? `${allP95Latency}ms` : '—'}
            subtext="95th percentile response"
            icon={<Activity className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Applications Grid Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
              Monitored services
            </h2>
            <span className="text-xs text-neutral-400 font-normal">
              ({applications.length})
            </span>
          </div>
          <Link
            to={`${basePath}/applications`}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications registered yet"
            description="Start monitoring your HTTP services and APIs by registering your first application."
            icon={<Radio className="w-5 h-5 text-neutral-400" />}
            action={{
              label: 'Register application',
              onClick: () => {
                navigate(`${basePath}/applications/new`);
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
