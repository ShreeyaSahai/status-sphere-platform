import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Link2, 
  Server, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { createWorkspace } from '@/api/workspaces';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const workspace = await createWorkspace();
      navigate(`/w/${workspace.id}`);
    } catch (err: unknown) {
      setIsCreating(false);
      setError(err instanceof Error ? err.message : 'Failed to create workspace. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-[#171717] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#EAEAEA] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-subtle">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-neutral-900 block leading-tight">
                StatusSphere
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                Reliability & uptime platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={isCreating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-subtle disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating dashboard...</span>
                </>
              ) : (
                <>
                  <span>Create your dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-5 sm:px-8 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 border border-[#EAEAEA] text-neutral-700 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Zero Sign-Up • Shareable-Link Workspaces</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 max-w-3xl leading-[1.12]">
          Real-time service health,{' '}
          <span className="text-neutral-500 font-normal">behind your own link.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          Monitor APIs, track uptime percentages, inspect latency trends, and manage incidents.
          No passwords, no sign-up forms, no credit cards — your unguessable dashboard link is your access key.
        </p>

        {/* Action Button & Error */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isCreating}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-2xl transition-all shadow-card hover:shadow-card-hover active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating your private dashboard...</span>
              </>
            ) : (
              <>
                <span>Create your dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Link2 className="w-3 h-3 text-neutral-400" />
            <span>Instant unguessable URL generated on demand</span>
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] shadow-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                Bring Your Own Link
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Every dashboard lives behind a unique, unguessable UUID. Share the URL with teammates to collaborate instantly without credential management.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secret-by-obscurity access</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] shadow-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                Automated Health Checks
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Asynchronous probing continuously monitors HTTP response status codes and records latency histograms every 30 seconds.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Configurable probe intervals</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] shadow-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                Incident Detection & History
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Automatic incident creation upon service disruption and auto-resolution tracking when endpoints return healthy.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-400">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time resolution timeline</span>
            </div>
          </div>
        </div>

        {/* Security & Access Notice Banner */}
        <div className="mt-12 w-full p-5 rounded-2xl bg-neutral-100/70 border border-[#EAEAEA] text-left text-xs text-neutral-600 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-0.5">
              How workspace access works
            </h4>
            <p className="text-neutral-500 leading-relaxed text-[11px]">
              StatusSphere uses secret link access without login credentials. Once you create a dashboard, bookmark or save your URL.
              Anyone with your URL can view and manage its applications, while nobody can discover or enumerate it without the link.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAEAEA] bg-white py-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-medium text-neutral-700">StatusSphere</span>
            <span>— Cloud-Native Monitoring Platform</span>
          </div>
          <p>© {new Date().getFullYear()} StatusSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
