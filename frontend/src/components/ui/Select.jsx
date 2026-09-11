import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Select — reusable dropdown select component.
 */
const Select = forwardRef(function Select({
  label,
  id,
  options    = [],
  placeholder = 'Select an option',
  error       = '',
  hint        = '',
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
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          className={clsx(
            'w-full appearance-none rounded-xl bg-white/5 border text-sm text-white',
            'px-4 py-2.5 pr-10 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            error
              ? 'border-danger-500 bg-danger-500/5'
              : 'border-white/10 hover:border-white/20',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          {...props}
        >
          <option value="" disabled className="bg-surface-900 text-slate-400">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value ?? opt}
              value={opt.value ?? opt}
              className="bg-surface-900 text-white"
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && <p className="text-xs text-danger-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Select;
