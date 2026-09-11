import { clsx } from 'clsx';

/**
 * Career360 Official Button System:
 * - Primary:   Background #0A4174, Text #FFFFFF, Hover #001D39
 * - Secondary: Background #49769F, Text #FFFFFF, Hover #0A4174
 * - Outline:   Border #0A4174, Text #0A4174, Hover Background #0A4174, Text #FFFFFF
 * - Ghost:     Transparent, Hover #BDD8E9/30, Text #0A4174
 */
const variants = {
  primary:   'bg-[#0A4174] hover:bg-[#001D39] text-[#FFFFFF] shadow-sm hover:shadow-md border border-[#0A4174]',
  secondary: 'bg-[#49769F] hover:bg-[#0A4174] text-[#FFFFFF] shadow-sm border border-[#49769F]',
  outline:   'bg-transparent hover:bg-[#0A4174] text-[#0A4174] hover:text-[#FFFFFF] border border-[#0A4174] transition-colors',
  ghost:     'bg-transparent hover:bg-[#BDD8E9]/30 text-[#0A4174] hover:text-[#001D39] border border-transparent',
  teal:      'bg-[#4E8EA2] hover:bg-[#49769F] text-[#FFFFFF] shadow-sm',
  sky:       'bg-[#7BBDE8] hover:bg-[#0A4174] text-[#001D39] hover:text-[#FFFFFF] shadow-sm',
  danger:    'bg-danger-600 hover:bg-danger-700 text-white border border-danger-600',
  success:   'bg-accent-600 hover:bg-accent-700 text-white border border-accent-600',
  gradient:  'bg-gradient-to-r from-[#001D39] to-[#0A4174] text-white hover:from-[#0A4174] hover:to-[#001D39] shadow-sm',
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
 * @param {'primary'|'secondary'|'outline'|'ghost'|'teal'|'sky'|'danger'|'success'|'gradient'} variant
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
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A4174] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'active:scale-[0.98]',
        variants[variant] || variants.primary,
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
