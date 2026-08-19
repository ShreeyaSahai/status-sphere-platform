import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border border-[#EAEAEA] bg-white shadow-dropdown p-6 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-lg hover:bg-neutral-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="pr-6">
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-[#EAEAEA] rounded-lg transition-colors shadow-subtle disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
