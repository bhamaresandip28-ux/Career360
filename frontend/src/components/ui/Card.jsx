import { clsx } from 'clsx';

/**
 * Card — glass-morphism surface card component.
 */
export default function Card({
  children,
  className   = '',
  hover       = false,
  padding     = true,
  border      = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl bg-white/5 backdrop-blur-sm',
        border && 'border border-white/10',
        padding && 'p-5',
        hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-card-hover cursor-pointer',
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
    <h3 className={clsx('text-base font-semibold text-white', className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={clsx('text-xs text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={clsx('text-slate-300', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-white/10 flex items-center gap-3', className)}>
      {children}
    </div>
  );
};
