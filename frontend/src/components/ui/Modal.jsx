import { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

/**
 * Modal — Career360 accessible overlay dialog component.
 * Features: Clean white dialog, #001D39 header, #49769F close button, soft shadow.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size       = 'md',
  showClose  = true,
  className  = '',
}) {
  const sizes = {
    sm:   'max-w-md',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#001D39]/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          'relative w-full z-10 animate-slide-up',
          'bg-white border border-slate-200 rounded-2xl shadow-xl',
          sizes[size],
          className,
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && (
              <h2
                id="modal-title"
                className="text-base font-bold text-[#001D39]"
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-[#49769F] hover:text-[#001D39] hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={clsx('flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-100', className)}>
      {children}
    </div>
  );
};
