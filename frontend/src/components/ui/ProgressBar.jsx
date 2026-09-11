import { clsx } from 'clsx';

/**
 * ProgressBar — Career360 progress indicator.
 * Palette: Primary Blue (#0A4174), Slate (#49769F), Teal (#4E8EA2), Sky Blue (#7BBDE8).
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
    primary:   'bg-[#0A4174]',
    secondary: 'bg-[#49769F]',
    teal:      'bg-[#4E8EA2]',
    sky:       'bg-[#7BBDE8]',
    success:   'bg-emerald-600',
    warning:   'bg-amber-500',
    danger:    'bg-red-500',
    purple:    'bg-[#0A4174]', // Replaced purple with primary brand blue
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-[#0A4174] ml-auto">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <div className={clsx('w-full bg-[#BDD8E9]/30 rounded-full overflow-hidden', heights[size])}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color] || colors.primary,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
