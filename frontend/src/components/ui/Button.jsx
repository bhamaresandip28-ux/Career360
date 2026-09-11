import { clsx } from 'clsx';

const variants = {
  primary:  'bg-primary-600 hover:bg-primary-500 text-white shadow-glow hover:shadow-glow-lg border border-primary-500/50',
  secondary:'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30',
  ghost:    'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent',
  danger:   'bg-danger-600 hover:bg-danger-500 text-white border border-danger-500/50',
  success:  'bg-accent-600 hover:bg-accent-500 text-white border border-accent-500/50',
  gradient: 'bg-gradient-brand text-white shadow-glow hover:shadow-glow-lg border-0',
};

const sizes = {
  xs:  'px-2.5 py-1   text-xs  gap-1',
  sm:  'px-3.5 py-1.5 text-sm  gap-1.5',
  md:  'px-5   py-2.5 text-sm  gap-2',
  lg:  'px-6   py-3   text-base gap-2',
  xl:  'px-8   py-4   text-lg  gap-2.5',
};

/**
 * Button — reusable Career360 button component.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'|'gradient'} variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export default function Button({
  children,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  fullWidth  = false,
  leftIcon   = null,
  rightIcon  = null,
  className  = '',
  type       = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
        'active:scale-[0.97]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
