import { useEffect, useState, useCallback } from 'react';
import { clsx } from 'clsx';

const TYPES = {
  success: {
    bg:   'bg-accent-500/20  border-accent-500/30',
    icon: 'text-accent-400',
    path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bg:   'bg-danger-500/20  border-danger-500/30',
    icon: 'text-danger-400',
    path: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg:   'bg-warning-500/20 border-warning-500/30',
    icon: 'text-warning-400',
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  info: {
    bg:   'bg-primary-500/20  border-primary-500/30',
    icon: 'text-primary-400',
    path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
};

/**
 * Toast — transient notification component.
 * Uses a simple duration-based auto-dismiss.
 */
export default function Toast({
  message,
  type     = 'info',
  duration = 4000,
  onClose,
}) {
  const [visible, setVisible] = useState(true);
  const config = TYPES[type] ?? TYPES.info;

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-card',
        'transition-all duration-300',
        config.bg,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
      role="alert"
    >
      <svg className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', config.icon)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={config.path} />
      </svg>
      <p className="text-sm text-white flex-1">{message}</p>
      <button onClick={dismiss} className="text-slate-400 hover:text-white transition-colors" aria-label="Dismiss">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * ToastContainer — renders stacked toasts in the bottom-right corner.
 * Usage: <ToastContainer toasts={toasts} onClose={(id) => removeToast(id)} />
 */
export function ToastContainer({ toasts = [], onClose }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => onClose?.(t.id)} />
      ))}
    </div>
  );
}
