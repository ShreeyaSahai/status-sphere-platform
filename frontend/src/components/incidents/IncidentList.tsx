import React, { useState } from 'react';
import type { Incident, Application } from '@/types/api';
import { IncidentCard } from './IncidentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle2 } from 'lucide-react';

interface IncidentItemWithApp {
  incident: Incident;
  application?: Application;
}

interface IncidentListProps {
  incidents: IncidentItemWithApp[];
  showFilterTabs?: boolean;
  className?: string;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  showFilterTabs = true,
  className = '',
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const filteredIncidents = incidents.filter((item) => {
    if (filter === 'OPEN') return item.incident.status === 'OPEN';
    if (filter === 'RESOLVED') return item.incident.status === 'RESOLVED';
    return true;
  });

  const openCount = incidents.filter((i) => i.incident.status === 'OPEN').length;
  const resolvedCount = incidents.filter((i) => i.incident.status === 'RESOLVED').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Tabs */}
      {showFilterTabs && (
        <div className="flex items-center gap-1.5 border-b border-[#EAEAEA] pb-3.5">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            All incidents ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'OPEN'
                ? 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Open ({openCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'RESOLVED'
                ? 'bg-blue-50 text-blue-800 border border-blue-200/80 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>
      )}

      {/* List Feed */}
      {filteredIncidents.length === 0 ? (
        <EmptyState
          title={filter === 'OPEN' ? 'No active incidents' : 'No incident history'}
          description={
            filter === 'OPEN'
              ? 'All monitored services are currently operating normally.'
              : 'There are no incident records matching this filter.'
          }
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      ) : (
        <div className="divide-y divide-[#F0F0F2]">
          {filteredIncidents.map((item) => (
            <IncidentCard
              key={item.incident.id}
              incident={item.incident}
              application={item.application}
            />
          ))}
        </div>
      )}
    </div>
  );
};
