import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  LayoutGrid, 
  Table as TableIcon, 
  Radio
} from 'lucide-react';
import { getApplications, deleteApplication } from '@/api/applications';
import type { Application } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { ApplicationTable } from '@/components/applications/ApplicationTable';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { useRefresh } from '@/context';

export const ApplicationsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pollingInterval } = useRefresh();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [appToDeactivate, setAppToDeactivate] = useState<Application | null>(null);

  const basePath = workspaceId ? `/w/${workspaceId}` : '';

  // Fetch applications
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications', workspaceId],
    queryFn: () => (workspaceId ? getApplications(workspaceId) : Promise.resolve([])),
    enabled: !!workspaceId,
    refetchInterval: pollingInterval > 0 ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => {
      if (!workspaceId) throw new Error('Missing workspace ID');
      return deleteApplication(workspaceId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', workspaceId] });
      setAppToDeactivate(null);
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Applications"
        subtitle="Manage and monitor your services and endpoints"
        breadcrumbs={[
          { label: 'Overview', to: basePath || '/' },
          { label: 'Applications' },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-[#EAEAEA] rounded-xl p-1 shadow-subtle">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-neutral-100 text-neutral-900 shadow-subtle'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                aria-label="Table view"
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-neutral-100 text-neutral-900 shadow-subtle'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              to={`${basePath}/applications/new`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>New application</span>
            </Link>
          </div>
        }
      />

      {/* Content states */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader variant="card" count={3} />
        </div>
      ) : isError ? (
        <ErrorAlert
          title="Failed to load applications"
          message={error instanceof Error ? error.message : 'Unable to connect to backend.'}
          onRetry={() => refetch()}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications configured"
          description="There are currently no active applications configured for monitoring in this workspace."
          icon={<Radio className="w-5 h-5 text-neutral-400" />}
          action={{
            label: 'Register application',
            onClick: () => {
              navigate(`${basePath}/applications/new`);
            },
          }}
        />
      ) : viewMode === 'table' ? (
        <ApplicationTable
          applications={applications}
          onDeactivate={(app) => setAppToDeactivate(app)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      {/* Deactivate confirmation modal */}
      <ConfirmModal
        isOpen={!!appToDeactivate}
        title="Deactivate application"
        message={`Are you sure you want to deactivate "${appToDeactivate?.name}"? Automated health checks will stop executing.`}
        confirmLabel="Deactivate application"
        isDestructive={true}
        isLoading={deactivateMutation.isPending}
        onConfirm={() => {
          if (appToDeactivate) {
            deactivateMutation.mutate(appToDeactivate.id);
          }
        }}
        onClose={() => setAppToDeactivate(null)}
      />
    </div>
  );
};
