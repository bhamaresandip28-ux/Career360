import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Select — Career360 dropdown select component.
 * Features: Clean white background, #001D39 text, #0A4174 focus ring, #BDD8E9 hover border.
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
        <label htmlFor={id} className="text-sm font-medium text-[#001D39]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          className={clsx(
            'w-full appearance-none rounded-xl bg-white border text-sm text-[#001D39] shadow-sm',
            'px-4 py-2.5 pr-10 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#0A4174]/20 focus:border-[#0A4174]',
            error
              ? 'border-red-500 bg-red-50/40 text-red-900'
              : 'border-slate-200 hover:border-[#BDD8E9]',
            disabled && 'opacity-50 bg-slate-50 cursor-not-allowed',
          )}
          {...props}
        >
          <option value="" disabled className="bg-white text-slate-400">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value ?? opt}
              value={opt.value ?? opt}
              className="bg-white text-[#001D39]"
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#49769F]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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

export default Select;
