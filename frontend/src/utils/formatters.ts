/**
 * Format ISO datetime string to localized readable format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time (e.g. "2m ago", "Just now", "3h ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Format duration between two timestamps (e.g. "12m 45s", "3h 10m", "Active for 5m")
 */
export function formatDuration(
  startString: string | null | undefined,
  endString?: string | null | undefined
): string {
  if (!startString) return '—';
  try {
    const start = new Date(startString).getTime();
    const end = endString ? new Date(endString).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);
    const totalSeconds = Math.floor(diffMs / 1000);

    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes < 60) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    if (hours < 24) {
      return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  } catch {
    return '—';
  }
}

/**
 * Format response latency
 */
export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format HTTP status code with status description
 */
export function formatStatusCode(code: number | null | undefined): string {
  if (!code) return 'No response';
  const descriptions: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return descriptions[code] ? `${code} ${descriptions[code]}` : `${code}`;
}
