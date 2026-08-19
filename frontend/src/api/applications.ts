import { apiClient } from './client';
import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
  HealthCheck,
  Incident,
} from '@/types/api';

export async function getApplications(): Promise<Application[]> {
  return apiClient<Application[]>('/applications');
}

export async function createApplication(data: ApplicationCreate): Promise<Application> {
  return apiClient<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApplication(
  id: string,
  data: ApplicationUpdate
): Promise<Application> {
  return apiClient<Application>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  return apiClient<void>(`/applications/${id}`, {
    method: 'DELETE',
  });
}

export async function getApplicationHealthChecks(
  applicationId: string
): Promise<HealthCheck[]> {
  return apiClient<HealthCheck[]>(`/applications/${applicationId}/health-checks`);
}

export async function getApplicationIncidents(
  applicationId: string
): Promise<Incident[]> {
  return apiClient<Incident[]>(`/applications/${applicationId}/incidents`);
}
