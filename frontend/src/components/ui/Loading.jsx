import { clsx } from 'clsx';

/**
 * Loading — full-screen or inline loading spinner.
 */
export default function Loading({ fullScreen = false, size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm:  'h-5 w-5 border-2',
    md:  'h-8 w-8 border-2',
    lg:  'h-12 w-12 border-[3px]',
    xl:  'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={clsx(
          'rounded-full border-white/10 border-t-primary-500 animate-spin',
          sizes[size],
        )}
      />
      {label && <p className="text-sm text-slate-400 animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/90 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
