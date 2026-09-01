import React, { useState } from 'react';
import { useParams, Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Radio, ArrowRight, Home, Loader2, AlertCircle } from 'lucide-react';
import { getWorkspace, createWorkspace } from '@/api/workspaces';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

export const WorkspaceLayout: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const {
    data: workspace,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => (workspaceId ? getWorkspace(workspaceId) : Promise.reject(new Error('Missing ID'))),
    enabled: !!workspaceId,
    retry: 1,
  });

  const handleCreateNew = async () => {
    setIsCreatingNew(true);
    try {
      const newWs = await createWorkspace();
      navigate(`/w/${newWs.id}`);
    } catch {
      setIsCreatingNew(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] text-[#171717] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-subtle animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <p className="text-xs text-neutral-500 font-medium">Loading workspace dashboard...</p>
          <SkeletonLoader variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] text-[#171717] flex flex-col justify-between">
        <header className="border-b border-[#EAEAEA] bg-white px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-subtle">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              StatusSphere
            </span>
          </Link>
        </header>

        <main className="flex-1 max-w-lg mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-6 shadow-subtle">
            <AlertCircle className="w-7 h-7" />
          </div>

          <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase mb-1">
            404 — Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Workspace not found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm mb-8">
            The dashboard link you visited does not exist or may have been deleted.
            Workspace links are unguessable access credentials.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={isCreatingNew}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-subtle disabled:opacity-50 cursor-pointer"
            >
              {isCreatingNew ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create a new dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-[#EAEAEA] rounded-xl transition-all shadow-subtle"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </Link>
          </div>
        </main>

        <footer className="border-t border-[#EAEAEA] bg-white py-4 text-center text-xs text-neutral-400">
          StatusSphere — Reliability & Uptime Monitoring
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#171717] flex">
      {/* Narrow icon sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[68px]">
        <Header onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
