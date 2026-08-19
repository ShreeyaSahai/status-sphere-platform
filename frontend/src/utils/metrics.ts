import type { HealthCheck, Incident } from '@/types/api';

/**
 * Calculate uptime percentage over a collection of health checks
 */
export function calculateUptimePercentage(healthChecks: HealthCheck[]): number {
  if (!healthChecks || healthChecks.length === 0) return 100;
  const upChecks = healthChecks.filter((c) => c.status === 'UP').length;
  return Number(((upChecks / healthChecks.length) * 100).toFixed(1));
}

/**
 * Calculate average latency (ms) for checks with recorded response times
 */
export function calculateAverageLatency(healthChecks: HealthCheck[]): number {
  if (!healthChecks || healthChecks.length === 0) return 0;
  const validTimes = healthChecks
    .map((c) => c.response_time_ms)
    .filter((time): time is number => typeof time === 'number' && time >= 0);

  if (validTimes.length === 0) return 0;
  const total = validTimes.reduce((acc, curr) => acc + curr, 0);
  return Math.round(total / validTimes.length);
}

/**
 * Calculate p95 latency (ms)
 */
export function calculateP95Latency(healthChecks: HealthCheck[]): number {
  if (!healthChecks || healthChecks.length === 0) return 0;
  const validTimes = healthChecks
    .map((c) => c.response_time_ms)
    .filter((time): time is number => typeof time === 'number' && time >= 0)
    .sort((a, b) => a - b);

  if (validTimes.length === 0) return 0;
  const p95Index = Math.floor(validTimes.length * 0.95);
  return validTimes[p95Index] ?? validTimes[validTimes.length - 1];
}

/**
 * Get latest health check
 */
export function getLatestCheck(healthChecks: HealthCheck[]): HealthCheck | null {
  if (!healthChecks || healthChecks.length === 0) return null;
  return healthChecks[0] ?? null;
}

/**
 * Find currently open incident if any
 */
export function getOpenIncident(incidents: Incident[]): Incident | null {
  if (!incidents || incidents.length === 0) return null;
  return incidents.find((inc) => inc.status === 'OPEN') ?? null;
}
