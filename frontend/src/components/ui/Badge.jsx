import { clsx } from 'clsx';

const variants = {
  primary:  'bg-primary-500/20  text-primary-300  border border-primary-500/30',
  success:  'bg-accent-500/20   text-accent-300   border border-accent-500/30',
  warning:  'bg-warning-500/20  text-warning-300  border border-warning-500/30',
  danger:   'bg-danger-500/20   text-danger-300   border border-danger-500/30',
  purple:   'bg-purple-500/20   text-purple-300   border border-purple-500/30',
  slate:    'bg-slate-500/20    text-slate-300    border border-slate-500/30',
  default:  'bg-white/10        text-slate-200    border border-white/15',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/**
 * Badge — small inline tag/label component.
 */
export default function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  dot       = false,
  className = '',
}) {
  return (
    <span className={clsx('badge', variants[variant], sizes[size], className)}>
      {dot && (
        <span className={clsx(
          'inline-block w-1.5 h-1.5 rounded-full',
          {
            'bg-primary-400': variant === 'primary',
            'bg-accent-400':  variant === 'success',
            'bg-warning-400': variant === 'warning',
            'bg-danger-400':  variant === 'danger',
            'bg-purple-400':  variant === 'purple',
            'bg-slate-400':   variant === 'slate',
            'bg-white':       variant === 'default',
          }
        )} />
      )}
      {children}
    </span>
  );
}
