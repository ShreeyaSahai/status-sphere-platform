import type { SystemHealthResponse } from '@/types/api';

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const response = await fetch('/health', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json() as Promise<SystemHealthResponse>;
}
