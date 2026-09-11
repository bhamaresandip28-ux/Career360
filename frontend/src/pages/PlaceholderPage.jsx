import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

/**
 * PlaceholderPage — shown for all modules not yet implemented.
 * Receives the module name and target phase as props via route state or props.
 */
export default function PlaceholderPage({ title = 'Module', phase = 'Coming Soon' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in">
      <div className="mb-5 p-5 rounded-2xl bg-white/5 border border-white/10">
        <svg className="h-12 w-12 text-slate-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      </div>

      <Badge variant="slate" size="lg" className="mb-4">{phase}</Badge>

      <h2 className="font-display font-bold text-2xl text-white mb-2">{title}</h2>
      <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
        This module is not yet implemented. It will be built in a future development phase.
        Check back after the current phase is complete.
      </p>

      <div className="flex gap-3">
        <Button as={Link} variant="primary" size="sm" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="secondary" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
