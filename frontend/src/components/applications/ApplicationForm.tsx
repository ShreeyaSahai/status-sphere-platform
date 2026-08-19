import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Tag as TagIcon, 
  AlertCircle,
  Plus
} from 'lucide-react';
import type { 
  ApplicationCreate, 
  ApplicationUpdate, 
  Application, 
  HttpMethod,
  EnvironmentSlug 
} from '@/types/api';
import { TagPill } from '@/components/common/TagPill';

interface ApplicationFormProps {
  initialData?: Application;
  isEdit?: boolean;
  isLoading?: boolean;
  onSubmit: (data: ApplicationCreate | ApplicationUpdate) => Promise<void>;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  initialData,
  isEdit = false,
  isLoading = false,
  onSubmit,
}) => {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [environmentSlug, setEnvironmentSlug] = useState<EnvironmentSlug>('production');
  const [method, setMethod] = useState<HttpMethod>(initialData?.method || 'GET');
  const [expectedStatusCode, setExpectedStatusCode] = useState<number>(
    initialData?.expected_status_code ?? 200
  );
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(
    initialData?.timeout_seconds ?? 10
  );
  const [checkIntervalSeconds, setCheckIntervalSeconds] = useState<number>(
    initialData?.check_interval_seconds ?? 30
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isActive, setIsActive] = useState<boolean>(initialData?.is_active ?? true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Add tag handler
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = currentTag.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Application name is required.';
    } else if (name.length > 150) {
      newErrors.name = 'Name must be 150 characters or fewer.';
    }

    if (!url.trim()) {
      newErrors.url = 'Target URL is required.';
    } else {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          newErrors.url = 'URL must begin with http:// or https://';
        }
      } catch {
        newErrors.url = 'Please enter a valid URL (e.g., https://api.example.com/health).';
      }
    }

    if (expectedStatusCode < 100 || expectedStatusCode > 599) {
      newErrors.expectedStatusCode = 'Status code must be between 100 and 599.';
    }

    if (timeoutSeconds < 1 || timeoutSeconds > 120) {
      newErrors.timeoutSeconds = 'Timeout must be between 1 and 120 seconds.';
    }

    if (checkIntervalSeconds < 10 || checkIntervalSeconds > 3600) {
      newErrors.checkIntervalSeconds = 'Check interval must be between 10 and 3600 seconds.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      if (isEdit) {
        const updatePayload: ApplicationUpdate = {
          name,
          url,
          method,
          expected_status_code: expectedStatusCode,
          timeout_seconds: timeoutSeconds,
          check_interval_seconds: checkIntervalSeconds,
          tags,
          is_active: isActive,
        };
        await onSubmit(updatePayload);
      } else {
        const createPayload: ApplicationCreate = {
          name,
          url,
          environment_slug: environmentSlug,
          method,
          expected_status_code: expectedStatusCode,
          timeout_seconds: timeoutSeconds,
          check_interval_seconds: checkIntervalSeconds,
          tags,
        };
        await onSubmit(createPayload);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during submission.';
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {submitError && (
        <div className="p-4 rounded-2xl border border-rose-200/80 bg-rose-50/70 text-rose-900 flex items-start gap-3 text-xs shadow-card">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-rose-950">Submission failed</strong>
            <span className="text-rose-800/90">{submitError}</span>
          </div>
        </div>
      )}

      {/* Basic info card */}
      <div className="rounded-2xl border border-[#EAEAEA] bg-white p-6 sm:p-7 space-y-5 shadow-card">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Service identity
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Identify the service and define its health endpoint.
          </p>
        </div>

        {/* Application Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-neutral-700 mb-1.5">
            Application name <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Payments Gateway API"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7F8FA] border rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none transition-colors ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500'
                : 'border-[#EAEAEA] focus:border-neutral-400'
            }`}
          />
          {errors.name && <p className="mt-1.5 text-xs text-rose-600 font-normal">{errors.name}</p>}
        </div>

        {/* Target URL */}
        <div>
          <label htmlFor="url" className="block text-xs font-medium text-neutral-700 mb-1.5">
            Health check URL <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="url"
              type="text"
              placeholder="https://api.example.com/health"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#F7F8FA] border rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none transition-colors ${
                errors.url
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-[#EAEAEA] focus:border-neutral-400'
              }`}
            />
          </div>
          {errors.url && <p className="mt-1.5 text-xs text-rose-600 font-normal">{errors.url}</p>}
        </div>

        {/* Environment Selector (Create Only) */}
        {!isEdit && (
          <div>
            <label htmlFor="environment" className="block text-xs font-medium text-neutral-700 mb-1.5">
              Environment <span className="text-rose-500">*</span>
            </label>
            <select
              id="environment"
              value={environmentSlug}
              onChange={(e) => setEnvironmentSlug(e.target.value as EnvironmentSlug)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7F8FA] border border-[#EAEAEA] rounded-xl text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-400 cursor-pointer"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Deployment environment category for this check.
            </p>
          </div>
        )}
      </div>

      {/* Monitoring & Probing Configurations */}
      <div className="rounded-2xl border border-[#EAEAEA] bg-white p-6 sm:p-7 space-y-5 shadow-card">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Health check settings
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure automated probing parameters and response validation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* HTTP Method */}
          <div>
            <label htmlFor="method" className="block text-xs font-medium text-neutral-700 mb-1.5">
              HTTP method
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7F8FA] border border-[#EAEAEA] rounded-xl text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-400 cursor-pointer"
            >
              <option value="GET">GET (Standard request)</option>
              <option value="HEAD">HEAD (Headers only)</option>
            </select>
          </div>

          {/* Expected Status Code */}
          <div>
            <label htmlFor="expectedStatusCode" className="block text-xs font-medium text-neutral-700 mb-1.5">
              Expected status code
            </label>
            <input
              id="expectedStatusCode"
              type="number"
              min={100}
              max={599}
              value={expectedStatusCode}
              onChange={(e) => setExpectedStatusCode(parseInt(e.target.value, 10) || 200)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#F7F8FA] border rounded-xl text-neutral-900 focus:bg-white focus:outline-none transition-colors ${
                errors.expectedStatusCode
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-[#EAEAEA] focus:border-neutral-400'
              }`}
            />
            {errors.expectedStatusCode && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.expectedStatusCode}</p>
            )}
          </div>

          {/* Timeout Seconds */}
          <div>
            <label htmlFor="timeoutSeconds" className="block text-xs font-medium text-neutral-700 mb-1.5">
              Request timeout (seconds)
            </label>
            <input
              id="timeoutSeconds"
              type="number"
              min={1}
              max={120}
              value={timeoutSeconds}
              onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10) || 10)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#F7F8FA] border rounded-xl text-neutral-900 focus:bg-white focus:outline-none transition-colors ${
                errors.timeoutSeconds
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-[#EAEAEA] focus:border-neutral-400'
              }`}
            />
            {errors.timeoutSeconds && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.timeoutSeconds}</p>
            )}
          </div>

          {/* Check Interval Seconds */}
          <div>
            <label htmlFor="checkIntervalSeconds" className="block text-xs font-medium text-neutral-700 mb-1.5">
              Check interval (seconds)
            </label>
            <input
              id="checkIntervalSeconds"
              type="number"
              min={10}
              max={3600}
              value={checkIntervalSeconds}
              onChange={(e) => setCheckIntervalSeconds(parseInt(e.target.value, 10) || 30)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#F7F8FA] border rounded-xl text-neutral-900 focus:bg-white focus:outline-none transition-colors ${
                errors.checkIntervalSeconds
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-[#EAEAEA] focus:border-neutral-400'
              }`}
            />
            {errors.checkIntervalSeconds && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.checkIntervalSeconds}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">
            Tags & metadata
          </label>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="relative flex-1">
              <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Type tag and press enter (e.g. core, payments, v1)..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#F7F8FA] border border-[#EAEAEA] rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 rounded-xl border border-[#EAEAEA] transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-500" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {tags.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
          </div>
        </div>

        {/* Active Toggle (Edit Mode Only) */}
        {isEdit && (
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-900 block">Active monitoring</span>
              <span className="text-[11px] text-neutral-400">
                Pause or resume automated health check executions.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-[#EAEAEA] rounded-lg transition-colors shadow-subtle disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors shadow-subtle"
        >
          {isLoading ? (
            <span>Saving...</span>
          ) : (
            <span>{isEdit ? 'Save changes' : 'Add application'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
