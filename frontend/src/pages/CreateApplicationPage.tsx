import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication } from '@/api/applications';
import type { ApplicationCreate } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApplicationForm } from '@/components/applications/ApplicationForm';

export const CreateApplicationPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const basePath = workspaceId ? `/w/${workspaceId}` : '';

  const createMutation = useMutation({
    mutationFn: (data: ApplicationCreate) => {
      if (!workspaceId) throw new Error('Missing workspace ID');
      return createApplication(workspaceId, data);
    },
    onSuccess: (newApp) => {
      queryClient.invalidateQueries({ queryKey: ['applications', workspaceId] });
      navigate(`${basePath}/applications/${newApp.id}`);
    },
  });

  const handleSubmit = async (data: ApplicationCreate) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="New application"
        subtitle="Monitor a new service or HTTP endpoint"
        breadcrumbs={[
          { label: 'Overview', to: basePath || '/' },
          { label: 'Applications', to: `${basePath}/applications` },
          { label: 'New' },
        ]}
      />

      <ApplicationForm
        isEdit={false}
        isLoading={createMutation.isPending}
        onSubmit={(data) => handleSubmit(data as ApplicationCreate)}
      />
    </div>
  );
};
