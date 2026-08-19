import React, { useState } from 'react';
import type { HealthCheck } from '@/types/api';
import { formatLatency, formatRelativeTime, formatDate } from '@/utils/formatters';

interface LatencyChartProps {
  healthChecks: HealthCheck[];
  maxPoints?: number;
  className?: string;
}

export const LatencyChart: React.FC<LatencyChartProps> = ({
  healthChecks,
  maxPoints = 40,
  className = '',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Chronological order: oldest to newest
  const data = [...healthChecks]
    .slice(0, maxPoints)
    .reverse()
    .map((c) => ({
      id: c.id,
      timestamp: c.checked_at,
      latency: typeof c.response_time_ms === 'number' ? c.response_time_ms : 0,
      isUp: c.status === 'UP',
      error: c.error_message,
    }));

  if (data.length < 2) {
    return (
      <div className={`p-8 rounded-2xl border border-[#EAEAEA] bg-white text-center text-xs text-neutral-400 ${className}`}>
        Not enough telemetry data to render response latency chart.
      </div>
    );
  }

  const maxLatency = Math.max(...data.map((d) => d.latency), 100);
  const minLatency = 0;
  const avgLatency = Math.round(
    data.reduce((acc, curr) => acc + curr.latency, 0) / data.length
  );

  // SVG dimensions
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y =
      paddingY +
      chartHeight -
      ((d.latency - minLatency) / (maxLatency - minLatency || 1)) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG paths
  const linePath = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${
    height - paddingY
  } L ${points[0].x},${height - paddingY} Z`;

  // Average line Y coordinate
  const avgY =
    paddingY +
    chartHeight -
    ((avgLatency - minLatency) / (maxLatency - minLatency || 1)) * chartHeight;

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className={`rounded-2xl border border-[#EAEAEA] bg-white p-6 shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">Response latency</h4>
          <p className="text-xs text-neutral-400 mt-0.5">Recorded response time over recent checks</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-neutral-900" />
            <span>Avg: <strong className="font-semibold text-neutral-900">{avgLatency}ms</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-neutral-300" />
            <span>Peak: <strong className="font-semibold text-neutral-900">{maxLatency}ms</strong></span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="latencyGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#171717" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Minimal Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#F0F0F2"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingY + chartHeight / 2}
            stroke="#F0F0F2"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#EAEAEA"
          />

          {/* Average latency dashed line */}
          <line
            x1={paddingX}
            y1={avgY}
            x2={width - paddingX}
            y2={avgY}
            stroke="#737373"
            strokeOpacity="0.3"
            strokeDasharray="3 3"
          />

          {/* Fill Area */}
          <path d={areaPath} fill="url(#latencyGradientLight)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#171717"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g
              key={pt.id}
              onMouseEnter={() => setHoverIndex(idx)}
              className="cursor-pointer"
            >
              {/* Hit area */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill="transparent"
              />
              {/* Point circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === idx ? 4.5 : 2}
                fill={pt.isUp ? (hoverIndex === idx ? '#171717' : '#525252') : '#EF4444'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="transition-all duration-100"
              />
            </g>
          ))}

          {/* Hover indicator vertical line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingY}
              x2={hoveredPoint.x}
              y2={height - paddingY}
              stroke="#A3A3A3"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Y Axis Labels */}
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            textAnchor="end"
            className="text-[10px] fill-neutral-400 font-mono"
          >
            {maxLatency}ms
          </text>
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            textAnchor="end"
            className="text-[10px] fill-neutral-400 font-mono"
          >
            0ms
          </text>
        </svg>

        {/* Floating tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 bg-neutral-900 text-white rounded-xl p-3 text-xs shadow-dropdown pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={hoveredPoint.isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {hoveredPoint.isUp ? 'Operational' : 'Down'}
              </span>
              <span className="text-white font-mono font-medium">{formatLatency(hoveredPoint.latency)}</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              {formatDate(hoveredPoint.timestamp)} ({formatRelativeTime(hoveredPoint.timestamp)})
            </div>
            {hoveredPoint.error && (
              <div className="text-[10px] text-rose-300 mt-1 font-sans">
                {hoveredPoint.error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-400 font-mono">
        <span>{formatRelativeTime(data[0]?.timestamp)}</span>
        <span>Latest</span>
      </div>
    </div>
  );
};
