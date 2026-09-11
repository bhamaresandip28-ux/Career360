import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Input — reusable text/email/password input component.
 */
const Input = forwardRef(function Input({
  label,
  id,
  type        = 'text',
  placeholder = '',
  error       = '',
  hint        = '',
  leftIcon    = null,
  rightIcon   = null,
  disabled    = false,
  required    = false,
  className   = '',
  ...props
}, ref) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            'w-full rounded-xl bg-white/5 border text-sm text-white placeholder-slate-500',
            'px-4 py-2.5 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            leftIcon  && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-danger-500 bg-danger-500/5'
              : 'border-white/10 hover:border-white/20',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Input;
