import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Input — Career360 form input component.
 * Features: White background, Dark Navy text, #0A4174 focus ring, #BDD8E9 hover border.
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
        <label htmlFor={id} className="text-sm font-medium text-[#001D39]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#49769F]">
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
            'w-full rounded-xl bg-white border text-sm text-[#001D39] placeholder-slate-400 shadow-sm',
            'px-4 py-2.5 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#0A4174]/20 focus:border-[#0A4174]',
            leftIcon  && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-red-500 bg-red-50/40 text-red-900'
              : 'border-slate-200 hover:border-[#BDD8E9]',
            disabled && 'opacity-50 bg-slate-50 cursor-not-allowed',
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center text-[#49769F]">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-0.5">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      )}
    </div>
  );
});

export default Input;
