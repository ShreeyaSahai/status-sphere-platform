import React from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, History } from 'lucide-react';
import { getApplications, getApplicationIncidents } from '@/api/applications';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { IncidentList } from '@/components/incidents/IncidentList';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useRefresh } from '@/context';

export const IncidentsPage: React.FC = () => {
  const { pollingInterval } = useRefresh();

  // Fetch applications
  const {
    data: applications = [],
    isLoading: isLoadingApps,
    isError: isAppsError,
    error: appsError,
    refetch,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Fetch incidents for each application
  const incidentQueries = useQueries({
    queries: applications.map((app) => ({
      queryKey: ['incidents', app.id],
      queryFn: () => getApplicationIncidents(app.id),
      refetchInterval: pollingInterval > 0 ? pollingInterval : false,
      refetchIntervalInBackground: false,
      enabled: applications.length > 0,
    })),
  });

  const isLoadingIncidents = incidentQueries.some((q) => q.isLoading);

  // Flatten and sort incidents by started_at DESC
  const allIncidentsWithApp = incidentQueries
    .flatMap((query, index) => {
      const app = applications[index];
      const incidents = query.data || [];
      return incidents.map((incident) => ({
        incident,
        application: app,
      }));
    })
    .sort((a, b) => {
      const dateA = new Date(a.incident.started_at).getTime();
      const dateB = new Date(b.incident.started_at).getTime();
      return dateB - dateA;
    });

  const openIncidents = allIncidentsWithApp.filter((i) => i.incident.status === 'OPEN');
  const resolvedIncidents = allIncidentsWithApp.filter((i) => i.incident.status === 'RESOLVED');

  if (isLoadingApps || (applications.length > 0 && isLoadingIncidents)) {
    return (
      <div className="space-y-8">
        <PageHeader title="Incidents" subtitle="Loading incident history..." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (isAppsError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Incidents" subtitle="Service downtime events and resolution history" />
        <ErrorAlert
          title="Failed to load incident data"
          message={appsError instanceof Error ? appsError.message : 'Error fetching incidents.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Incidents"
        subtitle="Service downtime events and resolution history"
        breadcrumbs={[
          { label: 'Overview', to: '/' },
          { label: 'Incidents' },
        ]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Active incidents"
          value={openIncidents.length}
          subtext={openIncidents.length === 0 ? 'All services operational' : 'Active disruptions'}
          icon={<AlertCircle className="w-4 h-4" />}
          statusVariant={openIncidents.length > 0 ? 'warning' : 'up'}
        />
        <MetricCard
          label="Resolved incidents"
          value={resolvedIncidents.length}
          subtext="Mitigated downtime events"
          icon={<CheckCircle2 className="w-4 h-4" />}
          statusVariant="info"
        />
        <MetricCard
          label="Total events logged"
          value={allIncidentsWithApp.length}
          subtext="Lifetime incident tracking"
          icon={<History className="w-4 h-4" />}
          statusVariant="default"
        />
      </div>

      {/* Incident List Container */}
      <div className="rounded-2xl border border-[#EAEAEA] bg-white p-6 sm:p-7 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-neutral-900">
            Incident history
          </h3>
        </div>

        <IncidentList
          incidents={allIncidentsWithApp}
          showFilterTabs={true}
        />
      </div>
    </div>
  );
};
