import { apiClient } from './client';
import type { Workspace } from '@/types/api';

export async function createWorkspace(): Promise<Workspace> {
  return apiClient<Workspace>('/workspaces', {
    method: 'POST',
  });
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  return apiClient<Workspace>(`/workspaces/${workspaceId}`);
}
