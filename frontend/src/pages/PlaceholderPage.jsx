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
      <div className="mb-5 p-5 rounded-2xl bg-white border border-[#BDD8E9]/70 shadow-sm">
        <svg className="h-12 w-12 text-[#49769F] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      </div>

      <Badge variant="primary" size="lg" className="mb-4">{phase}</Badge>

      <h2 className="font-display font-bold text-2xl text-[#001D39] mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
        This module is in development. It will be updated soon.
      </p>

      <div className="flex gap-3">
        <Button as={Link} variant="outline" size="sm" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Link to="/student/dashboard">
          <Button variant="primary" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
