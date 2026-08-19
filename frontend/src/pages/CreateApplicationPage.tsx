import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication } from '@/api/applications';
import type { ApplicationCreate } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApplicationForm } from '@/components/applications/ApplicationForm';

export const CreateApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: ApplicationCreate) => createApplication(data),
    onSuccess: (newApp) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate(`/applications/${newApp.id}`);
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
          { label: 'Overview', to: '/' },
          { label: 'Applications', to: '/applications' },
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
