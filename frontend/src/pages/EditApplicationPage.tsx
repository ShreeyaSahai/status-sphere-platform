import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication } from '@/api/applications';
import type { Application, ApplicationUpdate } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { Radio } from 'lucide-react';

export const EditApplicationPage: React.FC = () => {
  const { workspaceId, id } = useParams<{ workspaceId: string; id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const basePath = workspaceId ? `/w/${workspaceId}` : '';

  // Fetch applications to populate existing data
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['applications', workspaceId],
    queryFn: () => (workspaceId ? getApplications(workspaceId) : Promise.resolve([])),
    enabled: !!workspaceId,
  });

  const application: Application | undefined = applications.find((a) => a.id === id);

  const updateMutation = useMutation({
    mutationFn: (data: ApplicationUpdate) => {
      if (!workspaceId || !id) throw new Error('Missing workspace or application ID');
      return updateApplication(workspaceId, id, data);
    },
    onSuccess: (updatedApp) => {
      queryClient.invalidateQueries({ queryKey: ['applications', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['health-checks', workspaceId, updatedApp.id] });
      navigate(`${basePath}/applications/${updatedApp.id}`);
    },
  });

  const handleSubmit = async (data: ApplicationUpdate) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-2xl">
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8 max-w-2xl">
        <ErrorAlert
          title="Failed to load application"
          message={error instanceof Error ? error.message : 'Error fetching application data.'}
        />
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        title="Application not found"
        description="The service you are trying to edit could not be found."
        icon={<Radio className="w-5 h-5 text-neutral-400" />}
        action={{
          label: 'Back to applications',
          onClick: () => navigate(`${basePath}/applications`),
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit ${application.name}`}
        subtitle="Update health check target URL, interval, expected response codes, or status"
        breadcrumbs={[
          { label: 'Overview', to: basePath || '/' },
          { label: 'Applications', to: `${basePath}/applications` },
          { label: application.name, to: `${basePath}/applications/${application.id}` },
          { label: 'Edit' },
        ]}
      />

      <ApplicationForm
        initialData={application}
        isEdit={true}
        isLoading={updateMutation.isPending}
        onSubmit={(data) => handleSubmit(data as ApplicationUpdate)}
      />
    </div>
  );
};
