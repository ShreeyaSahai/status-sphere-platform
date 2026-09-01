import { apiClient } from './client';
import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
  HealthCheck,
  Incident,
} from '@/types/api';

export async function getApplications(workspaceId: string): Promise<Application[]> {
  return apiClient<Application[]>(`/workspaces/${workspaceId}/applications`);
}

export async function getApplication(
  workspaceId: string,
  applicationId: string
): Promise<Application> {
  return apiClient<Application>(`/workspaces/${workspaceId}/applications/${applicationId}`);
}

export async function createApplication(
  workspaceId: string,
  data: ApplicationCreate
): Promise<Application> {
  return apiClient<Application>(`/workspaces/${workspaceId}/applications`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApplication(
  workspaceId: string,
  applicationId: string,
  data: ApplicationUpdate
): Promise<Application> {
  return apiClient<Application>(`/workspaces/${workspaceId}/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(
  workspaceId: string,
  applicationId: string
): Promise<void> {
  return apiClient<void>(`/workspaces/${workspaceId}/applications/${applicationId}`, {
    method: 'DELETE',
  });
}

export async function getApplicationHealthChecks(
  workspaceId: string,
  applicationId: string
): Promise<HealthCheck[]> {
  return apiClient<HealthCheck[]>(
    `/workspaces/${workspaceId}/applications/${applicationId}/health-checks`
  );
}

export async function getApplicationIncidents(
  workspaceId: string,
  applicationId: string
): Promise<Incident[]> {
  return apiClient<Incident[]>(
    `/workspaces/${workspaceId}/applications/${applicationId}/incidents`
  );
}
