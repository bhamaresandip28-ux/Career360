import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getFacultyAnalytics();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load faculty monitoring metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Evaluating student academic performance & early warning indicators...</p>
      </div>
    );
  }

  const {
    totalStudents = 0,
    classAvgCgpa = 0,
    avgAttendance = 0,
    tiers = { distinction: 0, firstClass: 0, secondClass: 0, atRisk: 0 },
    atRiskCount = 0,
    atRiskStudents = [],
    departments = [],
  } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div className="glass p-6 bg-gradient-card border border-success-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-success-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎓</span>
              <p className="text-success-400 text-xs font-semibold uppercase tracking-wider">Faculty Academic Monitoring Portal</p>
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              Welcome, {currentUser?.name} 👋
            </h2>
            <p className="text-slate-400 text-sm">
              Scholastic progress tracking, attendance shortfall detection, and proactive student intervention.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/faculty/early-warning">
              <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-danger-500/20 text-danger-400 border border-danger-500/30 hover:bg-danger-500/30 transition-colors inline-flex items-center gap-1.5">
                <span>⚠️</span> Early Warning Triage ({atRiskCount})
              </span>
            </Link>
            <Link to="/faculty/students">
              <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5">
                <span>👥</span> View Student Roster
              </span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Metric Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>MONITORED STUDENTS</span>
            <span className="text-lg">📚</span>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalStudents}</p>
          <p className="text-xs text-slate-500 mt-1">{departments.length} department(s) active</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>CLASS AVERAGE CGPA</span>
            <span className="text-lg">📊</span>
          </div>
          <p className="text-2xl font-bold text-primary-400 tracking-tight">
            {classAvgCgpa ? `${classAvgCgpa} / 10` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all academic semesters</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AVG ATTENDANCE</span>
            <span className="text-lg">⏱️</span>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${avgAttendance < 75 ? 'text-danger-400' : 'text-emerald-400'}`}>
            {avgAttendance ? `${avgAttendance}%` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Minimum mandatory threshold: 75%</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AT-RISK SHORTFALLS</span>
            <span className="text-lg">🚨</span>
          </div>
          <p className="text-2xl font-bold text-danger-400 tracking-tight">{atRiskCount}</p>
          <p className="text-xs text-slate-500 mt-1">Needs immediate mentorship</p>
        </div>
      </div>

      {/* ── Scholastic Distribution & Tiers ───────────────────────────────── */}
      <Card>
        <Card.Header>
          <Card.Title>Academic Performance Tier Breakdown</Card.Title>
          <Card.Description>Grade and GPA tier distribution across active student cohorts</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Distinction (≥ 8.5)</span>
              <p className="text-2xl font-bold text-white mt-1">{tiers.distinction}</p>
              <p className="text-xs text-slate-400 mt-1">Top placement candidates</p>
            </div>

            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">First Class (7.0 - 8.49)</span>
              <p className="text-2xl font-bold text-white mt-1">{tiers.firstClass}</p>
              <p className="text-xs text-slate-400 mt-1">Strong scholastic track</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Second Class (6.0 - 6.99)</span>
              <p className="text-2xl font-bold text-white mt-1">{tiers.secondClass}</p>
              <p className="text-xs text-slate-400 mt-1">Eligible for standard drives</p>
            </div>

            <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20">
              <span className="text-xs font-semibold text-danger-400 uppercase tracking-wide">Academic Risk (&lt; 6.0)</span>
              <p className="text-2xl font-bold text-danger-400 mt-1">{tiers.atRisk}</p>
              <p className="text-xs text-slate-400 mt-1">Remedial support required</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ── Early Warning Alert Desk ───────────────────────────────────────── */}
      <Card className="border-danger-500/20">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <Card.Title>Early Warning System: Students Requiring Intervention</Card.Title>
                <Card.Description>Flagged for attendance shortfall (&lt;75%), low CGPA (&lt;6.0), or active backlogs</Card.Description>
              </div>
            </div>
            <Link to="/faculty/early-warning" className="text-xs text-primary-400 hover:underline">
              Open Triage Desk →
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {atRiskStudents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              🎉 No students currently flagged for academic or attendance shortfalls.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {atRiskStudents.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      s.severity === 'HIGH' ? 'bg-danger-500/20 text-danger-400' : 'bg-warning-500/20 text-warning-400'
                    }`}>
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-slate-400">
                        Roll: <strong className="text-slate-300">{s.rollNumber}</strong> • Dept: {s.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {s.riskReasons.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-danger-500/10 text-danger-400 border border-danger-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                    <Badge variant={s.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {s.severity} RISK
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
