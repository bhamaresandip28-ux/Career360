import { clsx } from 'clsx';

/**
 * ProgressBar — animated progress indicator.
 */
export default function ProgressBar({
  value       = 0,
  max         = 100,
  label       = '',
  showValue   = true,
  size        = 'md',
  color       = 'primary',
  animated    = true,
  className   = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colors = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-400',
    success: 'bg-gradient-to-r from-accent-600  to-accent-400',
    warning: 'bg-gradient-to-r from-warning-600 to-warning-400',
    danger:  'bg-gradient-to-r from-danger-600  to-danger-400',
    purple:  'bg-gradient-to-r from-purple-600  to-purple-400',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-300 ml-auto">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <div className={clsx('w-full bg-white/10 rounded-full overflow-hidden', heights[size])}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color],
            animated && 'relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_infinite]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
