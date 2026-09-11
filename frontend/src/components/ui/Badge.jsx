import { clsx } from 'clsx';

const variants = {
  primary:   'bg-[#E1EFF8] text-[#0A4174] border border-[#BDD8E9]',
  navy:      'bg-[#001D39] text-white border border-[#001D39]',
  slate:     'bg-[#49769F]/15 text-[#49769F] border border-[#49769F]/30',
  teal:      'bg-[#4E8EA2]/15 text-[#4E8EA2] border border-[#4E8EA2]/30',
  sky:       'bg-[#7BBDE8]/25 text-[#0A4174] border border-[#7BBDE8]/50',
  lightBlue: 'bg-[#BDD8E9]/40 text-[#001D39] border border-[#BDD8E9]',
  success:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:   'bg-amber-50 text-amber-700 border border-amber-200',
  danger:    'bg-red-50 text-red-700 border border-red-200',
  purple:    'bg-[#E1EFF8] text-[#0A4174] border border-[#BDD8E9]', // Mapped to primary palette
  default:   'bg-slate-100 text-slate-700 border border-slate-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/**
 * Badge — inline status tag component using the Career360 palette.
 */
export default function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  dot       = false,
  className = '',
}) {
  return (
    <span className={clsx('badge inline-flex items-center gap-1.5 font-medium rounded-full', variants[variant] || variants.default, sizes[size], className)}>
      {dot && (
        <span className={clsx(
          'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
          {
            'bg-[#0A4174]': variant === 'primary' || variant === 'purple',
            'bg-[#001D39]': variant === 'navy',
            'bg-[#4E8EA2]': variant === 'teal',
            'bg-[#7BBDE8]': variant === 'sky',
            'bg-emerald-500': variant === 'success',
            'bg-amber-500':   variant === 'warning',
            'bg-red-500':     variant === 'danger',
            'bg-slate-400':   variant === 'default' || variant === 'slate',
          }
        )} />
      )}
      {children}
    </span>
  );
}
