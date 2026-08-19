import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Globe, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Activity, 
  Clock, 
  Zap, 
  Radio,
  AlertCircle,
  ListFilter
} from 'lucide-react';
import { 
  getApplications, 
  getApplicationHealthChecks, 
  getApplicationIncidents, 
  deleteApplication 
} from '@/api/applications';
import type { Application } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { HttpMethodBadge } from '@/components/common/HttpMethodBadge';
import { TagPill } from '@/components/common/TagPill';
import { MetricCard } from '@/components/common/MetricCard';
import { UptimeBarStrip } from '@/components/metrics/UptimeBarStrip';
import { LatencyChart } from '@/components/metrics/LatencyChart';
import { IncidentList } from '@/components/incidents/IncidentList';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { useRefresh } from '@/context';
import { 
  formatDate, 
  formatRelativeTime, 
  formatLatency, 
  formatStatusCode 
} from '@/utils/formatters';
import { 
  calculateUptimePercentage, 
  calculateAverageLatency, 
  calculateP95Latency,
  getLatestCheck,
  getOpenIncident 
} from '@/utils/metrics';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pollingInterval } = useRefresh();

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'incidents' | 'logs'>('metrics');

  // Fetch applications list to find this application
  const {
    data: applications = [],
    isLoading: isLoadingApps,
    isError: isAppsError,
    error: appsError,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  const application: Application | undefined = applications.find((a) => a.id === id);

  // Fetch health checks for this app
  const {
    data: healthChecks = [],
  } = useQuery({
    queryKey: ['health-checks', id],
    queryFn: () => (id ? getApplicationHealthChecks(id) : Promise.resolve([])),
    enabled: !!id,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Fetch incidents for this app
  const {
    data: incidents = [],
  } = useQuery({
    queryKey: ['incidents', id],
    queryFn: () => (id ? getApplicationIncidents(id) : Promise.resolve([])),
    enabled: !!id,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: () => (id ? deleteApplication(id) : Promise.resolve()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate('/applications');
    },
  });

  if (isLoadingApps) {
    return (
      <div className="space-y-8">
        <SkeletonLoader variant="card" count={2} />
        <SkeletonLoader variant="chart" count={1} />
      </div>
    );
  }

  if (isAppsError) {
    return (
      <ErrorAlert
        title="Failed to load application"
        message={appsError instanceof Error ? appsError.message : 'Error fetching application details.'}
      />
    );
  }

  if (!application) {
    return (
      <EmptyState
        title="Application not found"
        description="The requested service was not found or has been deactivated."
        icon={<Radio className="w-5 h-5 text-neutral-400" />}
        action={{
          label: 'Back to applications',
          onClick: () => navigate('/applications'),
        }}
      />
    );
  }

  const latestCheck = getLatestCheck(healthChecks);
  const uptime = calculateUptimePercentage(healthChecks);
  const avgLatency = calculateAverageLatency(healthChecks);
  const p95Latency = calculateP95Latency(healthChecks);
  const openIncident = getOpenIncident(incidents);

  const status = latestCheck ? latestCheck.status : (application.is_active ? 'UP' : 'INACTIVE');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={application.name}
        breadcrumbs={[
          { label: 'Overview', to: '/' },
          { label: 'Applications', to: '/applications' },
          { label: application.name },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <Link
              to={`/applications/${application.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-[#EAEAEA] rounded-lg transition-colors shadow-subtle"
            >
              <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Edit configuration</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsDeactivateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-[#EAEAEA] rounded-lg transition-colors shadow-subtle"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Deactivate</span>
            </button>
          </div>
        }
      >
        {/* Service Meta Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <HttpMethodBadge method={application.method} />
            <StatusBadge status={openIncident ? 'OPEN' : status} size="md" />
          </div>

          <span className="text-neutral-300">•</span>

          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 transition-colors font-mono text-[11px]"
          >
            <Globe className="w-3 h-3 text-neutral-400" />
            <span className="truncate max-w-xs">{application.url}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>

          <span className="text-neutral-300">•</span>

          <span>Interval: <strong className="text-neutral-700 font-medium">{application.check_interval_seconds}s</strong></span>

          <span className="text-neutral-300">•</span>

          <span>Timeout: <strong className="text-neutral-700 font-medium">{application.timeout_seconds}s</strong></span>

          <span className="text-neutral-300">•</span>

          <span>Expected: <strong className="text-neutral-700 font-mono font-medium">HTTP {application.expected_status_code}</strong></span>

          {application.tags && application.tags.length > 0 && (
            <>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1">
                {application.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} className="text-[10px]" />
                ))}
              </div>
            </>
          )}
        </div>
      </PageHeader>

      {/* Active Incident Banner if any */}
      {openIncident && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-200/80 bg-amber-50/60 shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-900">Active disruption ongoing</h4>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                {openIncident.reason || 'Health check returned unexpected response code or timeout.'}
              </p>
              <p className="text-[11px] text-amber-800/80 mt-1 font-mono">
                Started {formatDate(openIncident.started_at)} ({formatRelativeTime(openIncident.started_at)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Overall uptime"
          value={`${uptime}%`}
          subtext={`Based on ${healthChecks.length} checks`}
          statusVariant={uptime >= 99 ? 'up' : uptime >= 95 ? 'warning' : 'down'}
        />
        <MetricCard
          label="Latest latency"
          value={formatLatency(latestCheck?.response_time_ms)}
          subtext={`HTTP ${latestCheck?.status_code || 'No code'}`}
          icon={<Zap className="w-4 h-4" />}
        />
        <MetricCard
          label="Average latency"
          value={avgLatency > 0 ? `${avgLatency}ms` : '—'}
          subtext="Mean response duration"
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricCard
          label="P95 latency"
          value={p95Latency > 0 ? `${p95Latency}ms` : '—'}
          subtext="95th percentile response"
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Uptime Bar Strip Section */}
      <div className="rounded-2xl border border-[#EAEAEA] bg-white p-6 space-y-3 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Recent telemetry (Last 50 checks)
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            {healthChecks.filter((c) => c.status === 'UP').length} UP /{' '}
            {healthChecks.filter((c) => c.status === 'DOWN').length} DOWN
          </span>
        </div>
        <UptimeBarStrip healthChecks={healthChecks} maxBars={50} />
      </div>

      {/* Tab Navigation (Metrics / Incidents / Execution Logs) */}
      <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-0">
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-[1px] transition-colors flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Analytics & Latency</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-[1px] transition-colors flex items-center gap-2 ${
            activeTab === 'incidents'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Incidents ({incidents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-[1px] transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Health check logs ({healthChecks.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <LatencyChart healthChecks={healthChecks} />
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <IncidentList
            incidents={incidents.map((inc) => ({ incident: inc, application }))}
            showFilterTabs={true}
          />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden shadow-card">
          {healthChecks.length === 0 ? (
            <EmptyState
              title="No health check logs yet"
              description="Automated health checks will appear here as the scheduler executes them."
            />
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#FAFAFB] border-b border-[#EAEAEA] text-neutral-500 font-medium text-[11px] z-10">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Status code</th>
                    <th className="py-3 px-5">Latency</th>
                    <th className="py-3 px-5">Message / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F2] text-neutral-700">
                  {healthChecks.map((check) => (
                    <tr key={check.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-5 text-neutral-500 font-mono text-[11px]">
                        {formatDate(check.checked_at)}
                        <span className="text-[10px] text-neutral-400 ml-1.5 font-sans">
                          ({formatRelativeTime(check.checked_at)})
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <StatusBadge status={check.status} size="sm" />
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px]">
                        <span className={check.status_code === 200 ? 'text-emerald-600 font-medium' : 'text-neutral-700'}>
                          {formatStatusCode(check.status_code)}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-medium font-mono text-[11px] text-neutral-900">
                        {formatLatency(check.response_time_ms)}
                      </td>
                      <td className="py-3 px-5 text-neutral-500 max-w-xs truncate text-[11px]">
                        {check.error_message || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deactivate confirmation modal */}
      <ConfirmModal
        isOpen={isDeactivateModalOpen}
        title="Deactivate application"
        message={`Are you sure you want to deactivate "${application.name}"? Automated monitoring will stop.`}
        confirmLabel="Deactivate application"
        isDestructive={true}
        isLoading={deactivateMutation.isPending}
        onConfirm={() => deactivateMutation.mutate()}
        onClose={() => setIsDeactivateModalOpen(false)}
      />
    </div>
  );
};
