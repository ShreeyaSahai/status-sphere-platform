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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch applications to populate existing data
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const application: Application | undefined = applications.find((a) => a.id === id);

  const updateMutation = useMutation({
    mutationFn: (data: ApplicationUpdate) => {
      if (!id) throw new Error('Missing application ID');
      return updateApplication(id, data);
    },
    onSuccess: (updatedApp) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['health-checks', updatedApp.id] });
      navigate(`/applications/${updatedApp.id}`);
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
          onClick: () => navigate('/applications'),
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
          { label: 'Overview', to: '/' },
          { label: 'Applications', to: '/applications' },
          { label: application.name, to: `/applications/${application.id}` },
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
