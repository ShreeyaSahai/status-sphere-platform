export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      if (typeof data === 'object' && data !== null && 'detail' in data) {
        const detail = (data as { detail: unknown }).detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((err: { msg?: string; loc?: string[] }) => 
            err.loc ? `${err.loc.join('.')}: ${err.msg || 'Invalid'}` : (err.msg || 'Validation error')
          ).join(', ');
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error or connection failed',
      0
    );
  }
}
