import { clsx } from 'clsx';

/**
 * Loading — Career360 loading spinner.
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
          'rounded-full border-slate-200 border-t-[#0A4174] animate-spin',
          sizes[size],
        )}
      />
      {label && <p className="text-sm text-[#001D39] font-medium animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
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
