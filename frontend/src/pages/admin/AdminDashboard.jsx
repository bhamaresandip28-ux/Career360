import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [overview, setOverview]         = useState(null);
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, deptRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getDepartmentAnalytics(),
      ]);
      setOverview(ovRes);
      setDepartments(deptRes || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load administrative platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Aggregating campus-wide institutional intelligence...</p>
      </div>
    );
  }

  const {
    totalUsers = 0,
    roles = { STUDENT: 0, FACULTY: 0, PLACEMENT_COORDINATOR: 0, ADMIN: 0 },
    activeDrivesCount = 0,
    totalApplications = 0,
    totalOffers = 0,
    avgPackage = 0,
    departmentsCount = 0,
    avgCgpa = 0,
    placementRate = 0,
  } = overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div className="glass p-6 bg-gradient-card border border-danger-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-danger-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🛡️</span>
              <p className="text-danger-400 text-xs font-semibold uppercase tracking-wider">Institution Central Administration</p>
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              Welcome, {currentUser?.name} 👋
            </h2>
            <p className="text-slate-400 text-sm">
              Comprehensive platform oversight, user role access management, and departmental academic metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/users">
              <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5">
                <span>👥</span> User Management ({totalUsers})
              </span>
            </Link>
            <Link to="/admin/departments">
              <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600/30 transition-colors inline-flex items-center gap-1.5">
                <span>🏢</span> Departments ({departmentsCount})
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

      {/* ── Key KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>TOTAL REGISTERED USERS</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalUsers}</p>
          <p className="text-xs text-slate-500 mt-1">Across 4 system roles</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>CAMPUS PLACEMENT RATE</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">{placementRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{totalOffers} offers accepted</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>INSTITUTION AVG CGPA</span>
            <span className="text-lg">📊</span>
          </div>
          <p className="text-2xl font-bold text-primary-400 tracking-tight">
            {avgCgpa ? `${avgCgpa} / 10` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Scholastic baseline</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ACTIVE RECRUITMENT DRIVES</span>
            <span className="text-lg">💼</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">{activeDrivesCount}</p>
          <p className="text-xs text-slate-500 mt-1">Avg package: {avgPackage} LPA</p>
        </div>
      </div>

      {/* ── User Distribution by Role ─────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Account Distribution by Role</Card.Title>
              <Card.Description>Role-based access partitioning across platform accounts</Card.Description>
            </div>
            <Link to="/admin/users" className="text-xs text-primary-400 hover:underline">
              Manage Accounts →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', count: roles.STUDENT, icon: '🎓', color: 'from-blue-500 to-indigo-600', badge: 'STUDENT' },
              { label: 'Faculty Members', count: roles.FACULTY, icon: '👨‍🏫', color: 'from-emerald-500 to-teal-600', badge: 'FACULTY' },
              { label: 'Placement Coordinators', count: roles.PLACEMENT_COORDINATOR, icon: '🎯', color: 'from-amber-500 to-orange-600', badge: 'COORDINATOR' },
              { label: 'Administrators', count: roles.ADMIN, icon: '🛡️', color: 'from-danger-500 to-rose-600', badge: 'ADMIN' },
            ].map((r) => {
              const pct = totalUsers > 0 ? Math.round((r.count / totalUsers) * 100) : 0;
              return (
                <div key={r.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{r.icon}</span>
                    <Badge variant="slate" size="sm">{r.badge}</Badge>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">{r.label}</span>
                    <p className="text-2xl font-bold text-white mt-0.5">{r.count}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Proportion</span>
                    <span className="font-semibold text-slate-200">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* ── Department Scholastic & Enrollment Breakdown ──────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Departmental Scholastic & Enrollment Matrix</Card.Title>
              <Card.Description>Academic performance and student cohort breakdown per engineering department</Card.Description>
            </div>
            <Link to="/admin/departments" className="text-xs text-primary-400 hover:underline">
              Configure Departments →
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-3">Department Code</th>
                <th className="px-5 py-3">Department Name</th>
                <th className="px-4 py-3">Enrolled Students</th>
                <th className="px-4 py-3">Subject Offerings</th>
                <th className="px-4 py-3">Batches</th>
                <th className="px-5 py-3">Department Avg CGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-primary-400 text-xs">{d.code}</td>
                  <td className="px-5 py-3.5 font-medium text-white text-xs">{d.name}</td>
                  <td className="px-4 py-3.5 text-xs text-white">{d.studentCount} students</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{d.subjectCount} courses</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{d.batchCount} batches</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-emerald-400">
                      {d.avgCgpa ? `${d.avgCgpa.toFixed(2)} / 10` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </div>
  );
}
