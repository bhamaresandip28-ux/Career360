import Button from './Button';

/**
 * ErrorState — displayed when a page or section encounters an error.
 */
export default function ErrorState({
  title    = 'Something went wrong',
  message  = 'An unexpected error occurred. Please try again.',
  code     = null,
  onRetry  = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 p-4 rounded-full bg-danger-500/10 text-danger-400">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {code && <p className="text-xs font-mono text-danger-400 mb-2 bg-danger-500/10 px-2 py-0.5 rounded">{code}</p>}
      <p className="text-sm text-slate-400 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
