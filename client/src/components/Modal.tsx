import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8 ${className ?? ''}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
          aria-label="Close"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
        {title && (
          <h2
            id={titleId}
            className="mb-4 text-2xl font-semibold text-white sm:text-3xl"
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;

