import { useState, useEffect } from 'react';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function FacultyEarlyWarningPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [counseled, setCounseled] = useState(new Set());

  const fetchWarningData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getFacultyAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarningData();
  }, []);

  const atRiskStudents = data?.atRiskStudents || [];

  const handleMarkCounseled = (studentId) => {
    setCounseled((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const filtered = atRiskStudents.filter((s) => {
    if (filter === 'ALL') return true;
    if (filter === 'HIGH') return s.severity === 'HIGH';
    if (filter === 'ATTENDANCE') return s.riskReasons.some(r => r.includes('Attendance'));
    if (filter === 'CGPA') return s.riskReasons.some(r => r.includes('CGPA'));
    if (filter === 'BACKLOGS') return s.riskReasons.some(r => r.includes('Backlog'));
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🚨</span>
          <h2 className="font-display font-bold text-2xl text-white">Early Warning Triage Desk</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Real-time intervention cockpit for students failing institutional academic or attendance thresholds.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
        {[
          { id: 'ALL', label: 'All Flagged' },
          { id: 'HIGH', label: 'High Severity' },
          { id: 'ATTENDANCE', label: 'Attendance Shortfalls (<75%)' },
          { id: 'CGPA', label: 'Low CGPA (<6.0)' },
          { id: 'BACKLOGS', label: 'Active Backlogs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">🎉</span>
            <p className="text-white font-medium mt-3">No students found matching this criteria</p>
            <p className="text-slate-400 text-sm mt-1">All monitored students meet institutional standards for this category.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((s) => {
            const isCounseled = counseled.has(s.id);
            return (
              <Card key={s.id} className="border-danger-500/30 hover:border-danger-500/50 transition-all flex flex-col justify-between">
                <Card.Body>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-danger-500/20 text-danger-400 flex items-center justify-center font-bold text-base">
                        {s.name[0]}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white">{s.name}</h3>
                        <p className="text-xs text-slate-400">
                          Roll: <strong className="text-slate-200">{s.rollNumber}</strong> • Dept: {s.department}
                        </p>
                      </div>
                    </div>
                    <Badge variant={s.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {s.severity} RISK
                    </Badge>
                  </div>

                  {/* Shortfall Reason Pills */}
                  <div className="space-y-2 my-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Identified Risk Factors:</span>
                    <div className="flex flex-col gap-1.5">
                      {s.riskReasons.map((reason, i) => (
                        <div key={i} className="p-2 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-300 text-xs flex items-center gap-2">
                          <span>⚠️</span>
                          <span className="font-medium">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scholastic Metrics Snapshot */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Current CGPA</span>
                      <span className={`font-bold ${s.cgpa < 6.0 ? 'text-danger-400' : 'text-white'}`}>
                        {s.cgpa ? `${s.cgpa.toFixed(2)}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Attendance</span>
                      <span className={`font-bold ${s.avgAttendance < 75 ? 'text-danger-400' : 'text-emerald-400'}`}>
                        {s.avgAttendance ? `${s.avgAttendance}%` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Backlogs</span>
                      <span className={`font-bold ${s.activeBacklogs > 0 ? 'text-danger-400' : 'text-white'}`}>
                        {s.activeBacklogs || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action Intervention */}
                  <div className="mt-4 pt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Email: <a href={`mailto:${s.email}`} className="text-primary-400 hover:underline">{s.email}</a>
                    </span>
                    <Button
                      variant={isCounseled ? 'success' : 'secondary'}
                      size="sm"
                      onClick={() => handleMarkCounseled(s.id)}
                    >
                      {isCounseled ? '✓ Intervention Logged' : 'Log Counseling'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
