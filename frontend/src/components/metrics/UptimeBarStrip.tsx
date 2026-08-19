import React, { useState } from 'react';
import type { HealthCheck } from '@/types/api';
import { formatDate, formatRelativeTime, formatLatency, formatStatusCode } from '@/utils/formatters';

interface UptimeBarStripProps {
  healthChecks: HealthCheck[];
  maxBars?: number;
  className?: string;
}

export const UptimeBarStrip: React.FC<UptimeBarStripProps> = ({
  healthChecks,
  maxBars = 50,
  className = '',
}) => {
  const [hoveredCheck, setHoveredCheck] = useState<{
    check: HealthCheck;
    x: number;
    y: number;
  } | null>(null);

  // Health checks from API are sorted DESC (newest first).
  // For the strip, we want chronological order (oldest to newest, left to right).
  const displayedChecks = [...healthChecks]
    .slice(0, maxBars)
    .reverse();

  if (displayedChecks.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-[#EAEAEA] bg-[#F7F8FA] text-center text-xs text-neutral-400 font-mono ${className}`}>
        No health check telemetry recorded yet.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Strip container */}
      <div className="flex items-center gap-1 sm:gap-1.5 h-10 p-2 rounded-xl bg-[#F7F8FA] border border-[#EAEAEA] overflow-x-auto">
        {displayedChecks.map((check) => {
          const isUp = check.status === 'UP';
          return (
            <div
              key={check.id}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredCheck({
                  check,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredCheck(null)}
              className={`flex-1 min-w-[5px] sm:min-w-[6px] h-full rounded-sm transition-all duration-150 cursor-pointer ${
                isUp
                  ? 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105'
                  : 'bg-rose-500 hover:bg-rose-600 hover:scale-105'
              }`}
            />
          );
        })}
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-400 font-mono">
        <span>{formatRelativeTime(displayedChecks[0]?.checked_at)}</span>
        <span className="text-neutral-500 font-medium font-sans">{displayedChecks.length} checks recorded</span>
        <span>Latest</span>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCheck && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none transition-all duration-75"
          style={{
            left: `${hoveredCheck.x}px`,
            top: `${hoveredCheck.y - 8}px`,
          }}
        >
          <div className="rounded-xl bg-neutral-900 text-white p-3 text-xs shadow-dropdown min-w-[200px]">
            <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-neutral-800">
              <span
                className={`font-semibold text-xs ${
                  hoveredCheck.check.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hoveredCheck.check.status === 'UP' ? 'Operational' : 'Down'}
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">
                {formatRelativeTime(hoveredCheck.check.checked_at)}
              </span>
            </div>

            <div className="space-y-1 text-neutral-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Status Code:</span>
                <span className="text-white font-medium">
                  {formatStatusCode(hoveredCheck.check.status_code)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Latency:</span>
                <span className="text-white font-medium">
                  {formatLatency(hoveredCheck.check.response_time_ms)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Time:</span>
                <span className="text-neutral-300">
                  {formatDate(hoveredCheck.check.checked_at)}
                </span>
              </div>
              {hoveredCheck.check.error_message && (
                <div className="mt-2 pt-1 border-t border-neutral-800 text-rose-300 text-[10px] break-words font-sans">
                  {hoveredCheck.check.error_message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
