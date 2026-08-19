import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#EAEAEA] text-neutral-400 mb-6 shadow-card">
        <Radio className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-semibold font-mono text-neutral-900 mb-2">404</h1>
      <h2 className="text-base font-semibold text-neutral-900 mb-1">Page not found</h2>
      <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-subtle"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to overview</span>
      </Link>
    </div>
  );
};
