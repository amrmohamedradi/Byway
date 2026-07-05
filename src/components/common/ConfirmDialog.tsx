import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon,
  danger = false,
}) => {
  const [isPending, setIsPending] = React.useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setIsPending(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      onClose();
    } catch {
      setIsPending(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative flex flex-col items-center text-center animate-zoom-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {icon && (
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5 mt-2">
            <div className="w-14 h-14 rounded-full bg-slate-100/60 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}

        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-slate-800 mb-2"
        >
          {title}
        </h2>

        <p className="text-slate-500 text-sm leading-relaxed px-2 mb-8">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 font-semibold text-sm transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                : 'bg-slate-800 hover:bg-slate-700 shadow-slate-200'
            }`}
          >
            {isPending ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
