import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  Building,
  CheckCircle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import reportService from '../../services/report.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function CoordinatorReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await reportService.getPlacementSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load placement report', err);
      setError('Failed to aggregate placement analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (type) => {
    setExporting(true);
    try {
      await reportService.downloadCSV(type);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Error downloading CSV export. Please check coordinator permissions.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-warning-500/20 border-t-warning-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Aggregating campus placement metrics & conversion stats...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-400 mb-3">{error || 'No report data available'}</p>
        <Button variant="secondary" onClick={fetchReport}>Retry</Button>
      </div>
    );
  }

  const { overview, departmentMetrics, recentOffers } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-surface-900 to-surface-850 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-warning-400" />
            Institutional Placement Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time cohort conversion analytics, compensation distributions, and official CSV data exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={exporting}
            onClick={() => handleExportCSV('roster')}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Roster CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={exporting}
            onClick={() => handleExportCSV('placements')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-primary-400" />
            Export Offers CSV
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Placement Conversion Rate</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                {overview.placementRate}%
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3 h-3" />
                {overview.placedCount} of {overview.totalStudents} Active Students Placed
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Package (CTC)</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                ₹{overview.avgCtcLpa} <span className="text-xs font-normal text-slate-400">LPA</span>
              </h3>
              <p className="text-[11px] text-primary-400 mt-1 flex items-center gap-1 font-medium">
                Highest: ₹{overview.highestCtcLpa} LPA
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Recruitment Drives</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                {overview.totalDrives}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Active campus hiring pipelines
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Applications</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                {overview.totalApplications}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Student drive submissions
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Department-Wise Placement Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-warning-400" />
              Department Conversion Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Placement velocity and conversion ratios across academic branches.
            </p>
          </div>
          <Badge variant="warning" size="sm">
            {departmentMetrics.length} Departments Tracked
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Branch Name</th>
                <th className="py-3 px-4 text-center">Enrolled</th>
                <th className="py-3 px-4 text-center">Placed</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {departmentMetrics.map((dept) => (
                <tr key={dept.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary-400">
                    {dept.code}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    {dept.name}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-mono">
                    {dept.totalStudents}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-mono font-semibold">
                    {dept.placedCount}
                  </td>
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-surface-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-warning-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${dept.placementRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white font-mono w-10 text-right">
                        {dept.placementRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Confirmed Offers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Latest Accepted Placement Offers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recent verified offer letters confirmed by students.
            </p>
          </div>
        </div>

        {recentOffers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No confirmed offers recorded yet for the ongoing academic cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Confirmation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOffers.map((offer, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {offer.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {offer.companyName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {offer.jobTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₹{offer.packageOffered} LPA
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(offer.acceptedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
