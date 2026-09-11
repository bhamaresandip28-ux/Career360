import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function CoordinatorDashboard() {
  const { currentUser } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getPlacementAnalytics();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load placement analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Gathering placement pipeline & analytics...</p>
      </div>
    );
  }

  const {
    totalCompanies = 0,
    totalJobs = 0,
    totalApplications = 0,
    drivesByStatus = {},
    funnel = {},
    salaryStats = { highest: 0, lowest: 0, average: 0 },
    companies = [],
    recentApplications = [],
    outcomes = [],
  } = data || {};

  const totalDrives = Object.values(drivesByStatus).reduce((a, b) => a + b, 0);
  const totalOffers = (funnel.OFFERED || 0) + (funnel.ACCEPTED || 0);

  // Funnel steps calculation
  const funnelSteps = [
    { label: 'Applications', count: totalApplications, color: 'from-blue-500 to-indigo-600' },
    { label: 'Shortlisted',   count: funnel.SHORTLISTED || 0, color: 'from-cyan-500 to-blue-500' },
    { label: 'In Interview',  count: funnel.INTERVIEW_SCHEDULED || 0, color: 'from-amber-500 to-orange-500' },
    { label: 'Offers Issued', count: totalOffers, color: 'from-emerald-500 to-teal-500' },
    { label: 'Accepted',      count: outcomes.length, color: 'from-primary-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Welcome ─────────────────────────────────────────────────── */}
      <div className="glass p-6 bg-gradient-card border border-warning-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-warning-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🚀</span>
              <p className="text-warning-400 text-xs font-semibold uppercase tracking-wider">Placement Operations Command</p>
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              Welcome, {currentUser?.name} 👋
            </h2>
            <p className="text-slate-400 text-sm">
              Drive management, candidate conversion pipeline, and campus recruitment intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/coordinator/drives">
              <Button variant="primary" size="sm">
                + Schedule Drive
              </Button>
            </Link>
            <Link to="/coordinator/companies">
              <Button variant="secondary" size="sm">
                + Add Company
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Key Metrics Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ACTIVE DRIVES</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{drivesByStatus.ACTIVE || 0}</p>
          <p className="text-xs text-slate-500 mt-1">{totalDrives} total campus drives</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>TOTAL CANDIDATES</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalApplications}</p>
          <p className="text-xs text-slate-500 mt-1">Applications across all drives</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>OFFERS SECURED</span>
            <span className="text-lg">🏆</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">{outcomes.length}</p>
          <p className="text-xs text-slate-500 mt-1">Verified selections accepted</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AVG PACKAGE (CTC)</span>
            <span className="text-lg">💼</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">
            {salaryStats.average ? `${salaryStats.average} LPA` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Max: {salaryStats.highest ? `${salaryStats.highest} LPA` : '—'}
          </p>
        </div>
      </div>

      {/* ── Funnel & Pipeline ─────────────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Recruitment Conversion Funnel</Card.Title>
              <Card.Description>Visual progression from application submission to accepted job offers</Card.Description>
            </div>
            <Link to="/coordinator/applications" className="text-xs text-primary-400 hover:underline">
              Manage Pipeline →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {funnelSteps.map((step, idx) => {
              const prevCount = idx === 0 ? totalApplications : funnelSteps[idx - 1].count;
              const rate = prevCount > 0 ? Math.round((step.count / prevCount) * 100) : 0;
              return (
                <div key={step.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">{step.label}</span>
                    <p className="text-2xl font-bold text-white mt-1">{step.count}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Conversion</span>
                      <span className="font-semibold text-slate-200">{idx === 0 ? '100%' : `${rate}%`}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                        style={{ width: `${Math.min(100, Math.max(8, rate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* ── Two Column: Recent Applications & Top Companies ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Recent Drive Applicants</Card.Title>
                  <Card.Description>Students who recently submitted applications</Card.Description>
                </div>
                <Link to="/coordinator/applications" className="text-xs text-primary-400 hover:underline">
                  View All ({totalApplications})
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentApplications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No applications recorded yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
                          {app.student?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{app.student?.name}</p>
                          <p className="text-xs text-slate-400">
                            {app.drive?.company?.name} • <span className="text-slate-300">{app.drive?.job?.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            app.status === 'OFFERED' || app.status === 'ACCEPTED' ? 'success' :
                            app.status === 'INTERVIEW_SCHEDULED' ? 'warning' :
                            app.status === 'SHORTLISTED' ? 'primary' :
                            app.status === 'REJECTED' ? 'danger' : 'slate'
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                        <span className="text-[11px] text-slate-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Hiring Partners */}
        <div>
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Recruiting Partners</Card.Title>
                  <Card.Description>{companies.length} Registered Companies</Card.Description>
                </div>
                <Link to="/coordinator/companies" className="text-xs text-primary-400 hover:underline">
                  Browse →
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {companies.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No companies registered yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {companies.slice(0, 5).map((comp) => (
                    <div key={comp.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{comp.name}</p>
                        <p className="text-xs text-slate-400">{comp.industry}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-primary-400 font-semibold">{comp._count?.drives || 0} drives</span>
                        <p className="text-[11px] text-slate-500">{comp._count?.jobs || 0} roles</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
