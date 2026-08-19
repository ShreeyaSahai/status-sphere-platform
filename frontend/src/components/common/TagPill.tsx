import React from 'react';

interface TagPillProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export const TagPill: React.FC<TagPillProps> = ({ tag, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal text-neutral-600 bg-neutral-100/90 border border-neutral-200/60 ${className}`}
    >
      <span>#{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
