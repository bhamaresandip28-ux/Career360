import { clsx } from 'clsx';

/**
 * Career360 Card Component:
 * - Clean white background
 * - Professional subtle border with #BDD8E9 tone
 * - Soft shadow
 * - Primary dark #001D39 headings
 */
export default function Card({
  children,
  className   = '',
  hover       = false,
  padding     = true,
  border      = true,
  highlighted = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-200',
        highlighted ? 'bg-[#BDD8E9]/20 border border-[#BDD8E9]' : 'bg-white shadow-sm',
        border && !highlighted && 'border border-[#BDD8E9]/70',
        padding && 'p-5',
        hover && 'hover:border-[#0A4174]/40 hover:shadow-card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-base font-semibold text-[#001D39]', className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={clsx('text-xs text-slate-500 mt-1 leading-relaxed', className)}>
      {children}
    </p>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={clsx('text-slate-700', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-3 border-t border-slate-100 flex items-center justify-between', className)}>
      {children}
    </div>
  );
};
