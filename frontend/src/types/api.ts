export type HttpMethod = 'GET' | 'HEAD';

export type HealthStatus = 'UP' | 'DOWN';

export type IncidentStatus = 'OPEN' | 'RESOLVED';

export type EnvironmentSlug = 'production' | 'staging' | 'development';

export interface Application {
  id: string;
  environment_id: string;
  name: string;
  slug: string;
  url: string;
  method: HttpMethod;
  expected_status_code: number;
  timeout_seconds: number;
  check_interval_seconds: number;
  tags: string[];
  is_active: boolean;
}

export interface ApplicationCreate {
  environment_slug: string;
  name: string;
  url: string;
  method?: HttpMethod;
  expected_status_code?: number;
  timeout_seconds?: number;
  check_interval_seconds?: number;
  tags?: string[];
}

export interface ApplicationUpdate {
  name?: string;
  url?: string;
  method?: HttpMethod;
  expected_status_code?: number;
  timeout_seconds?: number;
  check_interval_seconds?: number;
  tags?: string[];
  is_active?: boolean;
}

export interface HealthCheck {
  id: string;
  application_id: string;
  status: HealthStatus;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  application_id: string;
  status: IncidentStatus;
  reason: string | null;
  started_at: string;
  resolved_at: string | null;
}

export interface SystemHealthResponse {
  status: string;
  service?: string;
}

export interface ApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  detail: string | ApiValidationError[];
}
