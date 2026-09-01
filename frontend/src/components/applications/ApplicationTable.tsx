import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Globe, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import type { Application } from '@/types/api';
import { HttpMethodBadge } from '@/components/common/HttpMethodBadge';
import { TagPill } from '@/components/common/TagPill';
import { EmptyState } from '@/components/common/EmptyState';

interface ApplicationTableProps {
  applications: Application[];
  onDeactivate: (application: Application) => void;
  className?: string;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onDeactivate,
  className = '',
}) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'GET' | 'HEAD'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(applications.flatMap((app) => app.tags || []))
  );

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod =
      methodFilter === 'ALL' || app.method === methodFilter;

    const matchesTag =
      !selectedTag || (app.tags && app.tags.includes(selectedTag));

    return matchesSearch && matchesMethod && matchesTag;
  });

  const getAppUrl = (app: Application) => {
    const ws = workspaceId || app.workspace_id;
    return ws ? `/w/${ws}/applications/${app.id}` : `/applications/${app.id}`;
  };

  const getAppEditUrl = (app: Application) => {
    const ws = workspaceId || app.workspace_id;
    return ws ? `/w/${ws}/applications/${app.id}/edit` : `/applications/${app.id}/edit`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#EAEAEA] shadow-card">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, URL, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8FA] border border-[#EAEAEA] rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as 'ALL' | 'GET' | 'HEAD')}
            className="bg-[#F7F8FA] border border-[#EAEAEA] text-neutral-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-neutral-300 cursor-pointer"
            aria-label="Filter by HTTP Method"
          >
            <option value="ALL">All methods</option>
            <option value="GET">GET</option>
            <option value="HEAD">HEAD</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="bg-[#F7F8FA] border border-[#EAEAEA] text-neutral-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-neutral-300 cursor-pointer"
              aria-label="Filter by Tag"
            >
              <option value="">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || methodFilter !== 'ALL' || selectedTag) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMethodFilter('ALL');
                setSelectedTag(null);
              }}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      {filteredApps.length === 0 ? (
        <EmptyState
          title="No applications match your search"
          description="Try adjusting your search query or filters to find what you're looking for."
        />
      ) : (
        <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFB] border-b border-[#EAEAEA] text-neutral-500 font-medium text-[11px]">
                <tr>
                  <th className="py-3.5 px-5 font-medium">Service name</th>
                  <th className="py-3.5 px-5 font-medium">Method & target</th>
                  <th className="py-3.5 px-5 font-medium">Expected status</th>
                  <th className="py-3.5 px-5 font-medium">Interval & timeout</th>
                  <th className="py-3.5 px-5 font-medium">Tags</th>
                  <th className="py-3.5 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F2] text-neutral-700">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[#F9FAFB] transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-4 px-5">
                      <Link
                        to={getAppUrl(app)}
                        className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>{app.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                      <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                        {app.slug}
                      </span>
                    </td>

                    {/* Method & Target */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 max-w-xs">
                        <HttpMethodBadge method={app.method} />
                        <span className="truncate text-neutral-500 flex items-center gap-1 font-mono text-[11px]">
                          <Globe className="w-3 h-3 shrink-0 text-neutral-400" />
                          <span className="truncate">{app.url}</span>
                        </span>
                      </div>
                    </td>

                    {/* Expected Status Code */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-mono text-[11px]">
                        HTTP {app.expected_status_code}
                      </span>
                    </td>

                    {/* Interval & Timeout */}
                    <td className="py-4 px-5 text-neutral-500">
                      <div>Every {app.check_interval_seconds}s</div>
                      <div className="text-neutral-400 text-[11px]">Timeout: {app.timeout_seconds}s</div>
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                        {app.tags && app.tags.length > 0 ? (
                          app.tags.map((tag) => (
                            <TagPill key={tag} tag={tag} className="text-[10px] py-0 px-1.5" />
                          ))
                        ) : (
                          <span className="text-neutral-400 text-[11px]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={getAppUrl(app)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="View telemetry and metrics"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={getAppEditUrl(app)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit configuration"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDeactivate(app)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Deactivate application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
