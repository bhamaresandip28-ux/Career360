import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import ProgressBar from '../components/ui/ProgressBar';
import { healthCheck } from '../services/api';

// ─── Phase roadmap ────────────────────────────────────────────────────────────
const PHASES = [
  { phase: 'Phase 0', title: 'Project Foundation',    status: 'active',   progress: 100 },
  { phase: 'Phase 1', title: 'Authentication & RBAC', status: 'pending',  progress: 0 },
  { phase: 'Phase 2', title: 'Academic Management',   status: 'pending',  progress: 0 },
  { phase: 'Phase 3', title: 'Skills & Projects',     status: 'pending',  progress: 0 },
  { phase: 'Phase 4', title: 'Career Intelligence',   status: 'pending',  progress: 0 },
  { phase: 'Phase 5', title: 'Placement Portal',      status: 'pending',  progress: 0 },
  { phase: 'Phase 6', title: 'Preparation Hub',       status: 'pending',  progress: 0 },
  { phase: 'Phase 7', title: 'Analytics & Reports',   status: 'pending',  progress: 0 },
];

const STATUS_BADGE = {
  active:    { variant: 'success', label: 'Active' },
  pending:   { variant: 'slate',   label: 'Pending' },
  completed: { variant: 'primary', label: 'Completed' },
};

export default function DashboardPage() {
  const [health, setHealth]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthCheck();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Unable to reach the backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="glass p-6 bg-gradient-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              Welcome to Career<span className="text-primary-400">360</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              You are currently in <strong className="text-white">Phase 0 — Foundation</strong>.
              The application structure, backend API, and database layer are being established.
              Modules will be unlocked as development phases complete.
            </p>
          </div>
          <Badge variant="success" size="lg" dot>Foundation Active</Badge>
        </div>
      </div>

      {/* ── API Status ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Frontend status */}
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent-500/15">
                <svg className="h-5 w-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Frontend</span>
            </div>
            <Badge variant="success" dot>Running</Badge>
            <p className="text-xs text-slate-500 mt-2">React + Vite + Tailwind CSS</p>
          </Card>

          {/* Backend status */}
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-500/15">
                <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Backend API</span>
            </div>
            {loading ? (
              <Loading size="sm" label="Checking..." />
            ) : error ? (
              <Badge variant="danger" dot>Offline</Badge>
            ) : (
              <Badge variant="success" dot>
                {health?.data?.status === 'ok' ? 'Running' : 'Unknown'}
              </Badge>
            )}
            <p className="text-xs text-slate-500 mt-2">Express.js + Node.js</p>
          </Card>

          {/* Database status */}
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/15">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Database</span>
            </div>
            {loading ? (
              <Loading size="sm" label="Checking..." />
            ) : (
              <Badge
                variant={health?.data?.database?.status === 'connected' ? 'success' : 'warning'}
                dot
              >
                {health?.data?.database?.status === 'connected'
                  ? 'Connected'
                  : health?.data?.database?.status === 'not_configured'
                  ? 'Not Configured'
                  : 'Disconnected'}
              </Badge>
            )}
            <p className="text-xs text-slate-500 mt-2">PostgreSQL + Prisma ORM</p>
          </Card>
        </div>

        {/* API error banner */}
        {error && (
          <div className="mt-4">
            <ErrorState
              title="Backend API Unreachable"
              message={error}
              code="API_CONNECTION_FAILED"
              onRetry={fetchHealth}
            />
          </div>
        )}

        {/* Health details */}
        {health && !loading && (
          <Card className="mt-4">
            <Card.Header>
              <Card.Title>API Health Response</Card.Title>
            </Card.Header>
            <Card.Body>
              <pre className="text-xs text-accent-300 font-mono bg-black/30 rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(health.data, null, 2)}
              </pre>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* ── Phase Roadmap ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Development Roadmap
        </h3>
        <Card>
          <div className="space-y-4">
            {PHASES.map((p, i) => {
              const badge = STATUS_BADGE[p.status];
              return (
                <div key={p.phase} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-400 font-mono">{i}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">{p.title}</span>
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                    </div>
                    <ProgressBar value={p.progress} size="xs" showValue={false} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono flex-shrink-0">{p.phase}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

    </div>
  );
}
